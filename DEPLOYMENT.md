# Deployment Guide for GitHub Pages

This guide will help you deploy your Talking Anya app to GitHub Pages.

## Prerequisites

1. A GitHub account
2. Your Gemini API key from [Google AI Studio](https://ai.google.dev/)
3. Node.js installed locally (for testing)

## Deployment Steps

### 1. Push to GitHub

Make sure your code is pushed to the `main` branch of your GitHub repository.

```bash
git add .
git commit -m "Prepare for GitHub Pages deployment"
git push origin main
```

### 2. Configure Repository Settings

1. Go to your repository on GitHub: `https://github.com/kainar-ilyassov/talking-anya`
2. Click on **Settings** → **Pages**
3. Under "Build and deployment":
   - Source: Select **GitHub Actions**

### 3. Add Your API Key as a Secret

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `GEMINI_API_KEY`
4. Value: Paste your Gemini API key
5. Click **Add secret**

### 4. Deploy

The deployment will happen automatically when you push to the `main` branch. You can also:

1. Go to the **Actions** tab in your repository
2. Select the "Deploy to GitHub Pages" workflow
3. Click **Run workflow** → **Run workflow**

### 5. Access Your App

After deployment completes (usually 1-2 minutes), your app will be available at:
- `https://kainar-ilyassov.github.io/talking-anya/`

## Manual Deployment (Alternative)

If you prefer to deploy manually using the `gh-pages` branch:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set your API key locally in `.env.local`:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. Deploy:
   ```bash
   npm run deploy
   ```

This will build the app and push to the `gh-pages` branch.

## Troubleshooting

### Build Fails
- Check that your `GEMINI_API_KEY` secret is correctly set
- Review the Actions logs for specific errors

### App Loads But Doesn't Work
- Verify the API key is valid and has the necessary permissions
- Check browser console for errors
- Ensure the `base` URL in `vite.config.ts` matches your repository name

### 404 Error
- Confirm GitHub Pages is enabled in repository settings
- Check that the source is set to "GitHub Actions"
- Verify the repository name matches the base path: `/talking-anya/`

## Updating the App

Simply push changes to the `main` branch, and GitHub Actions will automatically rebuild and redeploy your app.

```bash
git add .
git commit -m "Update app"
git push origin main
```
