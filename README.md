# FLIX Movie Discovery Platform

FLIX is a comprehensive movie and TV show discovery application built with modern web technologies. The platform provides users with an intuitive interface to search, discover, and manage their entertainment preferences through advanced filtering, personalized recommendations, and detailed analytics.

## Overview

This application serves as a complete entertainment discovery solution, offering real-time search capabilities, trending content exploration, and personal watchlist management. Built with React 18 and powered by The Movie Database (TMDB) API, FLIX delivers a responsive, accessible, and feature-rich user experience across all devices.

## Core Features

### Content Discovery
- Real-time search across movies, TV shows, and people
- Advanced filtering by genre, year, rating, and content type
- Trending content discovery with daily updates
- Popular and top-rated content collections
- New releases and upcoming content tracking

### Personal Management
- Comprehensive watchlist with multiple status tracking
- Personal ratings and notes system
- Viewing progress tracking for TV shows
- Bulk operations and advanced list management
- Data export in multiple formats (CSV, JSON, PDF)

### User Experience
- Responsive design optimized for all screen sizes
- Multiple theme options with automatic system detection
- Progressive Web App (PWA) capabilities
- Offline functionality with service worker implementation
- Push notifications for new content and updates

### Analytics and Insights
- Detailed viewing statistics and patterns
- Genre preferences and content type analysis
- Search behavior tracking and optimization
- Export capabilities for personal data analysis
- Privacy-focused analytics implementation

## Technical Architecture

### Frontend Stack
- **Framework**: React 18 with functional components and hooks
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: TailwindCSS with custom design system implementation
- **State Management**: React Context API for global state
- **Routing**: React Router v6 for client-side navigation
- **Icons**: Lucide React for consistent iconography

### API Integration
- **Primary API**: The Movie Database (TMDB) API v3
- **Secondary API**: Open Movie Database (OMDB) API
- **Caching Strategy**: Intelligent caching with configurable TTL
- **Error Handling**: Comprehensive error boundaries and fallback mechanisms
- **Rate Limiting**: Automatic retry logic with exponential backoff

### Performance Optimization
- **Code Splitting**: Dynamic imports for route-based code splitting
- **Lazy Loading**: Image lazy loading and component-level lazy loading
- **Caching**: Multi-layer caching strategy for API responses and assets
- **Virtual Scrolling**: Efficient rendering for large content lists
- **Service Workers**: Background sync and offline functionality

## Installation and Setup

### System Requirements
- Node.js version 16.0 or higher
- npm package manager
- Modern web browser with ES6+ support

### API Requirements
- TMDB API key (obtain from [The Movie Database](https://www.themoviedb.org/settings/api))
- OMDB API key (obtain from [Open Movie Database](http://www.omdbapi.com/apikey.aspx))

### Installation Process

1. **Repository Setup**
```bash
git clone https://github.com/your-username/flix-movie-discovery.git
cd flix-movie-discovery
npm install
```

2. **Environment Configuration**

Create a `.env` file in the project root:

```env
# Required API Configuration
VITE_TMDB_API_KEY=your_tmdb_api_key_here
VITE_OMDB_API_KEY=your_omdb_api_key_here

# Optional Configuration
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
VITE_GA_TRACKING_ID=your_analytics_id
VITE_ENABLE_PWA=true
VITE_ENABLE_ANALYTICS=true
```

3. **Development Server**
```bash
npm run dev
```
Access the application at `http://localhost:5173`

4. **Production Build**
```bash
npm run build
npm run preview
```

### Deployment Options

**Vercel Deployment**
1. Connect repository to Vercel
2. Configure environment variables in dashboard
3. Deploy automatically on push

**Netlify Deployment**
1. Build project: `npm run build`
2. Deploy `dist` folder to Netlify
3. Configure environment variables

**Docker Deployment**
```bash
docker build -t flix-app .
docker run -p 3000:3000 flix-app
```

## Project Structure

```
flix-movie-discovery/
├── public/
│   ├── manifest.json       # Progressive Web App manifest
│   ├── sw.js              # Service worker for offline functionality
│   └── offline.html       # Offline fallback page
├── src/
│   ├── components/
│   │   ├── common/        # Reusable utility components
│   │   ├── layout/        # Application layout components
│   │   └── ui/            # User interface components
│   ├── context/           # React Context providers for global state
│   ├── hooks/             # Custom React hooks for business logic
│   ├── pages/             # Route-level page components
│   ├── services/          # API integration and external services
│   ├── utils/             # Utility functions and helpers
│   ├── styles/            # Global CSS and styling
│   ├── App.jsx            # Root application component
│   └── main.jsx           # Application entry point
├── .env.example           # Environment variables template
├── package.json           # Project dependencies and scripts
├── vite.config.js         # Vite build configuration
├── tailwind.config.js     # TailwindCSS configuration
└── vitest.config.js       # Testing configuration
```

### Component Architecture

**Common Components**
- `LoadingSpinner`: Reusable loading indicators
- `ErrorBoundary`: Error handling and fallback UI
- `LazyImage`: Optimized image loading component

**UI Components**
- `MovieCard`: Content display cards with interaction handlers
- `SearchBar`: Search input with real-time suggestions
- `ContentSection`: Organized content display with pagination
- `AdvancedFilters`: Complex filtering interface
- `AnalyticsDashboard`: Data visualization components

**Layout Components**
- `Header`: Navigation and user interface controls
- `Footer`: Application footer with links and information

**Page Components**
- `HomePage`: Landing page with trending content
- `SearchPage`: Advanced search and filtering interface
- `MovieDetailPage`: Detailed content information
- `WatchlistPage`: Personal content management
- `AnalyticsPage`: User statistics and insights
- `PreferencesPage`: Application settings and customization

## Application Features

### Content Discovery
The application provides multiple pathways for content discovery:

**Search Functionality**
- Real-time search with instant results
- Multi-category search across movies, TV shows, and people
- Advanced filtering by genre, release year, rating, and content type
- Sorting options by popularity, rating, title, and release date
- Grid and list view modes for optimal content browsing

**Trending and Popular Content**
- Daily updated trending content across all categories
- Popular movies and TV shows with regional customization
- Top-rated content with user rating integration
- Upcoming releases and new content notifications

### Personal Content Management

**Watchlist System**
- Comprehensive status tracking: Want to Watch, Watching, Watched, On Hold, Dropped
- Personal rating system with 10-point scale
- Custom notes and comments for each item
- Progress tracking for TV shows with episode-level detail
- Bulk operations for efficient list management

**Data Management**
- Export functionality in multiple formats (CSV, JSON, PDF)
- Import capabilities from external platforms
- Data backup and restoration features
- Privacy-focused data handling with local storage

### Analytics and Insights

**Viewing Statistics**
- Comprehensive viewing pattern analysis
- Genre preference tracking and visualization
- Content type distribution analysis
- Temporal viewing patterns (hourly, daily, monthly)
- Viewing streak tracking and gamification elements

**Search Analytics**
- Search behavior tracking and optimization
- Query success rate analysis
- Popular search terms and trends
- Search result effectiveness metrics

### User Experience Features

**Progressive Web App Capabilities**
- Native app installation on supported devices
- Offline functionality with service worker implementation
- Background synchronization for data consistency
- Push notification system for content updates

**Accessibility and Customization**
- WCAG 2.1 AA compliance for accessibility
- Multiple theme options with system preference detection
- Responsive design for all screen sizes and orientations
- Keyboard navigation support throughout the application
- High contrast mode and reduced motion options

## API Integration

### The Movie Database (TMDB) API
The primary data source for movie and TV show information:

**Endpoints Utilized**
- Search endpoints for multi-category content discovery
- Trending endpoints for popular content identification
- Detail endpoints for comprehensive content information
- Recommendation endpoints for personalized suggestions
- Watch provider endpoints for streaming availability

**Implementation Details**
- Intelligent caching strategy with configurable TTL
- Rate limiting compliance with automatic retry logic
- Error handling with graceful degradation
- Response optimization and data transformation

### Open Movie Database (OMDB) API
Secondary data source for additional ratings and metadata:

**Integration Purpose**
- IMDb rating integration
- Rotten Tomatoes score inclusion
- Metacritic rating display
- Additional plot and award information

**Fallback Strategy**
- Graceful degradation when OMDB is unavailable
- Primary functionality maintained with TMDB data only
- Optional enhancement without breaking core features

## Development and Testing

### Development Environment
```bash
# Development server with hot reload
npm run dev

# Linting and code formatting
npm run lint
npm run format

# Type checking and validation
npm run lint:fix
```

### Testing Framework
```bash
# Unit and integration tests
npm test

# Test coverage analysis
npm run test:coverage

# Interactive test UI
npm run test:ui
```

**Testing Strategy**
- Component-level unit tests with React Testing Library
- Service-level integration tests for API interactions
- Hook testing for custom React hooks
- Error boundary and fallback testing
- Accessibility testing with automated tools

### Code Quality
- ESLint configuration for code consistency
- Prettier integration for automatic formatting
- Husky pre-commit hooks for quality assurance
- TypeScript support for enhanced development experience

## Configuration and Customization

### Environment Variables
The application requires specific environment variables for proper functionality:

**Required Configuration**
```env
VITE_TMDB_API_KEY=your_tmdb_api_key_here
VITE_OMDB_API_KEY=your_omdb_api_key_here
```

**Optional Configuration**
```env
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
VITE_GA_TRACKING_ID=your_analytics_id
VITE_ENABLE_PWA=true
VITE_ENABLE_ANALYTICS=true
VITE_CACHE_DURATION=300000
```

### Customization Options

**Theme System**
- Modify `src/context/ThemeContext.jsx` for additional themes
- Customize color schemes and design tokens
- Configure automatic theme switching behavior

**API Configuration**
- Update `src/services/api.js` for custom API endpoints
- Modify caching strategies and timeout values
- Configure rate limiting and retry logic

**Storage Configuration**
- Customize localStorage keys in `src/utils/localStorage.js`
- Configure data retention policies
- Implement custom storage backends

**Analytics Configuration**
- Customize tracking events in `src/services/analyticsService.js`
- Configure privacy settings and data collection
- Implement custom analytics providers

### Performance Optimization

**Caching Strategy**
- API response caching with intelligent TTL
- Image caching with lazy loading implementation
- Component-level memoization for expensive operations

**Bundle Optimization**
- Code splitting at route level
- Dynamic imports for large dependencies
- Tree shaking for unused code elimination

**Runtime Performance**
- Virtual scrolling for large content lists
- Debounced search input for reduced API calls
- Optimized re-rendering with React.memo and useMemo

## Troubleshooting

### Common Issues and Solutions

**API Configuration Issues**
- Verify TMDB API key validity and activation status
- Confirm environment variables are properly configured
- Check API key permissions and usage limits in TMDB dashboard
- Ensure proper API endpoint accessibility

**Build and Deployment Issues**
- Clear dependency cache: `rm -rf node_modules package-lock.json && npm install`
- Verify Node.js version compatibility (16.0 or higher required)
- Confirm all required environment variables are set
- Check build output for specific error messages

**Progressive Web App Issues**
- Verify manifest.json accessibility and validity
- Confirm service worker registration in browser developer tools
- Ensure HTTPS protocol in production environment
- Check browser PWA support and installation requirements

**Performance Optimization**
- Implement image lazy loading for improved load times
- Utilize React.memo for computationally expensive components
- Enable virtual scrolling for large content lists
- Optimize bundle size through code splitting and tree shaking

### Browser Compatibility
- Modern browsers with ES6+ support required
- Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- Progressive enhancement for older browsers
- Graceful degradation for unsupported features

## Security Considerations

### API Key Protection
- Store API keys in environment variables only
- Never commit API keys to version control
- Implement key rotation strategies for production
- Monitor API usage and implement rate limiting

### Data Privacy
- Local storage implementation for user data
- No sensitive information transmitted to external services
- GDPR compliance for European users
- User data export and deletion capabilities

## License

MIT License

Copyright (c) 2025 FLIX Movie Discovery Platform

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Acknowledgments

This project utilizes several open-source technologies and services:

- The Movie Database (TMDB) for comprehensive entertainment data
- Open Movie Database (OMDB) for additional rating information
- React ecosystem for frontend framework and tooling
- TailwindCSS for utility-first styling approach
- Vite for modern build tooling and development experience
- Lucide React for consistent iconography