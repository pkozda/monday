<template>
  <div id="app">
    <div class="app-bg" aria-hidden="true" :style="bgStyle" />

    <nav class="app-nav">
      <div class="nav-container">
        <router-link to="/" class="nav-logo-link">
          <img :src="logoUrl" alt="Monday" class="nav-logo-img" />
        </router-link>
        <div class="nav-end">
          <div class="nav-links">
            <router-link to="/" class="nav-link">Dashboard</router-link>
            <router-link to="/timeline" class="nav-link">Timeline</router-link>
            <router-link to="/hypotheses" class="nav-link">Hypotheses</router-link>
            <router-link to="/journal" class="nav-link">Journal</router-link>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </nav>
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import logoUrl from '@assets/logo.png'
import backgroundUrl from '@assets/background.png'

const bgStyle = computed(() => ({
  '--app-bg-image': `url(${backgroundUrl})`,
}))
</script>

<style>
@import '@/styles/themes.css';

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

.app-nav,
.app-main {
  position: relative;
  z-index: 1;
}

.app-nav {
  background: var(--bg-nav);
  border-bottom: 1px solid var(--border);
  padding: 1rem 0;
  transition: background-color 0.2s, border-color 0.2s;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
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
  display: flex;
  align-items: center;
  text-decoration: none;
  flex-shrink: 0;
}

.nav-logo-img {
  height: 52px;
  width: auto;
  max-width: 220px;
  object-fit: contain;
  display: block;
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
  color: var(--accent);
}

.app-main {
  flex: 1;
  padding: 2rem 0;
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

  .nav-logo-img {
    height: 44px;
  }
}
</style>
