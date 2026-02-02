# 📊 Google Sheets Setup - Save Responses to Excel

This guide shows you how to save Valentine responses directly to Google Sheets (Excel-compatible).

---

## 🎯 Overview

When Khushii plays the game, her responses will be saved to a Google Sheet that you can view anytime!

**What gets saved:**
- Date & Time
- How many times she clicked "No" on Valentine question
- How many times she clicked "Yes"
- How many times she clicked "No" on Couples question
- How many times she clicked "Yes" on Couples question

---

## 📝 Step 1: Create Google Sheet

1. Go to: https://sheets.google.com/
2. Click **"+ Blank"** to create a new sheet
3. Name it: **"Valentine Game Responses"**

### Set up the columns:

In Row 1, add these headers:
- **A1:** `Timestamp`
- **B1:** `Stage`
- **C1:** `No Clicks`
- **D1:** `Yes Clicks`
- **E1:** `Browser`

Your sheet should look like:
```
| Timestamp | Stage | No Clicks | Yes Clicks | Browser |
|-----------|-------|-----------|------------|---------|
```

---

## 🔧 Step 2: Create Google Apps Script

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. Delete any existing code
3. Copy and paste this code:

```javascript
function doPost(e) {
  try {
    // Get the active spreadsheet
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Parse the incoming data
    var data = JSON.parse(e.postData.contents);
    
    // Create a new row with the data
    var timestamp = new Date();
    var stage = data.stage || 'unknown';
    var noClicks = data.noClicks || 0;
    var yesClicks = data.yesClicks || 0;
    var browser = data.userAgent || 'unknown';
    
    // Append the row to the sheet
    sheet.appendRow([timestamp, stage, noClicks, yesClicks, browser]);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        'success': true,
        'message': 'Data saved successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        'success': false,
        'error': error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Click **"Save"** (💾 icon)
5. Name the project: `Valentine Game Tracker`

---

## 🚀 Step 3: Deploy the Script

1. Click **"Deploy"** → **"New deployment"**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **"Web app"**
4. Fill in:
   - **Description:** `Valentine tracker`
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
5. Click **"Deploy"**
6. Click **"Authorize access"**
7. Choose your Google account
8. Click **"Advanced"** → **"Go to Valentine Game Tracker (unsafe)"**
9. Click **"Allow"**

### 📋 Copy Your Web App URL

You'll see a URL like:
```
https://script.google.com/macros/s/AKfycbz.../exec
```

**COPY THIS URL!** You'll need it in the next step.

---

## 💻 Step 4: Update game.js

1. Open `game.js`
2. Find the `sendToServer` function (around line 573)
3. Replace the entire function with this:

```javascript
// ===== Send Data to Server =====
function sendToServer(stage, data) {
    // Prepare data to send
    const payload = {
        stage: stage,
        timestamp: new Date().toISOString(),
        noClicks: data.noClicks || 0,
        yesClicks: data.yesClicks || 0,
        userAgent: navigator.userAgent
    };
    
    console.log('Sending to Google Sheets:', payload);
    
    // Replace with your Google Apps Script Web App URL
    const GOOGLE_SCRIPT_URL = 'YOUR_WEB_APP_URL_HERE';
    
    // Send to Google Sheets
    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    })
    .then(() => {
        console.log('✅ Response sent to Google Sheets!');
    })
    .catch(error => {
        console.log('⚠️ Error sending to Google Sheets:', error);
        
        // Fallback: store in localStorage
        const stored = JSON.parse(localStorage.getItem('valentineResponses') || '[]');
        stored.push(payload);
        localStorage.setItem('valentineResponses', JSON.stringify(stored));
        console.log('💾 Saved to localStorage as backup');
    });
}
```

4. Replace `'YOUR_WEB_APP_URL_HERE'` with your actual Web App URL
5. **Save the file**

---

## 🎮 Step 5: Test It!

1. Open `index.html` in your browser
2. Play the game until game over
3. Click through the Valentine proposal
4. Check your Google Sheet - you should see a new row! 🎉

---

## 📊 Step 6: View Your Data

Anytime you want to see the responses:
1. Open your Google Sheet
2. See all the data in a nice table
3. You can:
   - Download as Excel (File → Download → Microsoft Excel)
   - Create charts
   - Filter and sort
   - Share with others

---

## 🌐 Step 7: Deploy to GitHub Pages

Now that the tracking is set up, deploy your game:

```powershell
cd c:\Users\manit\OneDrive\Documents\formylove

git init
git add index.html style.css game.js README.md .gitignore
git commit -m "Valentine game with Google Sheets tracking"
git remote add origin https://github.com/YOUR-USERNAME/valentine-game.git
git branch -M main
git push -u origin main
```

Then enable GitHub Pages in your repo settings!

---

## ✅ Summary

**What you did:**
1. ✅ Created Google Sheet
2. ✅ Set up Apps Script
3. ✅ Deployed as Web App
4. ✅ Updated game.js with URL
5. ✅ Tested it works
6. ✅ Ready to deploy!

**Your game will save data to Google Sheets automatically!** 📊💕

---

## 🎯 Advantages of Google Sheets

- ✅ No Firebase needed
- ✅ No permissions issues
- ✅ Easy to view and download
- ✅ Can export to Excel anytime
- ✅ Free forever
- ✅ Simple setup

---

Need help with any step? Let me know! 🚀
