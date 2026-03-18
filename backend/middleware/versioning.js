/**
 * API Versioning Middleware
 * Supports /api/v1/ endpoints with automatic stripping of version prefix
 * Maintains backward compatibility with old /api/ endpoints via deprecation warnings
 */

const apiVersioning = (req, res, next) => {
  const path = req.path;
  
  // Check if using v1 endpoints (preferred)
  if (path.startsWith('/api/v1/')) {
    req.apiVersion = 1;
    req.path = path.replace('/api/v1', '');
    // Remove double slashes that might occur
    req.path = req.path.replace('//', '/');
    return next();
  }
  
  // Check if using old /api/ endpoints (deprecated but still functional)
  if (path.startsWith('/api/')) {
    req.apiVersion = 1;
    // Add deprecation warning headers for monitoring
    res.setHeader('X-API-Deprecated', 'true');
    res.setHeader('X-API-Successor-Version', '/api/v1' + path.replace('/api', ''));
    res.setHeader('Link', '</api/v1' + path.replace('/api', '') + '>; rel="successor-version"');
    
    // Log deprecation warning for server monitoring
    console.warn(`[DEPRECATION] Client using old API endpoint: ${path}. ` +
                 `Please migrate to /api/v1${path.replace('/api', '')}. ` +
                 `Old endpoints will be removed in 6 months.`);
    return next();
  }
  
  next();
};

module.exports = apiVersioning;