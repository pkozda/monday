<template>
  <div id="app">
    <div class="app-bg" aria-hidden="true" :style="bgStyle" />

    <nav class="app-nav">
      <div class="nav-container">
        <router-link to="/" class="nav-logo-link">
          <img :src="logoSrc" alt="Monday" class="nav-logo-img" />
        </router-link>
        <div class="nav-end">
          <div class="nav-links">
            <router-link to="/" class="nav-link">Dashboard</router-link>
            <router-link to="/hypotheses" class="nav-link">Hypotheses</router-link>
            <router-link to="/appointments" class="nav-link">Appointments</router-link>
            <router-link to="/journal" class="nav-link">Journal</router-link>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </nav>
    <main class="app-main" :class="{ 'app-main--fill': fillViewport }">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { useTheme } from '@/composables/useTheme'
import logoLight from '@assets/logo.png'
import logoDark from '@assets/logo-dark.png'
import backgroundUrl from '@assets/background.png'

const route = useRoute()
const { theme } = useTheme()

const fillViewport = computed(() => route.meta.fillViewport === true)

const logoSrc = computed(() => (theme.value === 'dark' ? logoDark : logoLight))

const bgStyle = computed(() => ({
  '--app-bg-image': `url(${backgroundUrl})`,
}))
</script>

<style>
@import '@/styles/themes.css';
@import '@/styles/page-layout.css';

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: var(--bg-page);
  color: var(--text-primary);
  line-height: 1.5;
  transition: color 0.2s;
  min-height: 100vh;
}

#app {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Appointments: lock page scroll so only column panels scroll */
html:has(.app-main--fill),
body:has(.app-main--fill) {
  overflow: hidden;
  height: 100%;
}

#app:has(.app-main--fill) {
  height: 100dvh;
  max-height: 100dvh;
  overflow: hidden;
}

.app-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image: linear-gradient(var(--bg-overlay), var(--bg-overlay)),
    var(--app-bg-image);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: background-image 0.3s ease;
}

.app-main {
  position: relative;
  z-index: 1;
  flex: 1;
}

.app-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg-nav);
  border-bottom: 1px solid var(--border);
  padding: 1rem 0;
  transition: background-color 0.2s, border-color 0.2s, box-shadow 0.2s;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 1px 0 var(--border);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.nav-logo-link {
  display: block;
  flex-shrink: 0;
  text-decoration: none;
  /* Same aspect ratio as logo assets (1024×375) */
  height: 52px;
  width: 142px;
}

[data-theme='dark'] .nav-logo-link {
  background: var(--bg-nav);
  border-radius: 6px;
}

.nav-logo-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: left center;
}

.nav-end {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.nav-link {
  text-decoration: none;
  color: var(--text-muted);
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover {
  color: var(--text-primary);
}

.nav-link.router-link-active {
  color: var(--accent-strong);
  background: color-mix(in srgb, var(--accent-strong) 14%, transparent);
  padding: 0.35rem 0.65rem;
  margin: -0.35rem -0.65rem;
  border-radius: 6px;
}

.app-main {
  padding: 2rem 0;
}

.app-main--fill {
  padding: 0.75rem 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1 1 0;
  min-height: 0;
}

.app-main--fill > :deep(*) {
  flex: 1 1 0;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

@media (max-width: 960px) {
  html:has(.app-main--fill),
  body:has(.app-main--fill) {
    overflow: auto;
    height: auto;
  }

  #app:has(.app-main--fill) {
    height: auto;
    max-height: none;
    overflow: visible;
  }

  .app-main--fill {
    overflow: visible;
    padding: 2rem 0;
    flex: 1 1 auto;
  }

  .app-main--fill > :deep(*) {
    flex: none;
    min-height: auto;
    overflow: visible;
    display: block;
  }
}

@media (max-width: 640px) {
  .nav-container {
    flex-direction: column;
    align-items: flex-start;
  }

  .nav-end {
    width: 100%;
    justify-content: space-between;
  }

  .nav-logo-link {
    height: 44px;
    width: 120px;
  }
}
</style>
