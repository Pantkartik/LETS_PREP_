# 🔧 FIX: "Localhost Refused to Connect" Error

## 🎯 Problem
When clicking the email confirmation link, you get:
```
localhost refused to connect
```

---

## ✅ **SOLUTION**

### **Step 1: Check Redirect URL in Supabase**

The confirmation link is using the wrong URL format. Here's how to fix it:

1. **Go to URL Configuration:**
   ```
   https://supabase.com/dashboard/project/lzbbowbupqtkicpasuci/auth/url-configuration
   ```

2. **Check "Site URL":**
   - Should be: `http://localhost:3000`
   - NOT: `localhost:3000` (missing http://)
   - NOT: `https://localhost:3000` (wrong protocol)

3. **Check "Redirect URLs":**
   Add these EXACT URLs (with http://):
   ```
   http://localhost:3000/auth/confirm
   http://localhost:3000/auth/callback
   http://localhost:3000/**
   ```

4. **Click "Save"**

---

### **Step 2: Verify Dev Server is Running**

1. **Check your terminal** where you ran `npm run dev`

2. **You should see:**
   ```
   ▲ Next.js 16.0.10
   - Local:        http://localhost:3000
   - Ready in XXXms
   ```

3. **If NOT running:**
   ```bash
   # Stop any existing process
   # Press Ctrl+C
   
   # Start fresh
   npm run dev
   ```

4. **Verify it's accessible:**
   - Open browser: http://localhost:3000
   - Should show your app

---

### **Step 3: Test the Confirmation Link**

1. **Sign up again** with a NEW email:
   ```
   http://localhost:3000/signup
   ```

2. **Check email** for confirmation link

3. **Before clicking**, check the link URL:
   - Right-click the "Confirm your mail" button
   - Select "Copy link address"
   - Paste in notepad
   
4. **The URL should look like:**
   ```
   http://localhost:3000/auth/confirm?token_hash=XXX&type=signup
   ```
   
   ✅ **Good:** Starts with `http://localhost:3000`
   ❌ **Bad:** Starts with `localhost:3000` (missing http://)
   ❌ **Bad:** Starts with `https://localhost:3000` (wrong protocol)

5. **If URL is correct**, click it and it should work!

---

## 🔍 **Alternative: Manual Confirmation**

If the link still doesn't work, you can manually confirm users:

### **Option 1: Disable Email Confirmation (Testing Only)**

1. **Go to Auth Settings:**
   ```
   https://supabase.com/dashboard/project/lzbbowbupqtkicpasuci/auth/settings
   ```

2. **Toggle OFF:** "Enable email confirmations"

3. **Click "Save"**

4. **Now users can login immediately** without confirming email

5. **Re-enable later** for production

### **Option 2: Manually Confirm in Dashboard**

1. **Go to Users:**
   ```
   https://supabase.com/dashboard/project/lzbbowbupqtkicpasuci/auth/users
   ```

2. **Find your user**

3. **Click on the user**

4. **Look for "Email Confirmed"** status

5. **If unconfirmed**, you can manually confirm:
   - Click the user
   - Look for confirmation options
   - Or delete and recreate with email confirmation disabled

---

## 🧪 **Test Checklist**

- [ ] Site URL is `http://localhost:3000` (with http://)
- [ ] Redirect URLs include `http://localhost:3000/auth/confirm`
- [ ] Dev server is running on port 3000
- [ ] Can access http://localhost:3000 in browser
- [ ] Confirmation link starts with `http://localhost:3000`
- [ ] Clicked confirmation link successfully

---

## 🐛 **Still Not Working?**

### **Check 1: Port Number**

Your dev server might be on a different port:

1. **Check terminal output** for the actual port
2. **Look for:** `Local: http://localhost:XXXX`
3. **Update Supabase URLs** to match that port

### **Check 2: Firewall/Antivirus**

1. **Temporarily disable** firewall/antivirus
2. **Test again**
3. **If it works**, add exception for Node.js

### **Check 3: Browser Cache**

1. **Clear browser cache**
2. **Try incognito/private mode**
3. **Try different browser**

### **Check 4: Route File**

Verify the route file exists:
```
app/auth/confirm/route.ts
```

If missing, it was created earlier. Check if it's there.

---

## 🎯 **Quick Fix Command**

Run this to restart your dev server properly:

```bash
# Stop current server (Ctrl+C)
# Then run:
npm run dev
```

Make sure you see:
```
▲ Next.js 16.0.10
- Local:        http://localhost:3000
```

---

## ✨ **Summary**

**Most Common Fix:**
1. Go to Supabase → URL Configuration
2. Set Site URL: `http://localhost:3000` (with http://)
3. Add Redirect URL: `http://localhost:3000/auth/confirm`
4. Save
5. Sign up again with new email
6. Click confirmation link
7. Should work! ✅

**If still broken:**
- Disable email confirmation temporarily
- Manually confirm users in dashboard
- Check dev server is running
- Verify port number matches

---

**Try the fix above and let me know if it works! 🚀**
