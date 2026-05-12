@echo off
cd /d %~dp0
echo Checking dependencies...
pip install PyQt6
echo Starting Git Uploader App...
python app.py
pause
