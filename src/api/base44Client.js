import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68b293d12108eea4d6f660f3", 
  requiresAuth: true // Ensure authentication is required for all operations
});
