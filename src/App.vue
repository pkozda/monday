<template>
  <div id="app">
    <nav class="app-nav">
      <div class="nav-container">
        <h1 class="nav-logo">Monday</h1>
        <div class="nav-links">
          <router-link to="/" class="nav-link">Dashboard</router-link>
          <router-link to="/timeline" class="nav-link">Timeline</router-link>
          <router-link to="/hypotheses" class="nav-link">Hypotheses</router-link>
          <router-link to="/journal" class="nav-link">Journal</router-link>
        </div>
      </div>
    </nav>
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
// App component
</script>

<style>
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
  background: #121212;
  color: #e0e0e0;
  line-height: 1.5;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-nav {
  background: #1e1e1e;
  border-bottom: 1px solid #333;
  padding: 1rem 0;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo {
  font-size: 1.5rem;
  font-weight: 600;
  color: #e0e0e0;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: #999;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover {
  color: #e0e0e0;
}

.nav-link.router-link-active {
  color: #64b5f6;
}

.app-main {
  flex: 1;
  padding: 2rem 0;
}
</style>
