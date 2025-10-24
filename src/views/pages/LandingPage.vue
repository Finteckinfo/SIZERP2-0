<template>
  <div :class="{ 'dark-theme': isDark }" class="landing-page" :style="backgroundStyle">
    <!-- Theme Toggle - Top Right Corner -->
    <div class="theme-toggle-container">
      <ThemeToggle :show-label="true" size="small" />
    </div>

    <!-- Particles Background -->
    <Particles 
      :quantity="150"
      :staticity="50"
      :ease="50"
      :size="0.4"
      class="particles-background"
    />

    <!-- World Globe Background -->
    <World 
      class="world-background"
    />

    <!-- Main Content -->
    <div class="landing-content">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-container">
          <div class="hero-text">
            <h1 class="hero-title">
              Welcome to 
              <span class="brand-text">SizLand ERP</span>
            </h1>
            <p class="hero-subtitle">
              Professional Web3 ERP system for remote teams with secure SIZ coin escrow payments, 
              blockchain-based project management, and guaranteed on-time payments.
            </p>
            <div class="hero-buttons">
              <v-btn
                color="primary"
                size="large"
                variant="elevated"
                class="cta-button"
                @click="goToLogin"
              >
                <v-icon class="mr-2">mdi-login</v-icon>
                Get Started
              </v-btn>
              <v-btn
                color="secondary"
                size="large"
                variant="outlined"
                class="cta-button"
                @click="scrollToFeatures"
              >
                <v-icon class="mr-2">mdi-information</v-icon>
                Learn More
              </v-btn>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section ref="featuresSection" class="features-section">
        <div class="features-container">
          <h2 class="section-title">Why Choose SizLand ERP?</h2>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">
                <v-icon size="48" color="primary">mdi-shield-check</v-icon>
              </div>
              <h3 class="feature-title">Secure Escrow Payments</h3>
              <p class="feature-description">
                Your funds are protected with blockchain-based escrow system using SIZ coin. 
                Payments are only released when work is completed and approved.
              </p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">
                <v-icon size="48" color="primary">mdi-web</v-icon>
              </div>
              <h3 class="feature-title">Web3 Technology</h3>
              <p class="feature-description">
                Built on Algorand blockchain for transparency, security, and global accessibility. 
                No traditional banking barriers.
              </p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">
                <v-icon size="48" color="primary">mdi-account-group</v-icon>
              </div>
              <h3 class="feature-title">Remote Team Focus</h3>
              <p class="feature-description">
                Designed specifically for remote teams who need affirmation and security 
                in their work relationships and payments.
              </p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">
                <v-icon size="48" color="primary">mdi-clock-check</v-icon>
              </div>
              <h3 class="feature-title">Guaranteed Payments</h3>
              <p class="feature-description">
                On-time payments guaranteed through smart contracts. 
                No more chasing payments or dealing with payment delays.
              </p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">
                <v-icon size="48" color="primary">mdi-chart-line</v-icon>
              </div>
              <h3 class="feature-title">Project Management</h3>
              <p class="feature-description">
                Complete project tracking with Kanban boards, task management, 
                and real-time collaboration tools.
              </p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">
                <v-icon size="48" color="primary">mdi-currency-usd-circle</v-icon>
              </div>
              <h3 class="feature-title">SIZ Coin Integration</h3>
              <p class="feature-description">
                Native SIZ coin support for all transactions. 
                Low fees, fast settlements, and global accessibility.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section">
        <div class="cta-container">
          <h2 class="cta-title">Ready to Transform Your Remote Work?</h2>
          <p class="cta-subtitle">
            Join the future of secure, transparent, and efficient project management
          </p>
          <v-btn
            color="primary"
            size="x-large"
            variant="elevated"
            class="cta-button-large"
            @click="goToLogin"
          >
            <v-icon class="mr-2">mdi-rocket-launch</v-icon>
            Start Your Journey
          </v-btn>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import ThemeToggle from '@/components/shared/ThemeToggle.vue'
import Particles from '@/components/ui/Particles.vue'
import World from '@/components/ui/World.vue'

const router = useRouter()
const { isDark } = useTheme()
const featuresSection = ref<HTMLElement | null>(null)

// Computed background style that reacts to theme changes
const backgroundStyle = computed(() => {
  if (isDark.value) {
    return {
      background: 'linear-gradient(135deg, #02124C 0%, #001A6B 50%, #002680 100%)'
    }
  } else {
    return {
      background: 'linear-gradient(135deg, #39B84C 0%, #2d8a3a 50%, #1e5d2a 100%)'
    }
  }
})

const goToLogin = () => {
  router.push('/login')
}

const scrollToFeatures = () => {
  if (featuresSection.value) {
    featuresSection.value.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    })
  }
}
</script>

<style lang="scss" scoped>
.landing-page {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  color: white;
}

.theme-toggle-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.particles-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.world-background {
  position: fixed;
  bottom: -100px;
  right: -100px;
  z-index: 2;
  opacity: 0.8;
}

.landing-content {
  position: relative;
  z-index: 10;
  min-height: 100vh;
}

.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.hero-container {
  max-width: 1200px;
  width: 100%;
  text-align: center;
}

.hero-title {
  font-size: 4rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.brand-text {
  background: linear-gradient(45deg, #ffffff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: none;
}

.dark-theme .brand-text {
  background: linear-gradient(45deg, var(--theme-primary-color), color-mix(in srgb, var(--theme-primary-color) 80%, black));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.5rem;
  margin-bottom: 3rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  opacity: 0.9;
  line-height: 1.6;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-button {
  padding: 1rem 2rem !important;
  font-size: 1.1rem !important;
  font-weight: 600 !important;
  border-radius: 12px !important;
  text-transform: none !important;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2) !important;
  transition: all 0.3s ease !important;
}

.cta-button:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3) !important;
}

.features-section {
  padding: 6rem 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.dark-theme .features-section {
  background: rgba(0, 0, 0, 0.2);
}

.features-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 3rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 4rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.dark-theme .feature-card {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  background: rgba(255, 255, 255, 0.15);
}

.dark-theme .feature-card:hover {
  background: rgba(0, 0, 0, 0.3);
}

.feature-icon {
  margin-bottom: 1.5rem;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: white;
}

.feature-description {
  font-size: 1.1rem;
  line-height: 1.6;
  opacity: 0.9;
}

.cta-section {
  padding: 6rem 2rem;
  text-align: center;
}

.cta-container {
  max-width: 800px;
  margin: 0 auto;
}

.cta-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.cta-subtitle {
  font-size: 1.3rem;
  margin-bottom: 3rem;
  opacity: 0.9;
  line-height: 1.6;
}

.cta-button-large {
  padding: 1.5rem 3rem !important;
  font-size: 1.3rem !important;
  font-weight: 700 !important;
  border-radius: 16px !important;
  text-transform: none !important;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3) !important;
  transition: all 0.3s ease !important;
}

.cta-button-large:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4) !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .cta-title {
    font-size: 2rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .world-background {
    bottom: -300px;
    right: -300px;
    opacity: 0.2;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .feature-card {
    padding: 1.5rem;
  }
  
  .cta-button-large {
    padding: 1.2rem 2rem !important;
    font-size: 1.1rem !important;
  }
}
</style>
