<template>
  <LandingBackground>
    <!-- Main Content -->
    <div class="landing-content">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-container">
          <div class="hero-text">
            <div class="hero-logo">
              <img src="/images/sizlogo.png" alt="SIZ Logo" class="hero-logo-image" />
            </div>
            <h1 class="hero-title">
              <span class="ecosystem-heading">Welcome to</span>
              <span class="brand-text"><span class="ecosystem-heading">SizLand ERP</span></span>
            </h1>
            <p class="hero-subtitle">
              Professional Web3 ERP system for remote teams with secure SIZ coin escrow payments, 
              blockchain-based project management, and guaranteed on-time payments.
            </p>
            <div class="hero-buttons">
              <!-- For Project Owners -->
              <ZigZagButton class="hero-zigzag-button" variant="C" @click="goToCreateProject">
                <v-icon class="mr-2">mdi-briefcase-plus</v-icon>
                Create a Project
              </ZigZagButton>
              <!-- For Team Members -->
              <ZigZagButton class="hero-zigzag-button" variant="B" @click="goToJoinProject">
                <v-icon class="mr-2">mdi-account-multiple-plus</v-icon>
                Join a Project
              </ZigZagButton>
              <!-- Learn More -->
              <ZigZagButton class="hero-zigzag-button" variant="A" @click="scrollToFeatures">
                <v-icon class="mr-2">mdi-information</v-icon>
                Learn More
              </ZigZagButton>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section id="features" ref="featuresSection" class="features-section">
        <div class="features-container">
          <h2 class="section-title">
            <span class="ecosystem-heading">Why Choose SizLand ERP?</span>
          </h2>
          <FeatureBentoGrid />
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
            @click="goToCreateProject"
          >
            <v-icon class="mr-2">mdi-rocket-launch</v-icon>
            Start Your Journey
          </v-btn>
        </div>
      </section>

      <!-- Footer Section -->
      <footer class="landing-footer">
        <div class="footer-container">
          <div class="footer-content">
            <!-- Logo and Brand -->
            <div class="footer-brand">
              <img src="/images/sizlogo.png" alt="SIZ Logo" class="footer-logo" />
              <h3 class="footer-brand-name">SizLand ERP</h3>
              <p class="footer-tagline">Professional Web3 Project Management</p>
            </div>

            <!-- Quick Links -->
            <div class="footer-links">
              <h4 class="footer-links-title">Quick Links</h4>
              <ul class="footer-links-list">
                <li><a href="#features" @click="scrollToFeatures">Features</a></li>
                <li><a href="/login">Login</a></li>
                <li><a href="/register">Register</a></li>
                <li><a href="#!" @click.prevent>Documentation</a></li>
              </ul>
            </div>

            <!-- Contact Info -->
            <div class="footer-contact">
              <h4 class="footer-links-title">Contact</h4>
              <ul class="footer-links-list">
                <li><a href="#!" @click.prevent>Support</a></li>
                <li><a href="#!" @click.prevent>About Us</a></li>
                <li><a href="#!" @click.prevent>Privacy Policy</a></li>
                <li><a href="#!" @click.prevent>Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <!-- Made By Section -->
          <div class="footer-bottom">
            <div class="footer-divider"></div>
            <div class="footer-made-by">
              <p class="made-by-text">
                Made with <span class="heart">♥</span> by 
                <span class="built-by">BuiltBySisi</span>
              </p>
              <p class="footer-copyright">
                © {{ new Date().getFullYear() }} SizLand ERP. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </LandingBackground>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useNextAuth } from '@/composables/useNextAuth'
import LandingBackground from '@/components/ui/LandingBackground.vue'
import ZigZagButton from '@/components/ui/ZigZagButton.vue'
import FeatureBentoGrid from '@/views/pages/landing/components/FeatureBentoGrid.vue'

const router = useRouter()
const featuresSection = ref<HTMLElement | null>(null)
const { user, isLoaded } = useNextAuth()

const goToCreateProject = () => {
  // Wait for auth state to load before checking
  if (!isLoaded.value) {
    console.log('[Landing] Auth still loading, waiting...')
    // Wait a moment for auth to load
    setTimeout(() => goToCreateProject(), 100)
    return
  }
  
  // Check if user is authenticated via SSO
  const isAuthenticated = !!user.value?.id
  
  console.log('[Landing] Auth loaded, user authenticated:', isAuthenticated)
  
  if (isAuthenticated) {
    router.push('/projects/create')
  } else {
    // Store intent to create project after authentication
    sessionStorage.setItem('post_auth_redirect', '/projects/create')
    // Redirect to SSO login
    window.location.href = 'https://www.siz.land/login'
  }
}

const goToJoinProject = () => {
  // Wait for auth state to load before checking
  if (!isLoaded.value) {
    console.log('[Landing] Auth still loading, waiting...')
    setTimeout(() => goToJoinProject(), 100)
    return
  }
  
  // Check if user is authenticated via SSO
  const isAuthenticated = !!user.value?.id
  
  console.log('[Landing] Auth loaded, user authenticated:', isAuthenticated)
  
  if (isAuthenticated) {
    router.push('/invitations')
  } else {
    // Store intent to join project after authentication
    sessionStorage.setItem('post_auth_redirect', '/invitations')
    // Redirect to SSO login
    window.location.href = 'https://www.siz.land/login'
  }
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

.hero-logo {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 2rem;
}

.hero-logo-image {
  width: 120px;
  height: 120px;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  animation: logoFloat 3s ease-in-out infinite;
}

@keyframes logoFloat {
  0%, 100% { 
    transform: translateY(0px); 
  }
  50% { 
    transform: translateY(-10px); 
  }
}

.hero-title {
  font-size: 4rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.brand-text {
  background: linear-gradient(45deg, #5BC85B, #4BB74B);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: none;
  font-weight: 700;
}

.ecosystem-heading {
  font-family: 'PIXymbols Very Loose W01 Reg', 'Poppins', sans-serif;
  display: inline-block;
  margin-right: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
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

.hero-buttons :deep(.zigzag-button) {
  margin: 0.25rem 0;
}

.hero-buttons :deep(.zigzag-button__text) {
  font-size: 1.1rem;
  font-weight: 600;
}

.hero-buttons :deep(.zigzag-button__text .v-icon) {
  font-size: 1.2rem;
}

.cta-button {
  padding: 1rem 2rem !important;
  font-size: 1.1rem !important;
  font-weight: 600 !important;
  border-radius: 12px !important;
  text-transform: none !important;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2) !important;
  transition: all 0.3s ease !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  text-align: center !important;
}

.cta-button :deep(.v-btn__content) {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  text-align: center !important;
  width: 100% !important;
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
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  text-align: center !important;
  margin: 0 auto !important;
}

.cta-button-large :deep(.v-btn__content) {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  text-align: center !important;
  width: 100% !important;
}

.cta-button-large:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4) !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-section {
    padding: 1rem;
    text-align: center;
  }
  
  .hero-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  
  .hero-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    width: 100%;
  }
  
  .hero-logo-image {
    width: 100px;
    height: 100px;
  }
  
  .hero-title {
    font-size: 2.5rem;
    text-align: center;
    margin-left: auto;
    margin-right: auto;
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
    text-align: center;
    margin-left: auto;
    margin-right: auto;
  }
  
  .section-title {
    font-size: 2rem;
    text-align: center;
  }
  
  .cta-title {
    font-size: 2rem;
    text-align: center;
  }
  
  .cta-subtitle {
    text-align: center;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    justify-items: center;
  }
  
  .feature-card {
    text-align: center;
    max-width: 100%;
    width: 100%;
  }
  
  .hero-buttons {
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }
  
  .cta-button {
    width: 100%;
    max-width: 280px;
    margin: 0 auto;
  }
  
  .cta-button-large {
    width: 100%;
    max-width: 280px;
    margin: 0 auto;
  }
  
  .world-background {
    bottom: -300px;
    right: -300px;
    opacity: 0.2;
  }
  
  /* Theme toggle already styled in main styles for mobile */
}

@media (max-width: 480px) {
  .hero-section {
    padding: 0.5rem;
  }
  
  .hero-container {
    padding: 0 1rem;
  }
  
  .hero-logo-image {
    width: 80px;
    height: 80px;
  }
  
  .hero-title {
    font-size: 2rem;
    text-align: center;
    margin-left: auto;
    margin-right: auto;
  }
  
  .hero-subtitle {
    font-size: 1rem;
    text-align: center;
    margin-left: auto;
    margin-right: auto;
  }
  
  .section-title {
    font-size: 1.8rem;
    text-align: center;
  }
  
  .cta-title {
    font-size: 1.8rem;
    text-align: center;
  }
  
  .feature-card {
    padding: 1.5rem;
    text-align: center;
    margin: 0 auto;
  }
  
  .hero-buttons {
    max-width: 250px;
    margin: 0 auto;
  }
  
  .cta-button {
    max-width: 250px;
    margin: 0 auto;
  }
  
  .cta-button-large {
    padding: 1.2rem 2rem !important;
    font-size: 1.1rem !important;
    max-width: 250px;
    margin: 0 auto;
  }
  
  .features-section {
    padding: 3rem 1rem;
  }
  
  .cta-section {
    padding: 3rem 1rem;
  }
  
  .theme-toggle-container {
    top: 10px;
    left: 50%;
    right: auto;
    transform: translateX(-50%);
  }
}

/* Footer Styles */
.landing-footer {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 4rem 2rem 2rem;
  margin-top: 4rem;
  position: relative;
  z-index: 10;
}

.dark-theme .landing-footer {
  background: rgba(0, 0, 0, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 3rem;
  margin-bottom: 3rem;
}

.footer-brand {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.footer-logo {
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin-bottom: 1rem;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.footer-brand-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(45deg, #5BC85B, #4BB74B);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark-theme .footer-brand-name {
  background: linear-gradient(45deg, #5BC85B, #4BB74B);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.footer-tagline {
  font-size: 0.9rem;
  opacity: 0.8;
  margin: 0;
}

.footer-links-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: white;
}

.footer-links-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links-list li {
  margin-bottom: 0.75rem;
}

.footer-links-list a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s ease;
  display: inline-block;
  font-size: 0.95rem;
}

.footer-links-list a:hover {
  color: #5BC85B;
  transform: translateX(5px);
}

.footer-bottom {
  text-align: center;
}

.footer-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  margin-bottom: 2rem;
}

.footer-made-by {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.made-by-text {
  font-size: 1.1rem;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
}

.heart {
  color: #ff6b9d;
  animation: heartbeat 1.5s ease-in-out infinite;
  display: inline-block;
}

@keyframes heartbeat {
  0%, 100% {
    transform: scale(1);
  }
  10%, 30% {
    transform: scale(1.2);
  }
  20% {
    transform: scale(1.1);
  }
}

.built-by {
  font-weight: 700;
  background: linear-gradient(45deg, #5BC85B, #4BB74B);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 1.2rem;
  display: inline-block;
  margin-left: 0.25rem;
}

.footer-copyright {
  font-size: 0.85rem;
  opacity: 0.7;
  margin: 0;
}

/* Footer Responsive */
@media (max-width: 768px) {
  .landing-footer {
    padding: 3rem 1.5rem 1.5rem;
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }

  .footer-brand {
    align-items: center;
  }

  .footer-logo {
    width: 60px;
    height: 60px;
  }

  .footer-links-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
  }

  .footer-links-list li {
    margin-bottom: 0;
  }

  .made-by-text {
    font-size: 1rem;
  }

  .built-by {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .landing-footer {
    padding: 2rem 1rem 1rem;
  }

  .footer-logo {
    width: 50px;
    height: 50px;
  }

  .made-by-text {
    font-size: 0.9rem;
  }

  .built-by {
    font-size: 1rem;
  }
}
</style>
