/**
 * CLASSSYNC - FULL SYSTEM LOGIC
 * Developer: Het Bakori | Brand: Graphic Paradise
 */

// --- 1. LIVE GOOGLE SHEETS DATABASE ---
// Added dynamic timestamp (?t=) to bypass phone browser caching
const sheetCSVUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQRgBqCSSXL2_j8P0cfhoXVImQfQF1c0sXdaxrZDI9wAIHsC-jpy4U4dyfw_Yq-p7t7gDqTMwtDBeYh/pub?output=csv&t=" + new Date().getTime();

let studentDatabase = [];

// Dictionary: Maps your Sheet Column Prefixes to Full Names on the UI
const subjectDictionary = {
  "MDM": "MDM",
  "DAA": "DAA",
  "PYTHON": "Python Programming",
  "COA": "COA",
  "MATH": "Probability & Statistics"
};

function fetchStudentData() {
  Papa.parse(sheetCSVUrl, {
    download: true,       
    header: true,         
    dynamicTyping: true,  
    skipEmptyLines: true,
    complete: function(results) {
      studentDatabase = results.data
        .filter(row => row.Roll) // Skips empty rows
        .map(row => {
          const student = { 
            roll: row.Roll, 
            name: String(row.Name || "").trim(), 
            batch: row.Batch, 
            dept: row.Dept, 
            attendance: 0, 
            results: [] 
          };
          
          const dynamicSubjects = {};
          let totalAttendedOverall = 0; 
          let totalConductedOverall = 0;

          // Loop through every column header in the Sheet
          Object.keys(row).forEach(key => {
            const cleanKey = key.trim().toUpperCase(); // Remove spaces, make uppercase
            
            if (!['ROLL', 'NAME', 'BATCH', 'DEPT'].includes(cleanKey)) {
              const parts = cleanKey.split('_'); 
              
              if (parts.length >= 2) {
                const shortCode = parts[0]; 
                const type = parts[1]; 
                const fullName = subjectDictionary[shortCode] || shortCode; 

                if (!dynamicSubjects[shortCode]) {
                  dynamicSubjects[shortCode] = { subject: fullName, cat1: 0, mid: 0, cat2: 0, att: 0, tot: 0 };
                }
                
                const val = Number(row[key]) || 0;

                // Map Sheet Columns to Data Object
                if (type === 'ATT') {
                    dynamicSubjects[shortCode].att = val;
                    totalAttendedOverall += val;
                } else if (type === 'TOT') {
                    dynamicSubjects[shortCode].tot = val;
                    totalConductedOverall += val;
                } else if (type === 'CAT1') {
                    dynamicSubjects[shortCode].cat1 = val;
                } else if (type === 'MID') {
                    dynamicSubjects[shortCode].mid = val;
                } else if (type === 'CAT2') {
                    dynamicSubjects[shortCode].cat2 = val;
                }
              }
            }
          });

          // Final Aggregate Calculation
          student.attendance = totalConductedOverall > 0 
            ? Math.round((totalAttendedOverall / totalConductedOverall) * 100) 
            : 0;
          
          student.results = Object.values(dynamicSubjects);
          return student;
      });
      console.log("✅ Graphic Paradise Database Synced!", studentDatabase);
    },
    error: function(err) { 
      console.error("❌ CSV Load Error:", err); 
    }
  });
}

// Initial Run
fetchStudentData();

// --- 2. MASTER DEPARTMENT TIMETABLE ---
const campusTimetables = {
  "CSE": {
    "Monday": [
      { "time": "10:15 to 11:15", "subject": "MDM / Signal System", "teacher": "Mr. A.A. Sutar", "room": "CR4" },
      { "time": "11:15 to 12:15", "subject": "DAA", "teacher": "Ms. D. A. Dongare", "room": "CR4" },
      { "time": "01:00 to 02:00", "subject": "Probability & Statistics", "teacher": "Mr. G. A. Makandar", "room": "CR4" },
      { "time": "02:00 to 03:00", "subject": "Python Programming", "teacher": "Mrs. S. T. Patil", "room": "CR4" }
    ],
    "Tuesday": [
      { 
        "time": "10:15 to 12:15", 
        "isBatchSplit": true,
        "batches": [
          { "name": "S1", "subject": "Microprogramming Lab", "teacher": "LIB", "room": "MP Lab" },
          { "name": "S2", "subject": "DAA Lab", "teacher": "Ms. D. A. Dongare", "room": "ML Lab" },
          { "name": "S3", "subject": "Python Lab", "teacher": "Mrs. S. T. Patil", "room": "ADCOM Lab" }
        ]
      },
      { "time": "01:00 to 02:00", "subject": "DAA", "teacher": "Ms. Dongare", "room": "CR4" },
      { "time": "02:00 to 03:00", "subject": "COA", "teacher": "Mrs. Kumbhar", "room": "CR4" }
    ],
    "Wednesday": [
      { 
        "time": "10:15 to 12:15", 
        "isBatchSplit": true,
        "batches": [
          { "name": "S1", "subject": "Web Tech Lab", "teacher": "Ms. Dongare", "room": "WT Lab" },
          { "name": "S2", "subject": "Python Lab", "teacher": "Mrs. Patil", "room": "ADCOM Lab" },
          { "name": "S3", "subject": "Programming Lab", "teacher": "Staff", "room": "PL Lab" }
        ]
      },
      { "time": "01:00 to 02:00", "subject": "Prob & Stats", "teacher": "Mr. Makandar", "room": "CR4" }
    ],
    "Thursday": [
      { "time": "10:15 to 11:15", "subject": "MDM", "teacher": "Mr. Sutar", "room": "CR4" },
      { "time": "11:15 to 12:15", "subject": "COA", "teacher": "Mrs. Kumbhar", "room": "CR4" },
      { "time": "01:00 to 02:00", "subject": "Prob & Stats", "teacher": "Mr. Makandar", "room": "CR4" },
      { "time": "02:00 to 03:00", "subject": "OE", "room": "CR4" },
      { "time": "03:15 to 05:15", "subject": "OE", "room": "CR4" }
    ],
    "Friday": [
      { "time": "10:15 to 11:15", "subject": "Python", "teacher": "Mrs. Patil", "room": "CR4" },
      { "time": "11:15 to 12:15", "subject": "Prob & Stats", "teacher": "Mr. Makandar", "room": "CR4" },
      { 
        "time": "01:00 to 03:00", 
        "isBatchSplit": true,
        "batches": [
          { "name": "S1", "subject": "Python Lab", "teacher": "Mrs. Patil", "room": "ADCOM Lab" },
          { "name": "S2", "subject": "Web Tech Lab", "teacher": "Staff", "room": "WT Lab" },
          { "name": "S3", "subject": "Data Science Lab", "teacher": "Ms. Dongare", "room": "DS Lab" }
        ]
      },
      { "time": "03:15 to 04:15", "subject": "DAA", "teacher": "Ms. Dongare", "room": "CR4" },
      { "time": "04:15 to 05:15", "subject": "COA", "teacher": "Mrs. Kumbhar", "room": "CR4" }
    ],
    "Saturday": [], "Sunday": []
  }
};

// --- 3. AUTHENTICATION ---
function authenticateUser(roll, name) {
  if(!studentDatabase.length) return null;
  return studentDatabase.find(s => 
    s.roll === parseInt(roll) && 
    s.name.toLowerCase().trim() === name.toLowerCase().trim()
  );
}

// --- 4. LECTURE TRACKER ---
function getLectureStatuses(daySchedule) {
  if (!daySchedule || daySchedule.length === 0) return { current: null, next: null };
  const now = new Date();
  const currentMinutes = (now.getHours() * 60) + now.getMinutes();
  
  let current = null, next = null;
  for (let i = 0; i < daySchedule.length; i++) {
    const lecture = daySchedule[i];
    const timeParts = lecture.time.split(' to ');
    const startParts = timeParts[0].split(':').map(Number);
    const endParts = timeParts[1].split(':').map(Number);
    
    let startHour = startParts[0]; 
    let endHour = endParts[0];
    
    if (startHour < 8) startHour += 12; 
    if (endHour < 8) endHour += 12;

    const start = (startHour * 60) + startParts[1];
    const end = (endHour * 60) + endParts[1];

    if (currentMinutes >= start && currentMinutes < end) { 
        current = lecture; 
        next = daySchedule[i+1] || null; 
        break; 
    } else if (currentMinutes < start && !next) { 
        next = lecture; 
    }
  }
  return { current, next };
}

// Export functions to Window scope
window.studentDatabase = studentDatabase; 
window.authenticateUser = authenticateUser; 
window.campusTimetables = campusTimetables; 
window.getLectureStatuses = getLectureStatuses;
