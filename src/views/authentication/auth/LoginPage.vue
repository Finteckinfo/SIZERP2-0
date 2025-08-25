<script setup lang="ts">
import { SignIn } from '@clerk/vue';
import { useClerkTheme } from '@/composables/useClerkTheme';
import Logo from '@/assets/images/logos/Logo.vue';

const { clerkAppearance } = useClerkTheme();
</script>

<template>
  <div class="auth-form-wrapper">
    <div class="logo-section">
      <Logo />
    </div>
    <SignIn 
      :redirect-url="'/'"
      :sign-up-url="'/register'"
      :routing="'path'"
      path="/login"
      :appearance="clerkAppearance"
    />
  </div>
</template>

<style scoped>
.auth-form-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 2rem;
  padding: 2rem;
}

.logo-section {
  margin-bottom: 1rem;
  text-align: left;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
</style>
