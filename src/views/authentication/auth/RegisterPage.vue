<script setup lang="ts">
import { SignUp } from '@clerk/vue';
import Logo from '@/assets/images/logos/Logo.vue';
</script>

<template>
  <div class="auth-form-wrapper">
    <div class="logo-section">
      <Logo />
    </div>
    <SignUp 
      :redirect-url="'/'"
      :sign-in-url="'/login'"
      :routing="'path'"
      path="/register"
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
