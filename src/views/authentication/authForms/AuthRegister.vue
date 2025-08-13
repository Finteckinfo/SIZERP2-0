<script setup lang="ts">
import { ref } from "vue";
import Google from '@/assets/images/auth/social-google.svg';
import { useSignUp, useClerk } from "@clerk/vue";

const checkbox = ref(false);
const show1 = ref(false);
const password = ref('');
const email = ref('');
const firstname = ref('');
const lastname = ref('');
const loading = ref(false);
const errorMsg = ref('');

const passwordRules = ref([
  (v: string) => !!v || 'Password is required',
  (v: string) => (v && v.length <= 10) || 'Password must be less than 10 characters'
]);

const emailRules = ref([
  (v: string) => !!v || 'E-mail is required',
  (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid'
]);

const { signUp, isLoaded } = useSignUp();
const clerkRef = useClerk();

async function handleRegister() {
  if (!isLoaded.value || !signUp.value) {
    errorMsg.value = "Sign-up service not ready.";
    return;
  }

  try {
    loading.value = true;
    const result = await signUp.value.create({
      emailAddress: email.value,
      password: password.value,
      firstName: firstname.value,
      lastName: lastname.value,
    });

    if (result.status === "complete") {
      const setActive = clerkRef.value?.setActive;
      if (setActive) {
        await setActive({ session: result.createdSessionId! });
      }
      window.location.href = "/";
    }
  } catch (err: any) {
    errorMsg.value = err.errors?.[0]?.message || "Registration failed.";
  } finally {
    loading.value = false;
  }
}

async function handleGoogleRegister() {
  if (!isLoaded.value || !signUp.value) return;

  await signUp.value.authenticateWithRedirect({
    strategy: "oauth_google",
    redirectUrl: "/sso-callback",
    redirectUrlComplete: "/",
  });
}
</script>

<template>
  <v-btn block color="primary" variant="outlined" class="text-lightText googleBtn" @click="handleGoogleRegister">
    <img :src="Google" alt="google" />
    <span class="ml-2">Sign up with Google</span>
  </v-btn>

  <v-row>
    <v-col class="d-flex align-center">
      <v-divider class="custom-devider" />
      <v-btn variant="outlined" class="orbtn" rounded="md" size="small">OR</v-btn>
      <v-divider class="custom-devider" />
    </v-col>
  </v-row>

  <h5 class="text-h5 text-center my-4 mb-8">Sign up with Email address</h5>

  <v-form lazy-validation class="mt-7 loginForm">
    <v-row>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="firstname"
          density="comfortable"
          hide-details="auto"
          variant="outlined"
          color="primary"
          label="Firstname"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="lastname"
          density="comfortable"
          hide-details="auto"
          variant="outlined"
          color="primary"
          label="Lastname"
        />
      </v-col>
    </v-row>

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
      :append-icon="show1 ? '$eye' : '$eyeOff'"
      :type="show1 ? 'text' : 'password'"
      @click:append="show1 = !show1"
      class="pwdInput"
    />

    <div class="d-sm-inline-flex align-center mt-2 mb-7 mb-sm-0 font-weight-bold">
      <v-checkbox
        v-model="checkbox"
        :rules="[(v: any) => !!v || 'You must agree to continue!']"
        label="Agree with?"
        required
        color="primary"
        class="ms-n2"
        hide-details
      />
      <a href="#" class="ml-1 text-lightText">Terms and Condition</a>
    </div>

    <v-btn
      color="secondary"
      block
      class="mt-2"
      variant="flat"
      size="large"
      @click="handleRegister"
      :disabled="loading"
    >
      {{ loading ? "Creating account..." : "Sign Up" }}
    </v-btn>

    <p v-if="errorMsg" class="mt-4 text-red-500">{{ errorMsg }}</p>
  </v-form>

  <div class="mt-5 text-right">
    <v-divider />
    <v-btn variant="plain" to="/login" class="mt-2 text-capitalize mr-n2">Already have an account?</v-btn>
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
.outlinedInput .v-field {
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: none;
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
