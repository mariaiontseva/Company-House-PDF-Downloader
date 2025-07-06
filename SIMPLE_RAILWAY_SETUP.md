# Simple Railway Database Setup

## Step 1: Get Your Railway Database URL
1. Open your browser and go to https://railway.app
2. Log in to your Railway account
3. You should see your project dashboard with your MySQL database
4. Click on the MySQL database box (it should say "MySQL" on it)
5. In the top menu, click on "Connect" tab
6. You'll see several connection strings - look for "Public URL"
7. Click the copy button next to the Public URL
8. It will look something like: `mysql://root:AbCdEfGhIjKlMnOp@roundhouse.proxy.rlwy.net:12345/railway`
9. Save this URL in a text file - you'll need it in Step 3

## Step 2: Create a New Folder for API
1. Open Finder (Mac) or File Explorer (Windows)
2. Go to your Desktop or Documents folder
3. Right-click in empty space
4. Select "New Folder" 
5. Name it exactly: `companies-api`
6. Open Terminal (Mac) or Command Prompt (Windows)
7. Type: `cd Desktop/companies-api` (or `cd Documents/companies-api` if you put it there)
8. Press Enter
9. You should now be inside the companies-api folder

## Step 3: Create 3 Files

### File 1: `package.json`
1. Open a text editor (TextEdit on Mac, Notepad on Windows)
2. Copy this EXACT code:
```json
{
  "name": "companies-api",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.0",
    "cors": "^2.8.5"
  }
}
```
3. Save the file as `package.json` in your companies-api folder
4. IMPORTANT: Make sure it's not saved as `package.json.txt` - it must be exactly `package.json`

### File 2: `server.js`
1. Create a new file in your text editor
2. Copy this code:
```javascript
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());

// IMPORTANT: Replace this URL with YOUR Railway MySQL URL from Step 1
const connection = mysql.createConnection('YOUR_RAILWAY_MYSQL_URL_HERE');

app.get('/api/oldest', (req, res) => {
    connection.query(
        'SELECT * FROM companies ORDER BY date_of_creation ASC LIMIT 10',
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        }
    );
});

app.get('/api/newest', (req, res) => {
    connection.query(
        'SELECT * FROM companies ORDER BY date_of_creation DESC LIMIT 10',
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        }
    );
});

app.listen(process.env.PORT || 3000);
```
3. CRITICAL: Replace `YOUR_RAILWAY_MYSQL_URL_HERE` with the URL you copied in Step 1
4. Example: `const connection = mysql.createConnection('mysql://root:AbCdEfGhIjKlMnOp@roundhouse.proxy.rlwy.net:12345/railway');`
5. Save this file as `server.js` in your companies-api folder

### File 3: `.gitignore`
1. Create another new file in your text editor
2. Type just this one line:
```
node_modules/
```
3. Save as `.gitignore` in your companies-api folder
4. NOTE: The filename starts with a dot (.) - this is important!
5. On Mac: If it warns about hidden files, click "Use ."
6. On Windows: Make sure to select "All Files" in the save dialog

## Step 4: Push to GitHub
1. Make sure you're still in Terminal/Command Prompt in the companies-api folder
2. Type this command and press Enter: `git init`
   - You should see: "Initialized empty Git repository..."
3. Type this command and press Enter: `git add .`
   - Nothing will appear - that's normal
4. Type this command and press Enter: `git commit -m "api"`
   - You'll see some files being committed
5. Open your browser and go to https://github.com
6. Log in to your GitHub account
7. Click the green "New" button (top left, near your profile)
8. Repository name: type `companies-api`
9. Leave everything else as default
10. Click "Create repository"
11. You'll see a page with commands - look for the section "…or push an existing repository"
12. Copy the line that starts with: `git remote add origin https://github.com/YOURUSERNAME/companies-api.git`
13. Paste it in your Terminal and press Enter
14. Type this command and press Enter: `git push -u origin main`
    - If it asks for username/password, use your GitHub credentials
15. Refresh your GitHub page - you should see your 3 files!

## Step 5: Deploy to Railway
1. Go back to https://railway.app
2. You should see your MySQL database project
3. Click the "New" button (usually top right)
4. Select "GitHub Repo"
5. If asked, authorize Railway to access your GitHub
6. You'll see a list of your repos - click on `companies-api`
7. Railway will start deploying automatically
8. You'll see "Deploying..." - wait 2-3 minutes
9. When it says "Success", click on the new service box
10. Click on "Settings" tab (in the top menu)
11. Scroll down to "Networking"
12. Under "Public Networking", click "Generate Domain"
13. A URL will appear like: `companies-api-production-abc123.up.railway.app`
14. Click the copy button next to this URL
15. Save this URL - you'll need it in Step 7!

## Step 6: Test Your API
1. Open a new browser tab
2. In the address bar, type your Railway URL from Step 5, followed by `/api/oldest`
   - Example: `https://companies-api-production-abc123.up.railway.app/api/oldest`
3. Press Enter
4. You should see JSON data that looks like:
   ```
   [{"company_name":"OLD COMPANY LTD","company_number":"00000001",...}]
   ```
5. If you see an error instead:
   - Check that your MySQL URL in server.js is correct
   - Check Railway logs: click your service, then "Logs" tab
   - Make sure your database has data in it
6. Also test: `https://your-api-url.railway.app/api/newest`

## Step 7: Update Your Website
1. Open your `index.html` file in a text editor
2. Press Ctrl+F (Windows) or Cmd+F (Mac) to search
3. Search for: `const oldestCompanies = [`
4. You should find it around line 3645
5. Place your cursor at the START of that line (before the word "const")
6. Press Enter to create a new line above it
7. Copy and paste this ENTIRE code block:
```javascript
// Fetch real data from Railway
fetch('YOUR_API_URL_HERE/api/oldest')
    .then(r => r.json())
    .then(data => {
        oldestCompanies.length = 0;
        data.forEach(company => {
            oldestCompanies.push({
                name: company.company_name,
                number: company.company_number,
                year: new Date(company.date_of_creation).getFullYear().toString(),
                location: company.registered_office_address_post_town || 'Unknown',
                status: company.company_status === 'active' ? 'Active' : 'Dissolved',
                industry: 'OTHER'
            });
        });
        if (document.getElementById('exploreTab').classList.contains('active')) {
            renderCompanies();
        }
    });

fetch('YOUR_API_URL_HERE/api/newest')
    .then(r => r.json())
    .then(data => {
        newestCompanies.length = 0;
        data.forEach(company => {
            newestCompanies.push({
                name: company.company_name,
                number: company.company_number,
                year: new Date(company.date_of_creation).getFullYear().toString(),
                location: company.registered_office_address_post_town || 'Unknown',
                status: company.company_status === 'active' ? 'Active' : 'Dissolved',
                industry: 'OTHER'
            });
        });
        if (document.getElementById('exploreTab').classList.contains('active')) {
            renderCompanies();
        }
    });
```
8. IMPORTANT: Replace both instances of `YOUR_API_URL_HERE` with your Railway URL from Step 5
   - Example: Change `YOUR_API_URL_HERE` to `https://companies-api-production-abc123.up.railway.app`
9. Save the file
10. Push to GitHub:
    - In Terminal: `git add index.html`
    - Then: `git commit -m "connect database"`
    - Then: `git push`

## Step 8: Test Everything
1. Wait 1-2 minutes for GitHub Pages to update
2. Open your website
3. Click on the "Explore" tab
4. You should now see REAL companies from your database!
5. Try toggling between "Oldest" and "Newest"
6. Try the "Active Only" toggle

## Troubleshooting
If companies don't appear:
1. Open browser Developer Tools (F12)
2. Look for red errors in Console
3. Check that your API URL is correct
4. Make sure your API is returning data (test Step 6 again)
5. Check that you replaced BOTH instances of YOUR_API_URL_HERE

## Success!
Your website now shows real companies from your 5.6 million company database!