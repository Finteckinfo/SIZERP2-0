import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useUser } from '@clerk/vue';

/**
 * Unified User Store
 * Provides consistent user data across siz.land and erp.siz.land
 * Uses Clerk's session which is shared across both domains
 */
export const useUnifiedUser = defineStore('unifiedUser', () => {
  const { user, isLoaded, isSignedIn } = useUser();
  
  // Unified user data that works across all domains
  const userId = computed(() => user.value?.id || null);
  
  const userEmail = computed(() => 
    user.value?.primaryEmailAddress?.emailAddress || null
  );
  
  const userName = computed(() => {
    const firstName = user.value?.firstName || '';
    const lastName = user.value?.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || userEmail.value || 'User';
  });
  
  const userAvatar = computed(() => user.value?.imageUrl || null);
  
  // Check if user has Web3 wallet connected
  const hasWeb3Wallet = computed(() => {
    return user.value?.unsafeMetadata?.walletAddress ? true : false;
  });
  
  const walletAddress = computed(() => {
    return user.value?.unsafeMetadata?.walletAddress as string | null;
  });

  // Auth method (web2 or web3)
  const authMethod = computed(() => {
    return user.value?.unsafeMetadata?.authMethod as string | null;
  });

  // Full name components
  const firstName = computed(() => user.value?.firstName || '');
  const lastName = computed(() => user.value?.lastName || '');

  return {
    // Raw user object
    user,
    
    // Loading states
    isLoaded,
    isSignedIn,
    
    // User identification
    userId,
    userEmail,
    userName,
    firstName,
    lastName,
    userAvatar,
    
    // Web3 data
    hasWeb3Wallet,
    walletAddress,
    authMethod
  };
});
