# 📧 Supabase Email Configuration Guide

## 🎯 Overview

This guide will help you:
1. Configure email confirmation for new users
2. Set up email rate limiting to prevent abuse
3. Customize email templates
4. Configure SMTP settings (optional)

---

## 📝 Step 1: Enable Email Confirmation

### In Supabase Dashboard:

1. **Go to Authentication Settings**
   - Navigate to: https://supabase.com/dashboard/project/lzbbowbupqtkicpasuci/auth/settings
   - Or: Dashboard → Authentication → Settings

2. **Enable Email Confirmations**
   - Scroll to **"Email Auth"** section
   - Toggle ON: **"Enable email confirmations"**
   - This requires users to verify their email before logging in

3. **Configure Confirmation Settings**
   ```
   ✅ Enable email confirmations
   ✅ Secure email change (recommended)
   ⚙️ Confirmation URL: https://your-domain.com/auth/confirm
   ```

4. **Save Changes**
   - Click **"Save"** at the bottom

---

## ⏱️ Step 2: Configure Rate Limiting

### Email Rate Limiting Settings:

1. **Go to Rate Limits**
   - Navigate to: https://supabase.com/dashboard/project/lzbbowbupqtkicpasuci/auth/rate-limits
   - Or: Dashboard → Authentication → Rate Limits

2. **Configure Email Rate Limits**
   ```
   Email Sending Rate Limit:
   - Per Hour: 4 emails (recommended for development)
   - Per Hour: 10 emails (recommended for production)
   
   This prevents:
   - Email spam
   - Abuse of signup system
   - Excessive verification emails
   ```

3. **Recommended Settings**
   ```yaml
   Development:
     - Email per hour per IP: 4
     - Email per hour per user: 4
   
   Production:
     - Email per hour per IP: 10
     - Email per hour per user: 6
   ```

4. **Save Configuration**

---

## 🎨 Step 3: Customize Email Templates

### Configure Email Templates:

1. **Go to Email Templates**
   - Navigate to: https://supabase.com/dashboard/project/lzbbowbupqtkicpasuci/auth/templates
   - Or: Dashboard → Authentication → Email Templates

2. **Customize Confirmation Email**

   **Subject:** Confirm your email for LETS PREP

   **Body Template:**
   ```html
   <h2>Welcome to LETS PREP! 🎉</h2>
   
   <p>Hi there!</p>
   
   <p>Thanks for signing up! We're excited to have you on board.</p>
   
   <p>Please confirm your email address by clicking the button below:</p>
   
   <p>
     <a href="{{ .ConfirmationURL }}" 
        style="background-color: #4F46E5; color: white; padding: 12px 24px; 
               text-decoration: none; border-radius: 6px; display: inline-block;">
       Confirm Email Address
     </a>
   </p>
   
   <p>Or copy and paste this link into your browser:</p>
   <p>{{ .ConfirmationURL }}</p>
   
   <p>This link will expire in 24 hours.</p>
   
   <p>If you didn't create an account, you can safely ignore this email.</p>
   
   <p>Happy learning!<br>
   The LETS PREP Team</p>
   ```

3. **Customize Other Templates**
   - **Password Reset Email**
   - **Magic Link Email**
   - **Email Change Confirmation**

4. **Save Templates**

---

## 🔧 Step 4: Configure SMTP (Optional but Recommended)

### Why Use Custom SMTP?

- ✅ Better deliverability
- ✅ Custom sender email (e.g., noreply@yourapp.com)
- ✅ Higher rate limits
- ✅ Professional appearance

### Using Gmail SMTP (Free):

1. **Go to SMTP Settings**
   - Dashboard → Project Settings → Auth → SMTP Settings

2. **Enable Custom SMTP**
   ```yaml
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   SMTP User: your-email@gmail.com
   SMTP Password: your-app-password
   Sender Email: your-email@gmail.com
   Sender Name: LETS PREP
   ```

3. **Get Gmail App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Create app password for "Mail"
   - Use this password in SMTP settings

### Using SendGrid (Recommended for Production):

1. **Sign up for SendGrid**
   - Free tier: 100 emails/day
   - Go to: https://sendgrid.com

2. **Get API Key**
   - SendGrid Dashboard → Settings → API Keys
   - Create API Key

3. **Configure in Supabase**
   ```yaml
   SMTP Host: smtp.sendgrid.net
   SMTP Port: 587
   SMTP User: apikey
   SMTP Password: YOUR_SENDGRID_API_KEY
   Sender Email: noreply@yourdomain.com
   Sender Name: LETS PREP
   ```

---

## 💻 Step 5: Update Your Application Code

### Update Signup Page

The signup page needs to inform users about email confirmation:

**File: `app/signup/page.tsx`**

Already configured! The success message will show:
```typescript
setSuccess('Account created successfully! Please check your email to confirm your account.');
```

### Update Login Page

Add better error handling for unconfirmed emails:

**File: `app/login/page.tsx`**

The error handling is already in place. Supabase will return:
- "Email not confirmed" - if user hasn't verified email
- "Invalid login credentials" - if email/password is wrong

---

## 🔄 Step 6: Create Email Confirmation Handler

### Create Confirmation Route:

**File: `app/auth/confirm/route.ts`**

```typescript
import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard'

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })

    if (!error) {
      // Redirect to dashboard or specified page
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Redirect to error page if confirmation fails
  return NextResponse.redirect(new URL('/auth/error', request.url))
}
```

### Create Error Page:

**File: `app/auth/error/page.tsx`**

```typescript
'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle className="w-16 h-16 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Confirmation Failed</h1>
        <p className="text-muted-foreground mb-6">
          The confirmation link is invalid or has expired.
          Please try signing up again or contact support.
        </p>
        <div className="space-y-3">
          <Link href="/signup">
            <Button className="w-full">Sign Up Again</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="w-full">Back to Login</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
```

### Create Success Page:

**File: `app/auth/success/page.tsx`**

```typescript
'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function AuthSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Email Confirmed! 🎉</h1>
        <p className="text-muted-foreground mb-6">
          Your email has been successfully verified.
          You can now log in to your account.
        </p>
        <Link href="/login">
          <Button className="w-full">Continue to Login</Button>
        </Link>
      </Card>
    </div>
  );
}
```

---

## 📧 Step 7: Configure Redirect URLs

### In Supabase Dashboard:

1. **Go to URL Configuration**
   - Dashboard → Authentication → URL Configuration

2. **Add Redirect URLs**
   ```
   Development:
   http://localhost:3000/auth/confirm
   http://localhost:3000/auth/callback
   
   Production:
   https://yourdomain.com/auth/confirm
   https://yourdomain.com/auth/callback
   ```

3. **Set Site URL**
   ```
   Development: http://localhost:3000
   Production: https://yourdomain.com
   ```

---

## 🧪 Step 8: Testing Email Flow

### Test Checklist:

1. **Sign Up**
   - Go to: http://localhost:3000/signup
   - Create account with valid email
   - Should see: "Please check your email to confirm"

2. **Check Email**
   - Check inbox (and spam folder)
   - Should receive confirmation email
   - Click confirmation link

3. **Confirm Email**
   - Should redirect to success page
   - Or directly to dashboard

4. **Login**
   - Go to: http://localhost:3000/login
   - Enter credentials
   - Should successfully log in

### Rate Limit Testing:

1. Try signing up 5 times in quick succession
2. Should be rate limited after configured threshold
3. Wait 1 hour or use different IP to test again

---

## 🔍 Troubleshooting

### Email Not Received

**Check:**
1. ✅ Spam/Junk folder
2. ✅ Email confirmation is enabled in Supabase
3. ✅ SMTP settings are correct (if using custom SMTP)
4. ✅ Rate limit not exceeded

**Solutions:**
- Check Supabase logs: Dashboard → Logs → Auth Logs
- Verify email in Supabase: Dashboard → Authentication → Users
- Resend confirmation email (add feature in app)

### Rate Limit Errors

**Error:** "Email rate limit exceeded"

**Solutions:**
1. Wait for rate limit window to reset (1 hour)
2. Increase rate limits in Supabase Dashboard
3. Use different email/IP for testing
4. Disable rate limiting for development (not recommended)

### Confirmation Link Not Working

**Check:**
1. ✅ Redirect URLs are configured
2. ✅ Confirmation route exists (`app/auth/confirm/route.ts`)
3. ✅ Link hasn't expired (24 hours default)

**Solutions:**
- Check browser console for errors
- Verify token in URL is complete
- Request new confirmation email

---

## 🎯 Best Practices

### For Development:
```yaml
✅ Lower rate limits (4/hour)
✅ Use test email addresses
✅ Enable detailed logging
✅ Consider disabling email confirmation for faster testing
```

### For Production:
```yaml
✅ Higher rate limits (10/hour)
✅ Custom SMTP provider (SendGrid, Mailgun)
✅ Professional email templates
✅ Enable email confirmation (security)
✅ Monitor email delivery rates
✅ Set up email domain authentication (SPF, DKIM)
```

---

## 📊 Monitoring

### Check Email Delivery:

1. **Supabase Dashboard**
   - Go to: Dashboard → Logs → Auth Logs
   - Filter by: Email events

2. **SMTP Provider Dashboard**
   - SendGrid: Check delivery statistics
   - Gmail: Check sent folder

3. **User Feedback**
   - Add "Resend confirmation email" button
   - Monitor support requests

---

## 🚀 Quick Setup Checklist

- [ ] Enable email confirmations in Supabase
- [ ] Configure rate limiting (4-10 emails/hour)
- [ ] Customize email templates
- [ ] Set up custom SMTP (optional)
- [ ] Add redirect URLs
- [ ] Create confirmation route
- [ ] Create error/success pages
- [ ] Update signup success message
- [ ] Test email flow
- [ ] Monitor delivery

---

## 📚 Additional Resources

- **Supabase Auth Docs**: https://supabase.com/docs/guides/auth
- **Email Templates**: https://supabase.com/docs/guides/auth/auth-email-templates
- **Rate Limiting**: https://supabase.com/docs/guides/auth/auth-rate-limits
- **SMTP Setup**: https://supabase.com/docs/guides/auth/auth-smtp

---

## ✨ Summary

After completing these steps:
1. ✅ Users receive confirmation emails
2. ✅ Email rate limiting prevents abuse
3. ✅ Professional email templates
4. ✅ Smooth confirmation flow
5. ✅ Better security and user experience

**Next:** Follow the steps in order and test thoroughly!
