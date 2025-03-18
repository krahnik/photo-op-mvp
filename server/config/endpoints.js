module.exports = {
  // Authentication endpoints
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh'
  },
  
  // Image processing endpoints
  image: {
    upload: '/api/image/upload',
    process: '/api/image/process',
    validate: '/api/image/validate',
    download: '/api/image/download/:id',
    delete: '/api/image/delete/:id'
  },
  
  // User management endpoints
  user: {
    profile: '/api/user/profile',
    credits: '/api/user/credits',
    history: '/api/user/history'
  },
  
  // Theme management endpoints
  theme: {
    list: '/api/theme/list',
    custom: '/api/theme/custom'
  },
  
  // Analytics and tracking endpoints
  tracking: {
    event: '/api/tracking/event',
    stats: '/api/tracking/stats'
  }
}; 