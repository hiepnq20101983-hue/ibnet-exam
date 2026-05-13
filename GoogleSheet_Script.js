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
    
    // 2. Get All Roster Students List (to track who HAS NOT done)
    var rosterSheet = ss.getSheetByName("Students");
    var roster = [];
    if (rosterSheet) {
      var rData = rosterSheet.getDataRange().getValues();
      for (var j = 1; j < rData.length; j++) {
        if (rData[j][0] && rData[j][1]) {
          roster.push({
            className: String(rData[j][0]).trim(),
            studentName: String(rData[j][1]).trim()
          });
        }
      }
    }
    
    var response = {
      submissions: submissions,
      roster: roster
    };
    
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput("Exam API Is Running Successfully.");
}
