<script setup lang="ts">
import Logo from '@/layouts/full/logo/LogoDark.vue';
import { SignIn, SignUp } from '@clerk/vue';
import { useTheme } from '@/composables/useTheme';
import ThemeToggle from '@/components/shared/ThemeToggle.vue';
import { ref, watch } from 'vue';

const { isDark } = useTheme();
const isLoginMode = ref(false); // Start with SignUp mode

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value;
};

// Watch for theme changes and update document body class for Clerk
watch(isDark, (newValue) => {
  // Update document body class to trigger Clerk's appearance detection
  if (newValue) {
    document.body.classList.add('dark-theme');
    document.body.classList.remove('light-theme');
    document.documentElement.classList.add('dark-theme');
    document.documentElement.classList.remove('light-theme');
  } else {
    document.body.classList.add('light-theme');
    document.body.classList.remove('dark-theme');
    document.documentElement.classList.add('light-theme');
    document.documentElement.classList.remove('dark-theme');
  }
  
  // Force Clerk to re-render with new appearance
  if (window.Clerk) {
    // Try to directly set Clerk's appearance mode
    try {
      if (window.Clerk.setActive && typeof window.Clerk.setActive === 'function') {
        // This might not work, but worth trying
        console.log('Attempting to sync Clerk appearance with theme');
      }
    } catch (e) {
      console.log('Clerk appearance sync not available');
    }
    
    // Trigger a small DOM change to make Clerk re-evaluate appearance
    const clerkContainer = document.querySelector('.clerk-container') as HTMLElement;
    if (clerkContainer) {
      clerkContainer.style.opacity = '0.99';
      setTimeout(() => {
        clerkContainer.style.opacity = '1';
      }, 10);
    }
  }
}, { immediate: true });
</script>

<template>
  <div :class="{ 'dark-theme': isDark }" class="login-page">
    <!-- Theme Toggle - Top Right Corner -->
    <div class="theme-toggle-container">
      <ThemeToggle :show-label="true" size="small" />
    </div>
    
    <div class="login-container">
      <!-- Left Side - Banner -->
      <div class="banner-column">
        <div class="banner-box">
          <div class="banner-overlay">
            <div class="banner-content">
              <h2 class="banner-title">
                Execute. Organize. <span class="accent-text">Collaborate.</span>
              </h2>
              <h3 class="banner-subtitle">
                Built for remote teams, project managers, and doers everywhere. Manage tasks, track progress, and collaborate without boundaries.
              </h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side - Authentication Form -->
      <div class="form-column">
        <div class="form-container">
          <div class="logo-section">
            <Logo />
          </div>
          
          <h1 class="form-title">
            {{ isLoginMode ? 'Login to continue' : 'Create your account' }}
          </h1>
          
          <!-- Clerk Components - Dynamic Switching -->
          <div class="clerk-container">
            <!-- SignIn Component -->
            <SignIn 
              v-if="isLoginMode"
              :redirect-url="'/'"
              :sign-up-url="'#'"
              :routing="'hash'"
            />
            
            <!-- SignUp Component -->
            <SignUp 
              v-else
              :redirect-url="'/'"
              :sign-in-url="'#'"
              :routing="'hash'"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: var(--v-theme-surface);
  position: relative;
  /* Allow scrolling on mobile */
}

.theme-toggle-container {
  position: fixed;
  top: 28px;
  right: 56px;
  z-index: 1000;
}

.login-container {
  display: grid;
  grid-template-columns: 1.2fr 1.5fr;
  min-height: 100vh;
  width: 100%;
  position: relative;
}

// Left Side - Banner
.banner-column {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
}

.banner-box {
  width: 90%;
  height: 90%;
  background-image: url('/images/banner3.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 20px;
  position: relative;
  margin-left: 100px;
}

.banner-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-content {
  width: 66.67%;
  margin: 0 auto;
  text-align: left;
}

.banner-title {
  color: white;
  font-size: 2rem;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 2.5rem;
  
  @media (min-width: 768px) {
    font-size: 6rem;
  }
}

.accent-text {
  color: var(--v-primary-base, #39B84C);
}

.banner-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  line-height: 1.5;
  
  @media (min-width: 768px) {
    font-size: 1.125rem;
  }
}

// Right Side - Form
.form-column {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 50px;
  width: 90%;
  margin: 0 auto;
}

.form-container {
  width: 60%;
  margin: 0 auto;
}

.logo-section {
  margin: 2.5rem 0;
  text-align: center;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
  color: var(--v-theme-on-surface);
}

.clerk-container {
  margin-top: 2rem;
}

// Dark theme adjustments - only for our custom elements, not Clerk components
.dark-theme {
  background: #101828 !important;
  
  // CSS custom properties that Clerk can detect
  --clerk-appearance-mode: dark;
  --clerk-primary-color: #2D8A3A;
  --clerk-background-color: #1F1F23;
  
  .banner-overlay {
    background: rgba(0, 0, 0, 0.7);
  }
  
  .form-title {
    color: var(--v-theme-on-surface);
  }
}

// Ensure the page background covers the entire viewport
.login-page.dark-theme {
  background: #101828 !important;
}

// Force the background color with higher specificity
body .login-page.dark-theme {
  background: #101828 !important;
}

// Global dark theme background for the entire page
html.dark-theme,
body.dark-theme {
  background: #101828 !important;
}

// Ensure the login page container also has the dark background
.login-page.dark-theme .login-container {
  background: #101828 !important;
}

// Light theme properties
:not(.dark-theme) {
  --clerk-appearance-mode: light;
  --clerk-primary-color: #39B84C;
  --clerk-background-color: #FFFFFF;
}

// Responsive design
@media (max-width: 1024px) {
  .login-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    min-height: auto;
    height: auto;
  }
  
  .banner-column {
    padding: 20px;
    height: 300px;
    min-height: 300px;
  }
  
  .banner-box {
    margin-left: 0;
    width: 100%;
    height: 100%;
  }
  
  .banner-content {
    width: 80%;
  }
  
  .banner-title {
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
  }
  
  .form-column {
    padding: 20px;
    width: 100%;
    min-height: auto;
    height: auto;
  }
  
  .form-container {
    width: 100%;
    max-width: 400px;
  }
}

@media (max-width: 768px) {
  .theme-toggle-container {
    top: 20px;
    right: 20px;
  }
  
  .banner-column {
    height: 250px;
    min-height: 250px;
    padding: 15px;
  }
  
  .banner-title {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  
  .banner-subtitle {
    font-size: 0.875rem;
  }
  
  .form-column {
    padding: 15px;
    min-height: auto;
    height: auto;
  }
  
  .form-container {
    max-width: 100%;
  }
  
  .logo-section {
    margin: 1.5rem 0;
  }
  
  .form-title {
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }
  
  .clerk-container {
    margin-top: 1.5rem;
  }
}

@media (max-width: 480px) {
  .banner-column {
    height: 200px;
    min-height: 200px;
    padding: 10px;
  }
  
  .banner-title {
    font-size: 1.5rem;
  }
  
  .banner-subtitle {
    font-size: 0.75rem;
  }
  
  .form-column {
    padding: 10px;
    min-height: auto;
    height: auto;
  }
  
  .form-container {
    padding: 0 10px;
  }
}
</style>
