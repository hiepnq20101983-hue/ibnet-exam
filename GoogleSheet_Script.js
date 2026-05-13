/**
 * GOOGLE APPS SCRIPT FOR EXAM PORTAL PRO
 * Copy all of this code and paste into Extensions -> Apps Script in your Google Sheet.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // Prevent concurrent write issues
  
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
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
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({result: "error", error: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
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
    
    var response = {
      submissions: submissions,
      roster: roster,
      behavior: behavior
    };
    
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput("Exam API Is Running Successfully.");
}
