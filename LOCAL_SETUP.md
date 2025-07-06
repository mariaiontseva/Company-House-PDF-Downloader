# 🚀 Local Setup Guide for DocSpace

## Quick Start (2 minutes)

### 1. Start the local server:
```bash
cd companies-house-downloader
python3 server.py
```

### 2. Open in browser:
```
http://localhost:8000
```

### 3. Test authentication:
1. Click **"Create Account"** (top right)
2. Enter email and password
3. Click **"Create Account"**
4. Check Supabase dashboard for new user

## 🔧 Troubleshooting

### If "python3" doesn't work:
Try: `python server.py`

### If port 8000 is busy:
Edit `server.py` and change `PORT = 8000` to `PORT = 8080`

### If you see CORS errors:
The server.py includes CORS headers, but if issues persist, try:
1. Use Chrome in incognito mode
2. Or use Firefox

## 📱 Features to Test

1. **Sign Up**
   - Create new account
   - Check email confirmation settings in Supabase

2. **Sign In**
   - Use created account to log in
   - Should see "Sign Out" button when logged in

3. **Company Search**
   - Search works for all users
   - (Coming next: free download for logged-in users)

## 🛑 Stop Server
Press `Ctrl+C` in terminal

## 📝 Next Steps
Once auth is working, we'll add:
- Monitor button on search results
- Free first download for users
- Dashboard for monitored companies