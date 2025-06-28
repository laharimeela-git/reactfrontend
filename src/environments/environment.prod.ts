export const environment = {
  production: true,
  graphqlEndpoint: 'https://your-production-server.com/graphql', // Update with your production URL
  apiTimeout: 5000,
  cacheTimeout: 300000, // 5 minutes
  debounceTime: 300,
  minSearchLength: 2,
  maxSuggestions: 20,
  // Google Authentication Configuration
  googleAuth: {
    clientId: '149820365311-kjsdi31fj5ue8s00jl9av7d1mk79mkih.apps.googleusercontent.com'
  }
}; 