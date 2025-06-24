# FLIX Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the FLIX Movie Discovery Platform across various hosting environments. The application is designed as a static single-page application (SPA) that can be deployed to any static hosting service.

## Prerequisites

### System Requirements
- Node.js version 16.0 or higher
- npm package manager
- Git version control system
- Modern web browser for testing

### API Requirements
- TMDB API key from The Movie Database
- OMDB API key from Open Movie Database
- Optional: VAPID keys for push notifications
- Optional: Analytics tracking ID

## Build Process

### Local Build
```bash
# Clone the repository
git clone https://github.com/mokwathedeveloper/flix-movie-discovery.git
cd flix-movie-discovery

# Install dependencies
npm install

# Create environment configuration
cp .env.example .env
# Edit .env with your API keys

# Build for production
npm run build

# Preview the build locally
npm run preview
```

### Environment Configuration
Create a `.env` file with the following variables:
```env
VITE_TMDB_API_KEY=your_tmdb_api_key_here
VITE_OMDB_API_KEY=your_omdb_api_key_here
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
VITE_GA_TRACKING_ID=your_analytics_id
```

### Build Output
The build process generates a `dist` directory containing:
- Optimized HTML, CSS, and JavaScript files
- Compressed assets and images
- Service worker for PWA functionality
- Web app manifest for installation

## Deployment Platforms

### Vercel Deployment (Recommended)

**Automatic Deployment**
1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Configure environment variables in the Vercel dashboard
4. Deploy automatically on every push to main branch

**Manual Deployment**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from project directory
vercel

# Follow the prompts to configure deployment
```

**Vercel Configuration**
Create `vercel.json` in project root:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Netlify Deployment

**Drag and Drop Deployment**
1. Build the project locally: `npm run build`
2. Navigate to Netlify dashboard
3. Drag the `dist` folder to the deployment area
4. Configure environment variables in site settings

**Git-based Deployment**
1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables
5. Deploy automatically on git push

**Netlify Configuration**
Create `netlify.toml` in project root:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "16"
```

### GitHub Pages Deployment

**GitHub Actions Workflow**
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build
      run: npm run build
      env:
        VITE_TMDB_API_KEY: ${{ secrets.VITE_TMDB_API_KEY }}
        VITE_OMDB_API_KEY: ${{ secrets.VITE_OMDB_API_KEY }}
        
    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

### AWS S3 + CloudFront Deployment

**S3 Bucket Setup**
1. Create an S3 bucket with public read access
2. Enable static website hosting
3. Upload the contents of the `dist` directory
4. Configure bucket policy for public access

**CloudFront Distribution**
1. Create a CloudFront distribution
2. Set S3 bucket as origin
3. Configure custom error pages for SPA routing
4. Enable compression and caching

**AWS CLI Deployment**
```bash
# Build the project
npm run build

# Sync to S3 bucket
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### Docker Deployment

**Dockerfile**
```dockerfile
# Build stage
FROM node:16-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Nginx Configuration**
Create `nginx.conf`:
```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /static/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

**Docker Commands**
```bash
# Build Docker image
docker build -t flix-app .

# Run container
docker run -p 80:80 flix-app

# Docker Compose
docker-compose up -d
```

## Environment-Specific Configuration

### Production Environment Variables
```env
VITE_TMDB_API_KEY=production_tmdb_key
VITE_OMDB_API_KEY=production_omdb_key
VITE_GA_TRACKING_ID=production_analytics_id
VITE_ENABLE_PWA=true
VITE_ENABLE_ANALYTICS=true
```

### Staging Environment Variables
```env
VITE_TMDB_API_KEY=staging_tmdb_key
VITE_OMDB_API_KEY=staging_omdb_key
VITE_GA_TRACKING_ID=staging_analytics_id
VITE_ENABLE_PWA=false
VITE_ENABLE_ANALYTICS=false
```

### Development Environment Variables
```env
VITE_TMDB_API_KEY=development_tmdb_key
VITE_OMDB_API_KEY=development_omdb_key
VITE_ENABLE_PWA=false
VITE_ENABLE_ANALYTICS=false
```

## Security Configuration

### HTTPS Setup
- Ensure all deployments use HTTPS
- Configure SSL certificates through hosting provider
- Update service worker for HTTPS requirements
- Test PWA functionality with HTTPS

### Content Security Policy
Add CSP headers to your hosting configuration:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.themoviedb.org https://www.omdbapi.com;
```

### API Key Security
- Store API keys as environment variables
- Never commit API keys to version control
- Use different keys for different environments
- Monitor API usage and set up alerts

## Performance Optimization

### Build Optimization
```bash
# Analyze bundle size
npm run build -- --analyze

# Enable compression
npm run build -- --compress

# Optimize images
npm run build -- --optimize-images
```

### CDN Configuration
- Enable gzip compression
- Set appropriate cache headers
- Configure browser caching
- Use CDN for static assets

### Monitoring Setup
- Configure error tracking (Sentry)
- Set up performance monitoring
- Monitor API usage and limits
- Track user analytics

## Post-Deployment Verification

### Functionality Testing
1. Verify all pages load correctly
2. Test search functionality
3. Confirm API integrations work
4. Validate PWA installation
5. Test offline functionality

### Performance Testing
1. Run Lighthouse audits
2. Test loading speeds
3. Verify mobile responsiveness
4. Check accessibility compliance

### Security Testing
1. Verify HTTPS configuration
2. Test CSP headers
3. Confirm API key security
4. Validate input sanitization

## Maintenance and Updates

### Regular Maintenance Tasks
- Monitor API usage and limits
- Update dependencies regularly
- Review and rotate API keys
- Monitor application performance
- Check for security vulnerabilities

### Update Deployment Process
1. Test updates in staging environment
2. Create backup of current deployment
3. Deploy updates to production
4. Verify functionality post-deployment
5. Monitor for issues and rollback if necessary

### Rollback Procedures
- Maintain previous build artifacts
- Document rollback procedures
- Test rollback process regularly
- Monitor application after rollback

## Troubleshooting

### Common Deployment Issues
- Environment variable configuration errors
- API key authentication failures
- Build process failures
- Routing issues with SPA
- PWA service worker problems

### Debug Steps
1. Check build logs for errors
2. Verify environment variable configuration
3. Test API connectivity
4. Validate routing configuration
5. Check browser console for errors

### Support Resources
- Hosting provider documentation
- Application error logs
- API provider status pages
- Community forums and support
