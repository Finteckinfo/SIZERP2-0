<script setup lang="ts">
import Logo from '@/layouts/full/logo/LogoDark.vue';
import { SignUp } from '@clerk/vue';
import { useTheme } from '@/composables/useTheme';
import ThemeToggle from '@/components/shared/ThemeToggle.vue';

const { isDark } = useTheme();
</script>

<template>
  <div :class="{ 'dark-theme': isDark }">
    <!-- Theme Toggle -->
    <div class="theme-toggle-container">
      <ThemeToggle :show-label="false" size="small" />
    </div>
    
    <v-row class="h-screen" no-gutters>
      <!---Left Part-->
      <v-col cols="12" class="d-flex align-center bg-lightprimary">
        <v-container>
          <div class="pa-7 pa-sm-12">
            <v-row justify="center">
              <v-col cols="12" lg="10" xl="6" md="7">
                <v-card elevation="0" class="loginBox">
                  <v-card variant="outlined">
                    <v-card-text class="pa-9">
                      <!---Left Part Logo -->
                      <v-row>
                        <v-col cols="12" class="text-center">
                          <Logo />
                          <h2 class="text-secondary text-h2 mt-8">Sign up</h2>
                          <h4 class="text-disabled text-h4 mt-3">Create your account to continue</h4>
                        </v-col>
                      </v-row>
                      <!---Left Part Logo -->

                      <!---Clerk SignUp Component-->
                      <div class="mt-8">
                        <SignUp 
                          :appearance="{
                            elements: {
                              formButtonPrimary: 'clerk-btn-primary',
                              formFieldInput: 'clerk-input-field',
                              card: 'clerk-card',
                              headerTitle: 'clerk-header-title',
                              headerSubtitle: 'clerk-header-subtitle',
                              dividerLine: 'clerk-divider',
                              dividerText: 'clerk-divider-text',
                              socialButtonsBlockButton: 'clerk-social-btn',
                              formFieldLabel: 'clerk-label',
                              formFieldInputShowPasswordButton: 'clerk-password-toggle',
                              footerActionLink: 'clerk-footer-link'
                            }
                          }"
                          :redirect-url="'/'"
                          :sign-in-url="'/login'"
                        />
                      </div>
                      <!---Clerk SignUp Component-->
                    </v-card-text>
                  </v-card>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </v-container>
      </v-col>
      <!---Left Part-->
    </v-row>
  </div>
</template>

<style lang="scss">
.loginBox {
  max-width: 475px;
  margin: 0 auto;
}

.theme-toggle-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

// Custom styling for Clerk components to match Vuetify
:deep(.cl-signUp-root) {
  .clerk-btn-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 12px 24px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    text-transform: none;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    background-color: var(--v-primary-base, #39B84C);
    color: white;
    width: 100%;
    margin-top: 1rem;
    
    &:hover {
      background-color: var(--v-primary-darken1, #2d8a3a);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(57, 184, 76, 0.3);
    }
  }
  
  .clerk-input-field {
    margin-bottom: 1rem;
    
    input {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 4px;
      font-size: 16px;
      background-color: white;
      transition: border-color 0.3s ease;
      
      &:focus {
        border-color: var(--v-primary-base, #39B84C);
        outline: none;
        box-shadow: 0 0 0 2px rgba(57, 184, 76, 0.1);
      }
    }
  }
  
  .clerk-social-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 12px 24px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    text-transform: none;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid rgba(0, 0, 0, 0.08);
    background-color: white;
    color: rgba(0, 0, 0, 0.87);
    width: 100%;
    margin-bottom: 0.75rem;
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
      border-color: rgba(0, 0, 0, 0.12);
    }
  }
  
  .clerk-divider {
    border: none;
    height: 1px;
    background-color: rgba(0, 0, 0, 0.08);
    margin: 20px 0;
  }
  
  .clerk-divider-text {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 2px 40px;
    margin: 20px 15px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 20px;
    background: white;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.6);
    font-weight: 500;
  }
  
  .clerk-footer-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    text-transform: none;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    background: transparent;
    color: var(--v-primary-base, #39B84C);
    margin-top: 1rem;
    
    &:hover {
      background-color: rgba(57, 184, 76, 0.1);
      text-decoration: underline;
    }
  }
  
  .clerk-header-title {
    font-size: 1.25rem;
    font-weight: 500;
    text-align: center;
    margin-bottom: 1rem;
    color: var(--v-secondary-base, #02124C);
  }
  
  .clerk-header-subtitle {
    font-size: 0.875rem;
    text-align: center;
    margin-bottom: 1.5rem;
    color: var(--v-disabled-base, rgba(0, 0, 0, 0.38));
  }
  
  .clerk-label {
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: rgba(0, 0, 0, 0.87);
    display: block;
  }
  
  .clerk-password-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: auto;
    padding: 4px;
    border: none;
    background: transparent;
    cursor: pointer;
    color: rgba(0, 0, 0, 0.6);
    
    &:hover {
      color: rgba(0, 0, 0, 0.87);
    }
  }
}
</style>
