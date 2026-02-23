# Vercel Deployment Guide for Earthana

This guide explains how to deploy the Earthana (Planrite) application to Vercel Cloud using GitHub integration.

## Prerequisites

1.  **GitHub Repository**: Ensure your code is pushed to a GitHub repository.
2.  **MongoDB Atlas**: Vercel cannot connect to your local MongoDB. You must set up a free (or paid) cluster on [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database).
3.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).

## Step 1: Connect to Vercel

1.  Go to the [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** and select **"Project"**.
3.  Select your GitHub repository from the list and click **"Import"**.

## Step 2: Configure Project Settings

In the "Configure Project" screen:

1.  **Framework Preset**: Select **Next.js** (it should be auto-detected).
2.  **Build and Output Settings**: Keep the defaults (`npm run build`).
3.  **Environment Variables**: This is the most critical step. Expand the "Environment Variables" section and add the following:

| Variable | Value | Description |
| :--- | :--- | :--- |
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
| `AUTH_SECRET` | `your-random-secret` | A long, secure random string (generate one) |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Your Vercel deployment URL (or leave blank if using `trustHost`) |

> [!TIP]
> You can generate a secure secret using: `openssl rand -base64 32`

## Step 3: Deploy

1.  Click **"Deploy"**.
2.  Vercel will build your application and provide a production URL.

## Post-Deployment Checklist

- [ ] Verify that you can log in with your production credentials.
- [ ] Ensure database operations (fiscal years, transactions) work as expected.
- [ ] Check the Vercel logs for any runtime errors.

## Troubleshooting

- **Authentication Errors**: Ensure `AUTH_SECRET` is set and `trustHost: true` is present in `auth.ts`.
- **Database Connection**: Ensure your MongoDB Atlas cluster allows connections from `0.0.0.0/0` (or Vercel's IP ranges) in the Network Access settings.
