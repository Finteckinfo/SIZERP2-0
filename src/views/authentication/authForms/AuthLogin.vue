<script setup lang="ts">
import { ref } from "vue";
import Google from '@/assets/images/auth/social-google.svg';
import { useSignIn, useClerk } from "@clerk/vue";

const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMsg = ref('');
const showPassword = ref(false);

const emailRules = ref([
  (v: string) => !!v || 'E-mail is required',
  (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid'
]);

const passwordRules = ref([
  (v: string) => !!v || 'Password is required'
]);

const { signIn, isLoaded } = useSignIn();
const clerkRef = useClerk();

async function handleLogin() {
  if (!isLoaded.value || !signIn.value) {
    errorMsg.value = "Sign-in service not ready.";
    return;
  }

  try {
    loading.value = true;
    const result = await signIn.value.create({
      identifier: email.value,
      password: password.value,
    });

    if (result.status === "complete") {
      const setActive = clerkRef.value?.setActive;
      if (setActive) {
        await setActive({ session: result.createdSessionId! });
      }
      window.location.href = "/";
    }
  } catch (err: any) {
    errorMsg.value = err.errors?.[0]?.message || "Login failed.";
  } finally {
    loading.value = false;
  }
}

async function handleGoogleLogin() {
  if (!isLoaded.value || !signIn.value) return;

  await signIn.value.authenticateWithRedirect({
    strategy: "oauth_google",
    redirectUrl: "/sso-callback",
    redirectUrlComplete: "/",
  });
}
</script>

<template>
  <v-btn block color="primary" variant="outlined" class="text-lightText googleBtn" @click="handleGoogleLogin">
    <img :src="Google" alt="google" />
    <span class="ml-2">Sign in with Google</span>
  </v-btn>

  <v-row>
    <v-col class="d-flex align-center">
      <v-divider class="custom-devider" />
      <v-btn variant="outlined" class="orbtn" rounded="md" size="small">OR</v-btn>
      <v-divider class="custom-devider" />
    </v-col>
  </v-row>

  <h5 class="text-h5 text-center my-4 mb-8">Sign in with Email address</h5>

  <v-form lazy-validation class="mt-7 loginForm">
    <v-text-field
      v-model="email"
      :rules="emailRules"
      label="Email Address / Username"
      class="mt-4 mb-4"
      required
      density="comfortable"
      hide-details="auto"
      variant="outlined"
      color="primary"
    />

    <v-text-field
      v-model="password"
      :rules="passwordRules"
      label="Password"
      required
      density="comfortable"
      variant="outlined"
      color="primary"
      hide-details="auto"
      :append-icon="showPassword ? '$eye' : '$eyeOff'"
      :type="showPassword ? 'text' : 'password'"
      @click:append="showPassword = !showPassword"
      class="pwdInput"
    />

    <v-btn
      color="secondary"
      block
      class="mt-4"
      variant="flat"
      size="large"
      @click="handleLogin"
      :disabled="loading"
    >
      {{ loading ? "Logging in..." : "Login" }}
    </v-btn>

    <p v-if="errorMsg" class="mt-4 text-red-500">{{ errorMsg }}</p>
  </v-form>

  <div class="mt-5 text-right">
    <v-divider />
    <v-btn variant="plain" to="/register" class="mt-2 text-capitalize mr-n2">Don't have an account?</v-btn>
  </div>
</template>

<style lang="scss">
.custom-devider {
  border-color: rgba(0, 0, 0, 0.08) !important;
}
.googleBtn {
  border-color: rgba(0, 0, 0, 0.08);
  margin: 30px 0 20px 0;
}
.orbtn {
  padding: 2px 40px;
  border-color: rgba(0, 0, 0, 0.08);
  margin: 20px 15px;
}
.pwdInput {
  position: relative;
  .v-input__append {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
