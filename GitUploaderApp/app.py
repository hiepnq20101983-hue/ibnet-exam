import sys
import os
import subprocess
from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QLabel, QLineEdit, QPushButton, QFileDialog, QPlainTextEdit,
    QFrame, QMessageBox, QProgressBar, QGroupBox
)
from PyQt6.QtCore import Qt, QThread, pyqtSignal, QProcess, QSettings
from PyQt6.QtGui import QFont, QIcon, QTextCursor, QColor, QPalette

class GitWorker(QThread):
    update_text = pyqtSignal(str)
    progress = pyqtSignal(int)
    finished_task = pyqtSignal(bool, str)

    def __init__(self, folder_path, repo_url, token, branch, commit_msg):
        super().__init__()
        self.folder_path = folder_path
        self.repo_url = repo_url.strip()
        self.token = token.strip()
        self.branch = branch if branch else "main"
        self.commit_msg = commit_msg if commit_msg else "Upload from GitUploader"

    def run(self):
        try:
            self.update_text.emit("🚀 Starting Git Upload Process...")
            self.progress.emit(10)
            
            if not os.path.exists(os.path.join(self.folder_path, ".git")):
                self.update_text.emit("Initializing git repository...")
                self.run_git(["init"])
            
            self.progress.emit(25)
            self.update_text.emit("Adding files...")
            self.run_git(["add", "."])
            
            self.progress.emit(40)
            self.update_text.emit(f"Committing changes: {self.commit_msg}")
            # Check if there's anything to commit
            status_proc = subprocess.run(["git", "status", "--porcelain"], cwd=self.folder_path, capture_output=True, text=True, creationflags=subprocess.CREATE_NO_WINDOW)
            if status_proc.stdout.strip():
                 self.run_git(["commit", "-m", self.commit_msg])
            else:
                 self.update_text.emit("Nothing to commit, directory is clean.")

            self.progress.emit(60)
            self.update_text.emit(f"Configuring remote and branch to '{self.branch}'...")
            # Check existing remotes
            remotes = subprocess.run(["git", "remote"], cwd=self.folder_path, capture_output=True, text=True, creationflags=subprocess.CREATE_NO_WINDOW).stdout.splitlines()
            
            # Prepare Auth URL if token is provided
            final_url = self.repo_url
            if self.token and ("github.com" in self.repo_url):
                 # Convert https://github.com/user/repo.git to https://token@github.com/user/repo.git
                 base_url = self.repo_url.replace("https://", "")
                 final_url = f"https://oauth2:{self.token}@{base_url}"

            if "origin" in remotes:
                self.run_git(["remote", "set-url", "origin", final_url])
            else:
                self.run_git(["remote", "add", "origin", final_url])
            
            # Ensure branch is created/switched
            self.run_git(["branch", "-M", self.branch])
            
            self.progress.emit(80)
            self.update_text.emit(f"Pushing to GitHub on branch '{self.branch}'...")
            
            # Run push
            self.run_git(["push", "-u", "origin", self.branch, "--force"])
            
            self.progress.emit(100)
            self.update_text.emit("\n✅ SUCCESS: Files pushed to GitHub!")
            self.finished_task.emit(True, "Upload completed successfully!")
            
        except Exception as e:
            self.update_text.emit(f"\n❌ ERROR: {str(e)}")
            self.finished_task.emit(False, str(e))

    def run_git(self, args):
        cmd = ["git"] + args
        process = subprocess.Popen(
            cmd,
            cwd=self.folder_path,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            creationflags=subprocess.CREATE_NO_WINDOW
        )
        stdout, stderr = process.communicate()
        if stdout:
            self.update_text.emit(stdout)
        if stderr:
            # git outputs transfer updates to stderr sometimes, which is not always failure.
            self.update_text.emit(stderr)
        if process.returncode != 0:
            # Special check for 'already exists' or minor warnings aren't failures, 
            # but actual failures should raise.
            if "commit" in args and "nothing to commit" in stderr.lower():
                pass
            elif "remote add" in args and "already exists" in stderr.lower():
                pass
            else:
                raise Exception(f"Git command failed: git {' '.join(args)}\nError: {stderr}")

class ModernGitUploader(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Smart Git Folder Uploader")
        self.resize(750, 600)
        
        # Initialize Settings
        self.settings = QSettings("GitUploaderApp", "Settings")
        
        self.setup_ui()
        self.apply_styles()
        self.load_settings()
        
    def setup_ui(self):
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QVBoxLayout(central_widget)
        main_layout.setContentsMargins(25, 25, 25, 25)
        main_layout.setSpacing(15)

        # --- Title Header ---
        title_label = QLabel("Git Folder Uploader")
        title_label.setObjectName("MainTitle")
        title_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        main_layout.addWidget(title_label)

        subtitle_label = QLabel("Modern, Simple & Fast GitHub Upload Tool")
        subtitle_label.setObjectName("SubTitle")
        subtitle_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        main_layout.addWidget(subtitle_label)

        # --- Form Section ---
        form_frame = QFrame()
        form_frame.setObjectName("FormContainer")
        form_layout = QVBoxLayout(form_frame)
        form_layout.setSpacing(12)
        
        # Folder Path
        local_layout = QHBoxLayout()
        self.folder_input = QLineEdit()
        self.folder_input.setPlaceholderText("Select Local Folder Path...")
        btn_browse = QPushButton("Browse")
        btn_browse.setCursor(Qt.CursorShape.PointingHandCursor)
        btn_browse.clicked.connect(self.browse_folder)
        local_layout.addWidget(self.folder_input, 8)
        local_layout.addWidget(btn_browse, 2)
        form_layout.addWidget(QLabel("Local Path:"))
        form_layout.addLayout(local_layout)

        # Repo URL
        self.repo_input = QLineEdit()
        self.repo_input.setPlaceholderText("https://github.com/username/repo.git")
        form_layout.addWidget(QLabel("GitHub Repository URL:"))
        form_layout.addWidget(self.repo_input)

        # Auth Token & Branch
        auth_layout = QHBoxLayout()
        
        v1 = QVBoxLayout()
        v1.addWidget(QLabel("GitHub Token (Optional for Private/Direct auth):"))
        self.token_input = QLineEdit()
        self.token_input.setEchoMode(QLineEdit.EchoMode.Password)
        self.token_input.setPlaceholderText("ghp_XXXXXXXXXXXXXXXXXXX")
        v1.addWidget(self.token_input)
        
        v2 = QVBoxLayout()
        v2.addWidget(QLabel("Target Branch:"))
        self.branch_input = QLineEdit("main")
        v2.addWidget(self.branch_input)
        
        auth_layout.addLayout(v1, 3)
        auth_layout.addLayout(v2, 1)
        form_layout.addLayout(auth_layout)

        # Commit Message
        self.commit_input = QLineEdit("Initial upload via Git Uploader")
        form_layout.addWidget(QLabel("Commit Message:"))
        form_layout.addWidget(self.commit_input)

        main_layout.addWidget(form_frame)

        # --- Action Button ---
        self.upload_btn = QPushButton("🚀 UPLOAD TO GITHUB")
        self.upload_btn.setObjectName("UploadButton")
        self.upload_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.upload_btn.clicked.connect(self.start_upload)
        main_layout.addWidget(self.upload_btn)

        # --- Progress & Log ---
        self.progress_bar = QProgressBar()
        self.progress_bar.setValue(0)
        self.progress_bar.setVisible(False)
        main_layout.addWidget(self.progress_bar)

        self.log_output = QPlainTextEdit()
        self.log_output.setReadOnly(True)
        self.log_output.setObjectName("LogConsole")
        self.log_output.setPlaceholderText("System logs will appear here...")
        main_layout.addWidget(self.log_output)

    def apply_styles(self):
        self.setStyleSheet("""
            QMainWindow {
                background-color: #121212;
            }
            QWidget {
                color: #E0E0E0;
                font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
                font-size: 13px;
            }
            #MainTitle {
                font-size: 28px;
                font-weight: 800;
                color: #FFFFFF;
                margin-top: 5px;
            }
            #SubTitle {
                font-size: 14px;
                color: #888888;
                margin-bottom: 10px;
            }
            QLabel {
                font-weight: 600;
                color: #BBBBBB;
            }
            QLineEdit {
                background-color: #1E1E1E;
                border: 1px solid #333333;
                border-radius: 6px;
                padding: 8px 12px;
                color: #FFFFFF;
                selection-background-color: #3d5afe;
            }
            QLineEdit:focus {
                border: 1px solid #2979FF;
                background-color: #252525;
            }
            QPushButton {
                background-color: #333333;
                border: 1px solid #444444;
                border-radius: 6px;
                color: white;
                padding: 8px 16px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #444444;
                border-color: #555555;
            }
            QPushButton:pressed {
                background-color: #222222;
            }
            #FormContainer {
                background-color: #1A1A1A;
                border: 1px solid #2A2A2A;
                border-radius: 10px;
                padding: 15px;
            }
            #UploadButton {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #2979FF, stop:1 #00E5FF);
                color: #FFFFFF;
                border: none;
                padding: 14px;
                font-size: 15px;
                border-radius: 8px;
                text-transform: uppercase;
                letter-spacing: 1px;
                font-weight: 800;
            }
            #UploadButton:hover {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #1565C0, stop:1 #00B8D4);
            }
            #UploadButton:pressed {
                background: #0D47A1;
            }
            #UploadButton:disabled {
                background: #424242;
                color: #888888;
            }
            #LogConsole {
                background-color: #000000;
                border: 1px solid #222222;
                border-radius: 8px;
                color: #00E676;
                font-family: 'Consolas', monospace;
                font-size: 12px;
                padding: 10px;
            }
            QProgressBar {
                border: none;
                border-radius: 4px;
                background-color: #222222;
                text-align: center;
                color: white;
                height: 8px;
            }
            QProgressBar::chunk {
                background-color: #00E5FF;
                border-radius: 4px;
            }
            QScrollBar:vertical {
                border: none;
                background: #121212;
                width: 8px;
                margin: 0px;
            }
            QScrollBar::handle:vertical {
                background: #333;
                min-height: 20px;
                border-radius: 4px;
            }
            QScrollBar::handle:vertical:hover {
                background: #555;
            }
            QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {
                height: 0px;
            }
        """)

    def load_settings(self):
        self.folder_input.setText(self.settings.value("folder_path", ""))
        self.repo_input.setText(self.settings.value("repo_url", ""))
        self.token_input.setText(self.settings.value("token", ""))
        self.branch_input.setText(self.settings.value("branch", "main"))
        self.commit_input.setText(self.settings.value("commit_msg", "Initial upload via Git Uploader"))

    def save_all_settings(self):
        self.settings.setValue("folder_path", self.folder_input.text())
        self.settings.setValue("repo_url", self.repo_input.text())
        self.settings.setValue("token", self.token_input.text())
        self.settings.setValue("branch", self.branch_input.text())
        self.settings.setValue("commit_msg", self.commit_input.text())

    def closeEvent(self, event):
        # Automatically save before exiting
        self.save_all_settings()
        event.accept()

    def browse_folder(self):
        folder = QFileDialog.getExistingDirectory(self, "Select Local Folder")
        if folder:
            self.folder_input.setText(folder)

    def log_message(self, message):
        self.log_output.appendPlainText(message)
        self.log_output.moveCursor(QTextCursor.MoveOperation.End)

    def start_upload(self):
        self.save_all_settings()
        folder = self.folder_input.text()
        repo = self.repo_input.text()
        token = self.token_input.text()
        branch = self.branch_input.text()
        commit = self.commit_input.text()

        if not folder or not os.path.isdir(folder):
            QMessageBox.warning(self, "Error", "Please select a valid local directory.")
            return
        if not repo or not ("http" in repo):
            QMessageBox.warning(self, "Error", "Please enter a valid GitHub repository HTTP URL.")
            return

        self.log_output.clear()
        self.progress_bar.setVisible(True)
        self.progress_bar.setValue(0)
        self.upload_btn.setEnabled(False)
        self.upload_btn.setText("Uploading in Progress...")

        # Create Worker
        self.worker = GitWorker(folder, repo, token, branch, commit)
        self.worker.update_text.connect(self.log_message)
        self.worker.progress.connect(self.progress_bar.setValue)
        self.worker.finished_task.connect(self.on_complete)
        self.worker.start()

    def on_complete(self, success, msg):
        self.upload_btn.setEnabled(True)
        self.upload_btn.setText("🚀 UPLOAD TO GITHUB")
        if success:
            QMessageBox.information(self, "Done", "Deployment Success!")
        else:
            QMessageBox.critical(self, "Error Occurred", f"Failed to push:\n{msg}")

if __name__ == "__main__":
    # Enable High DPI scaling support if supported
    os.environ["QT_AUTO_SCREEN_SCALE_FACTOR"] = "1"
    
    app = QApplication(sys.argv)
    app.setStyle("Fusion")
    
    # Set standard dark theme background for whole system popups
    palette = QPalette()
    palette.setColor(QPalette.ColorRole.Window, QColor(18, 18, 18))
    palette.setColor(QPalette.ColorRole.WindowText, QColor(255, 255, 255))
    app.setPalette(palette)
    
    window = ModernGitUploader()
    window.show()
    sys.exit(app.exec())
