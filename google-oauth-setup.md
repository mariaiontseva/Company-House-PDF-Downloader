# Google OAuth Setup for Companies House Downloader

This guide will help you set up Google authentication for your application.

## Prerequisites
- Access to your Supabase project dashboard
- Access to Google Cloud Console

## Step 1: Set up Google OAuth in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click on it and press "Enable"

4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - If prompted, configure the OAuth consent screen first:
     - Choose "External" for user type
     - Fill in the required fields (app name, support email, etc.)
     - Add your domain to authorized domains
     - Save and continue through the scopes (you can skip optional scopes)
     - Add test users if needed
     - Save and continue

5. Create the OAuth client:
   - Application type: "Web application"
   - Name: "Companies House Downloader" (or your preferred name)
   - Authorized JavaScript origins:
     - Add your production domain: `https://yourdomain.com`
     - Add localhost for testing: `http://localhost:8000`
   - Authorized redirect URIs:
     - Add: `https://qxyjmwpakxvifymvhirr.supabase.co/auth/v1/callback`
     - Note: Replace `qxyjmwpakxvifymvhirr` with your Supabase project ID
   - Click "Create"

6. Save your credentials:
   - Copy the "Client ID"
   - Copy the "Client Secret"

## Step 2: Configure Google OAuth in Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to "Authentication" → "Providers"
4. Find "Google" in the list and click to expand
5. Toggle "Enable Google provider" to ON
6. Fill in the credentials:
   - Client ID: Paste the Client ID from Google
   - Client Secret: Paste the Client Secret from Google
7. Copy the "Redirect URL" shown in Supabase (it should match what you added in Google)
8. Click "Save"

## Step 3: Update Authorized Redirect URIs (if needed)

If the redirect URL in Supabase is different from what you added in Google:
1. Go back to Google Cloud Console
2. Go to "APIs & Services" → "Credentials"
3. Click on your OAuth 2.0 Client ID
4. Add the exact redirect URL from Supabase to "Authorized redirect URIs"
5. Save

## Step 4: Test the Integration

1. Open your application in a browser
2. Click the profile icon → "Create Account" or "Sign In"
3. Click "Continue with Google"
4. You should be redirected to Google's sign-in page
5. After signing in, you should be redirected back to your app and logged in

## Troubleshooting

### "Error 400: redirect_uri_mismatch"
- Make sure the redirect URI in Google Console exactly matches the one in Supabase
- Check for trailing slashes or protocol differences (http vs https)

### "Access blocked: This app's request is invalid"
- Make sure you've configured the OAuth consent screen
- Add your domain to the authorized domains list

### Users can't sign in
- Check that the Google+ API is enabled
- Verify that your OAuth consent screen is published (not in testing mode) for production use

## Security Notes

- Never commit your Client Secret to version control
- Use environment variables for sensitive credentials in production
- Regularly rotate your OAuth credentials
- Monitor the OAuth consent screen for any security warnings

## Additional Configuration

For production use, you may want to:
- Request additional scopes (like email or profile)
- Customize the OAuth consent screen with your branding
- Set up domain verification for a more professional appearance
- Configure user quotas and rate limits