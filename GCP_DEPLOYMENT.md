# Deploying Earthana to Google App Engine

This guide outlines the steps to deploy the Earthana application to Google App Engine (Standard Environment).

## Prerequisites
1.  **Google Cloud Project**: You need an active GCP project.
2.  **Google Cloud SDK**: Ensure `gcloud` CLI is installed and authenticated.
3.  **Cloud SQL**: A PostgreSQL instance running on Cloud SQL (since this is a Next.js app with a database).

## Deployment Steps

### 1. Initialize Google Cloud SDK
If you haven't already, authenticate with your Google account:
```bash
gcloud auth login
```
Set your project ID:
```bash
gcloud config set project [YOUR_PROJECT_ID]
```

### 2. Configure Environment Variables
Open `app.yaml` and uncomment/fill in the `env_variables` section. 
**CRITICAL**: You must provide the `DATABASE_URL` for your Cloud SQL instance.

```yaml
env_variables:
  NODE_ENV: 'production'
  DATABASE_URL: 'postgres://user:password@ip:port/database' # Connection string
  NEXT_PUBLIC_API_URL: 'https://[YOUR_PROJECT_ID].uc.r.appspot.com/api' # Update after first deploy
  AUTH_SECRET: 'your_auth_secret' # Generate with `openssl rand -base64 32`
```

### 3. Deploy
Run the following command from the root of the repository:
```bash
gcloud app deploy
```
This command will:
1.  Upload your source code to Google Cloud Build.
2.  Build the container using Google's Node.js buildpacks.
3.  Deploy the underlying container to App Engine instances.

### 4. Verify
Once deployment is complete, `gcloud` will output the URL of your application.
Visit `https://[YOUR_PROJECT_ID].uc.r.appspot.com` to check if it's running.

## Google OAuth / Workspace SSO (Optional)

To enable **"Sign in with Google"** and integrate with Google Workspace app launcher, see [`GOOGLE_WORKSPACE_SETUP.md`](./GOOGLE_WORKSPACE_SETUP.md).

You will need these additional environment variables:
```yaml
env_variables:
  AUTH_GOOGLE_ID: 'your-google-client-id.apps.googleusercontent.com'
  AUTH_GOOGLE_SECRET: 'your-google-client-secret'
  AUTH_GOOGLE_HD: 'yourdomain.com'  # Optional: restrict to Workspace domain
```

## Troubleshooting
- **Build Errors**: Check Cloud Build logs in the GCP Console.
- **Runtime Errors**: View application logs:
  ```bash
  gcloud app logs tail -s default
  ```
