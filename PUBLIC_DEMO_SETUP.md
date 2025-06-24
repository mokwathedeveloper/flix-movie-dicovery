# Public Demo Deployment Setup Guide

This guide provides step-by-step instructions for setting up a public demo deployment of the FLIX Movie Discovery Platform that users can access without needing their own API keys.

## Overview

The public demo serves as a showcase for the application's features and capabilities. It uses dedicated demo API keys and is configured to provide a representative experience while maintaining security and performance.

## Prerequisites

### Required Accounts
1. **TMDB Account** - For demo API key
2. **OMDB Account** - For demo API key  
3. **Hosting Platform Account** - Netlify (recommended) or Vercel
4. **GitHub Account** - For repository access and CI/CD

### Required API Keys
- Demo TMDB API key (separate from personal/production keys)
- Demo OMDB API key (separate from personal/production keys)

## Step 1: Obtain Demo API Keys

### TMDB Demo API Key
1. Create a new TMDB account specifically for demo purposes
2. Navigate to [TMDB API Settings](https://www.themoviedb.org/settings/api)
3. Request an API key with the following details:
   - **Application Name:** "FLIX Movie Discovery - Public Demo"
   - **Application Type:** Website
   - **Application Summary:** "Public demo deployment for FLIX movie discovery platform"
   - **Application URL:** Your planned demo URL
4. Save the API key securely

### OMDB Demo API Key
1. Visit [OMDB API Key Request](http://www.omdbapi.com/apikey.aspx)
2. Select the free tier (1,000 requests per day)
3. Provide demo-specific email address
4. Use for demo purposes only
5. Save the API key securely

## Step 2: Choose Hosting Platform

### Option A: Netlify (Recommended)

**Advantages:**
- Generous free tier (100GB bandwidth/month)
- Excellent React SPA support
- Easy environment variable management
- Automatic deployments from GitHub
- Built-in form handling and redirects

**Setup Process:**
1. Create Netlify account at [netlify.com](https://netlify.com)
2. Connect your GitHub account
3. Import the FLIX repository
4. Configure build settings (see Step 3)

### Option B: Vercel

**Advantages:**
- Excellent performance and CDN
- Great developer experience
- Automatic deployments

**Setup Process:**
1. Create Vercel account at [vercel.com](https://vercel.com)
2. Connect your GitHub account
3. Import the FLIX repository
4. Configure build settings (see Step 3)

## Step 3: Configure Deployment Settings

### Netlify Configuration

**Build Settings:**
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** `18`

**Environment Variables:**
Navigate to Site Settings > Environment Variables and add:
```
VITE_TMDB_API_KEY=your_demo_tmdb_api_key
VITE_OMDB_API_KEY=your_demo_omdb_api_key
VITE_ENABLE_PWA=true
VITE_ENABLE_ANALYTICS=false
VITE_APP_NAME=FLIX Movie Discovery - Demo
```

**Deploy Settings:**
- **Branch to deploy:** `main` or `master`
- **Auto-deploy:** Enabled
- **Build hooks:** Optional (for manual deployments)

### Vercel Configuration

**Build Settings:**
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

**Environment Variables:**
Navigate to Project Settings > Environment Variables and add the same variables as above.

## Step 4: Deploy and Test

### Initial Deployment
1. Push your code to the connected GitHub repository
2. Monitor the build process in your hosting platform dashboard
3. Wait for deployment to complete
4. Access the deployed URL to test functionality

### Testing Checklist
- [ ] Homepage loads correctly
- [ ] Search functionality works
- [ ] Movie/TV show details display properly
- [ ] Trending content appears
- [ ] Responsive design works on mobile
- [ ] PWA installation works (if enabled)
- [ ] No console errors in browser developer tools

## Step 5: Update Documentation

### Update README.md
Replace the placeholder demo URL in the README.md file:
```markdown
**[View Live Demo](https://your-actual-demo-url.netlify.app)**
```

### Update Repository About Section
1. Go to your GitHub repository
2. Click the gear icon next to "About"
3. Add the demo URL in the "Website" field
4. Update description and topics as needed

## Step 6: Configure Custom Domain (Optional)

### Netlify Custom Domain
1. Go to Site Settings > Domain management
2. Add custom domain (e.g., `demo.flixapp.com`)
3. Configure DNS settings with your domain provider
4. Enable HTTPS (automatic with Netlify)

### Vercel Custom Domain
1. Go to Project Settings > Domains
2. Add custom domain
3. Configure DNS settings
4. HTTPS is automatically enabled

## Security Considerations

### API Key Security
- Use dedicated demo API keys (never production keys)
- Monitor API usage regularly
- Set up usage alerts if available
- Rotate keys periodically

### Rate Limiting
- Monitor demo API usage to prevent quota exhaustion
- Consider implementing client-side rate limiting
- Set up monitoring alerts for high usage

### Content Security
- Ensure demo content is appropriate for public viewing
- Monitor for any inappropriate user-generated content
- Implement content filtering if necessary

## Monitoring and Maintenance

### Performance Monitoring
- Set up uptime monitoring (e.g., UptimeRobot)
- Monitor Core Web Vitals with Google PageSpeed Insights
- Track build success/failure rates
- Monitor API response times

### Usage Analytics
- Enable basic analytics (if desired)
- Monitor user engagement patterns
- Track feature usage
- Identify popular content

### Regular Maintenance Tasks
- [ ] Weekly: Check demo functionality
- [ ] Monthly: Review API usage and limits
- [ ] Quarterly: Update dependencies
- [ ] Annually: Rotate demo API keys

## Troubleshooting

### Common Issues

**Build Failures:**
- Check environment variables are set correctly
- Verify Node.js version compatibility
- Review build logs for specific errors
- Ensure all dependencies are properly installed

**API Issues:**
- Verify API keys are valid and active
- Check API rate limits and usage
- Test API endpoints manually
- Review CORS settings if applicable

**Deployment Issues:**
- Check build command and output directory
- Verify repository permissions
- Review deployment logs
- Test local build process

### Support Resources
- Netlify Documentation: [docs.netlify.com](https://docs.netlify.com)
- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- TMDB API Documentation: [developers.themoviedb.org](https://developers.themoviedb.org)
- OMDB API Documentation: [omdbapi.com](http://omdbapi.com)
- Project Repository: [github.com/mokwathedeveloper/flix-movie-discovery](https://github.com/mokwathedeveloper/flix-movie-discovery)

## Success Metrics

### Deployment Success Indicators
- [ ] Demo site loads without errors
- [ ] All core features function properly
- [ ] Mobile responsiveness works correctly
- [ ] PWA installation available
- [ ] Search and content discovery work
- [ ] Performance scores are acceptable (>80 Lighthouse)

### Ongoing Success Metrics
- Uptime percentage (target: >99%)
- Page load speed (target: <3 seconds)
- API response success rate (target: >95%)
- User engagement (if analytics enabled)
- Build success rate (target: >95%)
