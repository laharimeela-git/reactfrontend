

// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  graphqlEndpoint: 'http://localhost:3000/graphql',
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

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
