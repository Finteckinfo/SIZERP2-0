<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useClerk } from "@clerk/vue";

const clerk = useClerk();
const loading = ref(true);
const errorMsg = ref("");

onMounted(async () => {
  try {
    // Clerk expects at least an empty object for params
    await clerk.value?.handleRedirectCallback({});
    window.location.href = "/";
  } catch (err: any) {
    console.error("Redirect callback error:", err);
    errorMsg.value = err.errors?.[0]?.message || "Authentication failed. Please try again.";
    loading.value = false;
  }
});
</script>

<template>
  <div class="callback-container">
    <template v-if="loading">
      <v-row justify="center" align="center" class="fill-height">
        <v-col cols="auto" class="text-center">
          <v-progress-circular indeterminate color="primary" size="64" />
          <p class="mt-4 text-h6">Completing authentication...</p>
        </v-col>
      </v-row>
    </template>

    <template v-else>
      <v-row justify="center" align="center" class="fill-height">
        <v-col cols="auto" class="text-center">
          <v-icon color="error" size="48">mdi-alert-circle</v-icon>
          <p class="mt-4 text-h6 red--text">{{ errorMsg }}</p>
          <v-btn color="primary" class="mt-4" to="/login" variant="flat">Try Again</v-btn>
        </v-col>
      </v-row>
    </template>
  </div>
</template>

<style scoped>
.callback-container {
  height: 100vh;
}
</style>
