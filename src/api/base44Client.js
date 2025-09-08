import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

export const base44 = createClient({
  appId: "68b293d12108eea4d6f660f3", 
  requiresAuth: false // Permite acesso aberto/público!
});