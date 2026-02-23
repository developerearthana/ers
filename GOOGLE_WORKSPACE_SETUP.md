# Google Workspace Integration Guide for Earthana

This guide walks you through registering Earthana in Google Workspace so all your organization's users can access it via SSO from the app launcher.

## Prerequisites
- Google Workspace admin access
- Earthana deployed at a public URL (e.g., `https://your-project.uc.r.appspot.com`)

---

## Step 1: Create OAuth 2.0 Credentials (GCP Console)

1. Go to [Google Cloud Console → APIs & Credentials](https://console.cloud.google.com/apis/credentials)
2. Select your GCP project (or create one)
3. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
4. If prompted, configure the **OAuth consent screen**:
   - User Type: **Internal** (restricts to your Workspace domain only)
   - App name: `Earthana`
   - User support email: your admin email
   - Authorized domains: your app domain (e.g., `appspot.com`)
   - Save
5. Back in Create OAuth Client ID:
   - Application type: **Web application**
   - Name: `Earthana Web`
   - **Authorized redirect URIs**: add these:
     ```
     https://YOUR-APP-URL/api/auth/callback/google
     http://localhost:3000/api/auth/callback/google  (for local dev)
     ```
6. Click **Create** → copy the **Client ID** and **Client Secret**

---

## Step 2: Set Environment Variables

Add these to your `.env.local` (local dev) and `app.yaml` (production):

```env
AUTH_GOOGLE_ID=your-client-id.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=your-client-secret
AUTH_GOOGLE_HD=yourdomain.com
AUTH_SECRET=your-nextauth-secret
```

> **`AUTH_GOOGLE_HD`** (optional): If set, only users from this Google Workspace domain can sign in. Recommended for internal enterprise apps.

---

## Step 3: Add Earthana to Google Workspace App Launcher

1. Go to [Google Admin Console](https://admin.google.com) → **Apps** → **Web and mobile apps**
2. Click **"Add App"** → **"Add custom SAML app"**
   
   > **Note:** Even though we use OAuth/OIDC, Google Workspace uses the SAML app registration to place apps in the launcher.

3. Fill in app details:
   - App name: `Earthana`
   - App icon: Upload your Earthana logo
   - Click **Continue**

4. Skip the **Google IdP Information** page (click **Continue** — we don't need SAML details since auth is handled via OAuth)

5. **Service Provider Details**:
   - ACS URL: `https://YOUR-APP-URL/api/auth/callback/google`
   - Entity ID: `https://YOUR-APP-URL`
   - Start URL: `https://YOUR-APP-URL`
   - Name ID format: `EMAIL`
   - Name ID: `Basic Information > Primary email`

6. Click **Finish**

### Alternative: Add as Bookmark App (Simpler)
If you only need the app launcher icon (SSO is handled via Google OAuth already):

1. Google Admin Console → **Apps** → **Web and mobile apps**
2. **"Add App"** → **"Add an app from URL"**
3. URL: `https://YOUR-APP-URL`
4. Name: `Earthana`
5. Upload icon
6. Assign to your OU/domain

---

## Step 4: Assign Users

1. In Google Admin Console → **Apps** → **Web and mobile apps** → Click **Earthana**
2. Click **User access**
3. Turn ON for everyone, or select specific **Organizational Units** / **Groups**
4. Click **Save**

The Earthana icon will now appear in all assigned users' Google Workspace app grid (the 3×3 dots grid).

---

## Step 5: Test SSO

1. Open a new browser/incognito window
2. Go to Google Workspace and sign in with a workspace account
3. Click the **app launcher** (9-dots icon top-right) → look for **Earthana**
4. Click it → should go to Earthana → auto sign-in via Google

Or test directly:
1. Go to `https://YOUR-APP-URL/login`
2. Click **"Sign in with Google"**
3. Select your Workspace Google account
4. Should redirect to the Earthana dashboard

---

## Troubleshooting

| Issue | Solution |
|---|---|
| "Access blocked: authorization error" | Check redirect URI matches exactly in GCP Console |
| Google button missing on login page | Ensure `AUTH_GOOGLE_ID` is set in environment |
| User gets `role: 'user'` after sign-in | Admin can change role in Earthana's HRM/User Management |
| Only want Workspace users | Set `AUTH_GOOGLE_HD=yourdomain.com` in environment |
| App not showing in launcher | Allow 24-48 hours for propagation after admin setup |
