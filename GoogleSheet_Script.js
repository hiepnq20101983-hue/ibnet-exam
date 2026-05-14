/**
 * GOOGLE APPS SCRIPT FOR EXAM PORTAL PRO
 * Copy all of this code and paste into Extensions -> Apps Script in your Google Sheet.
 */

function getSpreadsheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error("Lỗi bảo mật Google: Script không thể tự nhận dạng trang tính. Hãy chắc chắn bạn mở Script bằng cách vào Tiện ích mở rộng -> Apps Script từ bên trong Google Sheet.");
  }
  return ss;
}

// CHẠY HÀM NÀY MỘT LẦN DUY NHẤT ĐỂ CẤP QUYỀN CHO GOOGLE DRIVE!
function setup() {
  try {
    DriveApp.getFiles().hasNext();
    Logger.log("Đã cấp quyền Google Drive thành công!");
  } catch (e) {
    Logger.log("Chưa được cấp quyền: " + e.message);
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // Prevent concurrent write issues
  
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Submissions");
    
    // Auto-create sheet if not exists
    if (!sheet) {
      sheet = ss.insertSheet("Submissions");
      sheet.appendRow(["Thời gian nộp", "Họ và Tên", "Lớp", "Mã Đề", "Tên Đề", "Điểm Số"]);
      // Format header
      sheet.getRange("A1:F1").setFontWeight("bold").setBackground("#f3f4f6");
    }
    
    if (data.action === 'add_submission') {
      sheet.appendRow([
        new Date().toLocaleString("vi-VN"),
        data.studentName,
        data.className,
        data.examId,
        data.examTitle,
        data.score
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({result: "success"}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === 'add_student') {
      var rosterSheet = ss.getSheetByName("Students");
      if (!rosterSheet) {
        rosterSheet = ss.insertSheet("Students");
        rosterSheet.appendRow(["Lớp", "Họ và Tên", "Lịch học", "Học phí", "Trạng thái đóng tiền"]);
        rosterSheet.getRange("A1:E1").setFontWeight("bold").setBackground("#f3f4f6");
      }
      
      rosterSheet.appendRow([
        data.className,
        data.studentName,
        data.schedule || "",
        data.tuition || "",
        data.tuitionStatus || ""
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({result: "success"}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === 'add_students_batch') {
      var rosterSheet = ss.getSheetByName("Students");
      if (!rosterSheet) {
        rosterSheet = ss.insertSheet("Students");
        rosterSheet.appendRow(["Lớp", "Họ và Tên", "Lịch học", "Học phí", "Trạng thái đóng tiền"]);
        rosterSheet.getRange("A1:E1").setFontWeight("bold").setBackground("#f3f4f6");
      }
      
      var students = data.students || [];
      var rowsToAdd = [];
      
      for (var i = 0; i < students.length; i++) {
        if (!students[i].studentName) continue;
        rowsToAdd.push([
          students[i].className || "",
          students[i].studentName,
          students[i].schedule || "",
          students[i].tuition || "",
          students[i].tuitionStatus || "Chưa đóng"
        ]);
      }
      
      if (rowsToAdd.length > 0) {
        var lastRow = rosterSheet.getLastRow();
        var range = rosterSheet.getRange(lastRow + 1, 1, rowsToAdd.length, 5);
        range.setValues(rowsToAdd);
      }
      
      return ContentService.createTextOutput(JSON.stringify({result: "success", count: rowsToAdd.length}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === 'update_student') {
      var rosterSheet = ss.getSheetByName("Students");
      if (!rosterSheet) {
        return ContentService.createTextOutput(JSON.stringify({result: "error", message: "Sheet 'Students' không tồn tại."}))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      var dataValues = rosterSheet.getDataRange().getValues();
      var found = false;
      
      for (var i = 1; i < dataValues.length; i++) {
        var currentClass = String(dataValues[i][0] || "").trim();
        var currentName = String(dataValues[i][1] || "").trim();
        
        if (currentClass.toLowerCase() === String(data.className).trim().toLowerCase() && 
            currentName.toLowerCase() === String(data.studentName).trim().toLowerCase()) {
          
          // Row index is i + 1
          if (data.schedule !== undefined) rosterSheet.getRange(i + 1, 3).setValue(data.schedule);
          if (data.tuition !== undefined) rosterSheet.getRange(i + 1, 4).setValue(data.tuition);
          if (data.tuitionStatus !== undefined) rosterSheet.getRange(i + 1, 5).setValue(data.tuitionStatus);
          
          found = true;
          break;
        }
      }
      
      if (!found) {
        return ContentService.createTextOutput(JSON.stringify({result: "error", message: "Không tìm thấy học sinh trong lớp để cập nhật."}))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      return ContentService.createTextOutput(JSON.stringify({result: "success"}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === 'update_schedule_batch') {
      var rosterSheet = ss.getSheetByName("Students");
      if (!rosterSheet) {
        return ContentService.createTextOutput(JSON.stringify({result: "error", message: "Sheet 'Students' không tồn tại."}))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      var dataValues = rosterSheet.getDataRange().getValues();
      var updatedCount = 0;
      var targetType = data.targetType || 'class'; // 'class' | 'students'
      var selectedNames = data.studentNames ? data.studentNames.map(function(n) { return String(n).trim().toLowerCase(); }) : [];
      
      for (var i = 1; i < dataValues.length; i++) {
        var currentClass = String(dataValues[i][0] || "").trim();
        var currentName = String(dataValues[i][1] || "").trim();
        
        var matchesClass = currentClass.toLowerCase() === String(data.className).trim().toLowerCase();
        if (!matchesClass) continue;
        
        var matchesTarget = false;
        if (targetType === 'class') {
          matchesTarget = true;
        } else if (targetType === 'students') {
          matchesTarget = selectedNames.indexOf(currentName.toLowerCase()) !== -1;
        }
        
        if (matchesTarget) {
          if (data.schedule !== undefined) {
            rosterSheet.getRange(i + 1, 3).setValue(data.schedule); // Lịch học is column C
            updatedCount++;
          }
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({result: "success", count: updatedCount}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === 'update_exam_config') {
      var configSheet = ss.getSheetByName("ExamConfigs");
      if (!configSheet) {
        configSheet = ss.insertSheet("ExamConfigs");
        configSheet.appendRow(["Mã Đề", "Trạng thái", "Thời gian bắt đầu", "Thời gian kết thúc"]);
        configSheet.getRange("A1:D1").setFontWeight("bold").setBackground("#f3f4f6");
      }
      
      var dataValues = configSheet.getDataRange().getValues();
      var examId = String(data.examId).trim();
      var status = String(data.status || "Công khai").trim();
      var startTime = String(data.startTime || "").trim();
      var endTime = String(data.endTime || "").trim();
      
      var found = false;
      for (var i = 1; i < dataValues.length; i++) {
        if (String(dataValues[i][0] || "").trim() === examId) {
          configSheet.getRange(i + 1, 2).setValue(status);
          configSheet.getRange(i + 1, 3).setValue(startTime);
          configSheet.getRange(i + 1, 4).setValue(endTime);
          found = true;
          break;
        }
      }
      
      if (!found) {
        configSheet.appendRow([examId, status, startTime, endTime]);
      }
      
      return ContentService.createTextOutput(JSON.stringify({result: "success"}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === 'update_exam_config_batch') {
      var configSheet = ss.getSheetByName("ExamConfigs");
      if (!configSheet) {
        configSheet = ss.insertSheet("ExamConfigs");
        configSheet.appendRow(["Mã Đề", "Trạng thái", "Thời gian bắt đầu", "Thời gian kết thúc"]);
        configSheet.getRange("A1:D1").setFontWeight("bold").setBackground("#f3f4f6");
      }
      
      var dataValues = configSheet.getDataRange().getValues();
      var examIds = data.examIds || [];
      var status = String(data.status || "Ẩn").trim();
      var startTime = "";
      var endTime = "";
      
      var rowsToAdd = [];
      var existingMap = {};
      for (var i = 1; i < dataValues.length; i++) {
        var id = String(dataValues[i][0] || "").trim();
        if (id) {
          existingMap[id] = i + 1;
        }
      }
      
      for (var j = 0; j < examIds.length; j++) {
        var idToUpdate = String(examIds[j]).trim();
        if (!idToUpdate) continue;
        
        if (existingMap[idToUpdate]) {
          var row = existingMap[idToUpdate];
          configSheet.getRange(row, 2).setValue(status);
          configSheet.getRange(row, 3).setValue(startTime);
          configSheet.getRange(row, 4).setValue(endTime);
        } else {
          rowsToAdd.push([idToUpdate, status, startTime, endTime]);
        }
      }
      
      if (rowsToAdd.length > 0) {
        var lastRow = configSheet.getLastRow();
        var range = configSheet.getRange(lastRow + 1, 1, rowsToAdd.length, 4);
        range.setValues(rowsToAdd);
      }
      
      return ContentService.createTextOutput(JSON.stringify({result: "success"}))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({result: "error", error: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  try {
    var ss = getSpreadsheet();
    var action = e.parameter.action;
  
  if (action === 'get_data') {
    // 1. Get Submissions List
    var subSheet = ss.getSheetByName("Submissions");
    var submissions = [];
    if (subSheet) {
      var data = subSheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        if (!data[i][1]) continue; // Skip empty rows
        submissions.push({
          timestamp: data[i][0],
          studentName: String(data[i][1]).trim(),
          className: String(data[i][2]).trim(),
          examId: data[i][3],
          examTitle: data[i][4],
          score: data[i][5]
        });
      }
    }
    
    // 2. Get All Roster Students List (with schedule & tuition info)
    var rosterSheet = ss.getSheetByName("Students");
    var roster = [];
    if (rosterSheet) {
      var rData = rosterSheet.getDataRange().getValues();
      for (var j = 1; j < rData.length; j++) {
        var cName = String(rData[j][0] || "").trim();
        var sName = String(rData[j][1] || "").trim();
        
        // Chỉ cần cột "Họ và Tên" có dữ liệu là sẽ tự động nhận diện học sinh
        if (sName) {
          roster.push({
            className: cName || "Chưa rõ", 
            studentName: sName,
            schedule: rData[j][2] ? String(rData[j][2]).trim() : "",
            tuition: rData[j][3] ? String(rData[j][3]).trim() : "",
            tuitionStatus: rData[j][4] ? String(rData[j][4]).trim() : ""
          });
        }
      }
    } else {
      // Auto-create template if sheet is missing
      rosterSheet = ss.insertSheet("Students");
      rosterSheet.appendRow(["Lớp", "Họ và Tên", "Lịch học", "Học phí", "Trạng thái đóng tiền"]);
      rosterSheet.getRange("A1:E1").setFontWeight("bold").setBackground("#f3f4f6");
    }
    
    // 3. Get Behavior / Diary logs
    var behaviorSheet = ss.getSheetByName("Behavior");
    var behavior = [];
    if (behaviorSheet) {
      var bData = behaviorSheet.getDataRange().getValues();
      for (var k = 1; k < bData.length; k++) {
        if (bData[k][1] && bData[k][2]) {
          behavior.push({
            timestamp: bData[k][0],
            className: String(bData[k][1]).trim(),
            studentName: String(bData[k][2]).trim(),
            note: bData[k][3] ? String(bData[k][3]).trim() : "",
            status: bData[k][4] ? String(bData[k][4]).trim() : "" // Tốt, Nghịch, Phát biểu...
          });
        }
      }
    } else {
      // Auto-create template if sheet is missing
      behaviorSheet = ss.insertSheet("Behavior");
      behaviorSheet.appendRow(["Thời gian", "Lớp", "Họ và Tên", "Nhận xét", "Trạng thái"]);
      behaviorSheet.getRange("A1:E1").setFontWeight("bold").setBackground("#f3f4f6");
    }
    
    // 4. Get Exam Visibility Configs
    var configSheet = ss.getSheetByName("ExamConfigs");
    var examConfigs = [];
    if (configSheet) {
      var cData = configSheet.getDataRange().getValues();
      for (var m = 1; m < cData.length; m++) {
        if (cData[m][0]) {
          examConfigs.push({
            examId: String(cData[m][0]).trim(),
            status: String(cData[m][1] || "Công khai").trim(),
            startTime: cData[m][2] ? String(cData[m][2]).trim() : "",
            endTime: cData[m][3] ? String(cData[m][3]).trim() : ""
          });
        }
      }
    } else {
      configSheet = ss.insertSheet("ExamConfigs");
      configSheet.appendRow(["Mã Đề", "Trạng thái", "Thời gian bắt đầu", "Thời gian kết thúc"]);
      configSheet.getRange("A1:D1").setFontWeight("bold").setBackground("#f3f4f6");
    }
    
    var response = {
      submissions: submissions,
      roster: roster,
      behavior: behavior,
      examConfigs: examConfigs
    };
    
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'get_drive_exams') {
    var folderId = e.parameter.folderId;
    if (!folderId) {
      return ContentService.createTextOutput(JSON.stringify({result: "error", message: "Thiếu folderId"}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var examList = [];
    var debugLog = [];
    
    try {
      var folder = DriveApp.getFolderById(folderId);
      debugLog.push("Đã kết nối Thư mục gốc: \"" + folder.getName() + "\"");
      
      function scanFolder(f, currentPath) {
        var folderName = f.getName();
        debugLog.push("Quét thư mục: /" + currentPath + " (" + folderName + ")");
        
        // Get files in this folder
        var files = f.getFiles();
        var folderFileCount = 0;
        var sampleFiles = [];
        
        while (files.hasNext()) {
          var file = files.next();
          var name = file.getName();
          var mime = file.getMimeType();
          folderFileCount++;
          
          if (sampleFiles.length < 3) {
            sampleFiles.push(name + " [" + mime + "]");
          }
          
          var isHtml = name.toLowerCase().endsWith(".html") || name.toLowerCase().endsWith(".htm") || mime === "text/html";
          
          if (isHtml) {
            try {
              // Quick text read for metadata
              var text = file.getBlob().getDataAsString().substring(0, 20000);
              
              var titleMatch = text.match(/<title>(.*?)<\/title>/i);
              var title = titleMatch ? titleMatch[1].trim() : name.replace("_conv.html", "").replace(/_/g, " ");
              
              var durationMatch = text.match(/class=["']exam-meta["'][^>]*>([\s\S]*?)<\/div>/i) || text.match(/class=["']exam-meta["'][^>]*>([\s\S]*?)<\/span>/i);
              var duration = durationMatch ? durationMatch[1].replace(/<\/?[^>]+(>|$)/g, "").trim() : "N/A";
              
              var summaryMatch = text.match(/class=["']score-summary["'][^>]*>([\s\S]*?)<\/div>/i);
              var summary = summaryMatch ? summaryMatch[1].replace(/<\/?[^>]+(>|$)/g, "").substring(0, 150) + "..." : "";
              
              var pathSegments = currentPath.split('/').filter(function(x) { return x.length > 0; });
              var examClass = 'Chung';
              var examTopic = 'Tổng hợp';
              
              if (pathSegments.length === 1) {
                var seg = pathSegments[0];
                if (seg.toLowerCase().indexOf('lớp') !== -1 || seg.toLowerCase().indexOf('lop') !== -1) {
                  examClass = seg;
                } else {
                  examTopic = seg;
                }
              } else if (pathSegments.length >= 2) {
                examClass = pathSegments[0];
                examTopic = pathSegments[1];
              }
              
              examList.push({
                id: file.getId(),
                filename: name,
                title: title,
                duration: duration.replace('Thời gian: ', ''),
                summary: summary,
                examClass: examClass,
                examTopic: examTopic
              });
            } catch (fileErr) {
              examList.push({
                id: file.getId(),
                filename: name,
                title: name.replace("_conv.html", ""),
                duration: "Lỗi đọc",
                summary: "Không giải mã được HTML: " + fileErr.toString(),
                examClass: currentPath.split('/')[0] || "Drive",
                examTopic: "Lỗi đọc file"
              });
            }
          }
        }
        
        debugLog.push("-> Tìm thấy " + folderFileCount + " tệp tin trong " + folderName + ". Ví dụ: " + (sampleFiles.length > 0 ? sampleFiles.join(", ") : "(Trống)"));
        
        // Get subfolders
        try {
          var subFolders = f.getFolders();
          while (subFolders.hasNext()) {
            var sub = subFolders.next();
            try {
              scanFolder(sub, (currentPath ? currentPath + "/" : "") + sub.getName());
            } catch (innerErr) {
              debugLog.push("Lỗi bỏ qua thư mục con \"" + sub.getName() + "\": " + innerErr.toString());
            }
          }
        } catch (subErr) {
          debugLog.push("Không thể duyệt thư mục con của \"" + folderName + "\": " + subErr.toString());
        }
      }
      
      scanFolder(folder, "");
      
      // If NO exams were found, append a diagnostic helper exam that uses the UI to report what happened
      if (examList.length === 0) {
        examList.push({
          id: "DIAGNOSTIC_SYSTEM_REPORT",
          filename: "BÁO_CÁO_QUÉT_LỖI.html",
          title: "🔍 Lỗi: Đã Quét Thư Mục Nhưng Không Tìm Thấy File .HTML Nào!",
          duration: "N/A",
          summary: "BÁO CÁO TRÌNH QUÉT DỮ LIỆU: " + debugLog.join(" || "),
          examClass: "HỆ THỐNG",
          examTopic: "Báo cáo sự cố"
        });
      }
      
      return ContentService.createTextOutput(JSON.stringify(examList))
        .setMimeType(ContentService.MimeType.JSON);
        
    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify([{
        id: "DIAGNOSTIC_CRITICAL_CRASH",
        filename: "CRITICAL_CRASH.html",
        title: "🚨 Lỗi Nghiêm Trọng Khi Đọc Thư Mục Google Drive!",
        duration: "N/A",
        summary: "Apps Script báo lỗi: " + err.toString() + ". Vui lòng kiểm tra lại GOOGLE_DRIVE_FOLDER_ID trong Vercel và đảm bảo bạn có quyền truy cập!",
        examClass: "HỆ THỐNG",
        examTopic: "Lỗi kết nối"
      }]))
      .setMimeType(ContentService.MimeType.JSON);
    }
  }

  if (action === 'get_exam_content') {
    var fileId = e.parameter.fileId;
    if (!fileId) {
      return ContentService.createTextOutput("Thiếu fileId");
    }
    try {
      var file = DriveApp.getFileById(fileId);
      var html = file.getBlob().getDataAsString();
      return ContentService.createTextOutput(html);
    } catch (err) {
      return ContentService.createTextOutput("Lỗi tải đề thi: " + err.toString());
    }
  }
  
  return ContentService.createTextOutput("Exam API Is Running Successfully.");
  } catch (globalErr) {
    return ContentService.createTextOutput(JSON.stringify({result: "error", error: "Lỗi hệ thống Google Scripts: " + globalErr.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
