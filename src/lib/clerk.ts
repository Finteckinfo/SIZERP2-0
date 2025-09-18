import { Clerk } from '@clerk/clerk-js';

// Initialize Clerk with satellite domain configuration if needed
const clerkOptions: any = {};

if (import.meta.env.VITE_CLERK_IS_SATELLITE === 'true') {
  clerkOptions.isSatellite = true;
  clerkOptions.domain = import.meta.env.VITE_CLERK_DOMAIN;
  clerkOptions.signInUrl = import.meta.env.VITE_CLERK_SIGN_IN_URL;
  clerkOptions.signUpUrl = import.meta.env.VITE_CLERK_SIGN_UP_URL;
}

export const clerk = new Clerk(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY, clerkOptions);
