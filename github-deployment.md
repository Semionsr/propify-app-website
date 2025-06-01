# Deploy to GitHub Pages - Step by Step

## Method 1: Using GitHub Website (Easiest)

### Step 1: Create GitHub Account
1. Go to https://github.com
2. Click "Sign up" if you don't have an account
3. Create your account

### Step 2: Create Repository
1. Click the "+" icon in top right corner
2. Select "New repository"
3. Name it: `propify-app-website` 
4. Make it **Public** (required for free GitHub Pages)
5. Click "Create repository"

### Step 3: Upload Files
1. Click "uploading an existing file"
2. Drag and drop ALL your website files:
   - index.html
   - styles.css
   - script.js
   - fitiva.html
   - micro.html
   - propify.html
   - privacy.html
   - terms.html
   - README.md
   - development-roadmap.md
3. Write commit message: "Add Propify App LLC website"
4. Click "Commit changes"

### Step 4: Enable GitHub Pages
1. Go to repository Settings (tab at top)
2. Scroll down to "Pages" section (left sidebar)
3. Under "Source", select "Deploy from a branch"
4. Choose "main" branch
5. Choose "/ (root)" folder
6. Click "Save"

### Step 5: Access Your Website
- Your website will be live at: `https://[your-username].github.io/propify-app-website`
- It may take 5-10 minutes to become available
- GitHub will show you the exact URL in the Pages settings

## Method 2: Using Command Line (Advanced)

```bash
# Add GitHub repository as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/propify-app-website.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Custom Domain (Optional)

If you want a custom domain like `www.propifyapp.com`:

1. **Buy domain** from GoDaddy, Namecheap, etc.
2. **Add CNAME file** to repository with your domain
3. **Configure DNS** settings with your domain provider
4. **Enable custom domain** in GitHub Pages settings

## Benefits of GitHub Pages

✅ **Free hosting**
✅ **Automatic HTTPS**
✅ **Version control**
✅ **Easy updates** (just push new commits)
✅ **Professional subdomain**
✅ **No server management**

## Updating Website

To update your website later:
1. Make changes to files locally
2. Upload new files to GitHub (overwrite old ones)
3. Website updates automatically 