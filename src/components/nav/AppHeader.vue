<template>
  <nav class="app-nav" :aria-label="t('nav.main')">
    <div class="nav-container">
      <router-link to="/" class="nav-logo-link">
        <img :src="logoSrc" alt="Monday" class="nav-logo-img" />
      </router-link>

      <details ref="mobileMenuRef" class="nav-mobile">
        <summary
          class="nav-mobile__trigger"
          :aria-label="t('nav.openMenu')"
          :title="t('nav.openMenu')"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
            />
          </svg>
        </summary>
        <div class="nav-mobile__panel">
          <router-link
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="nav-mobile__link"
            @click="closeMobileMenu"
          >
            {{ item.label }}
          </router-link>
        </div>
      </details>

      <div class="nav-links">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-link"
        >
          {{ item.label }}
        </router-link>
      </div>

      <div class="nav-actions">
        <NotificationCenter />
        <NavSettingsMenu />
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import NotificationCenter from '@/components/notifications/NotificationCenter.vue'
import NavSettingsMenu from '@/components/nav/NavSettingsMenu.vue'
import { useTheme } from '@/composables/useTheme'
import logoLight from '@assets/logo.png'
import logoDark from '@assets/logo-dark.png'

const { t } = useI18n()
const route = useRoute()
const { theme } = useTheme()

const mobileMenuRef = ref<HTMLDetailsElement | null>(null)

const logoSrc = computed(() => (theme.value === 'dark' ? logoDark : logoLight))

const navItems = computed(() => [
  { to: '/', label: t('nav.dashboard') },
  { to: '/hypotheses', label: t('nav.hypotheses') },
  { to: '/appointments', label: t('nav.appointments') },
  { to: '/journal', label: t('nav.journal') },
])

function closeMobileMenu() {
  if (mobileMenuRef.value) mobileMenuRef.value.open = false
}

watch(
  () => route.path,
  () => closeMobileMenu()
)
</script>

<style scoped>
.app-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg-nav);
  border-bottom: 1px solid var(--border);
  padding: 0.65rem 0;
  transition:
    background-color 0.2s,
    border-color 0.2s;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 1px 0 var(--border);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-logo-link {
  display: block;
  flex-shrink: 0;
  text-decoration: none;
  height: 44px;
  width: 120px;
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

.nav-links {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex: 1;
  min-width: 0;
}

.nav-link {
  text-decoration: none;
  color: var(--text-muted);
  font-weight: 500;
  font-size: 0.9rem;
  padding: 0.4rem 0.7rem;
  border-radius: 8px;
  transition:
    color 0.2s,
    background 0.2s;
  white-space: nowrap;
}

.nav-link:hover {
  color: var(--text-primary);
  background: var(--bg-muted);
}

.nav-link.router-link-active {
  color: var(--accent-strong);
  background: color-mix(in srgb, var(--accent-strong) 14%, transparent);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
  margin-left: auto;
}

.nav-mobile {
  display: none;
  position: relative;
}

.nav-mobile__trigger {
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  background: var(--bg-muted);
  color: var(--text-primary);
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s;
}

.nav-mobile__trigger::-webkit-details-marker {
  display: none;
}

.nav-mobile__trigger:hover {
  background: var(--bg-surface);
  border-color: var(--accent);
}

.nav-mobile[open] .nav-mobile__trigger {
  background: color-mix(in srgb, var(--accent-strong) 12%, var(--bg-muted));
  border-color: var(--accent);
  color: var(--accent-strong);
}

.nav-mobile__trigger svg {
  width: 1.1rem;
  height: 1.1rem;
}

.nav-mobile__panel {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  z-index: 150;
  min-width: 12rem;
  padding: 0.35rem;
  border: 1px solid var(--border-strong);
  border-radius: 10px;
  background: var(--bg-surface);
  box-shadow: 0 12px 32px var(--shadow);
}

.nav-mobile__link {
  display: block;
  padding: 0.55rem 0.75rem;
  border-radius: 8px;
  text-decoration: none;
  color: var(--text-muted);
  font-weight: 500;
  font-size: 0.9rem;
}

.nav-mobile__link:hover {
  color: var(--text-primary);
  background: var(--bg-muted);
}

.nav-mobile__link.router-link-active {
  color: var(--accent-strong);
  background: color-mix(in srgb, var(--accent-strong) 14%, transparent);
}

@media (max-width: 900px) {
  .nav-links {
    display: none;
  }

  .nav-mobile {
    display: block;
    margin-right: auto;
  }

  .nav-container {
    flex-wrap: nowrap;
  }

  .nav-logo-link {
    margin-right: 0.25rem;
  }
}

@media (max-width: 480px) {
  .nav-container {
    padding: 0 1rem;
    gap: 0.5rem;
  }

  .nav-logo-link {
    height: 38px;
    width: 104px;
  }
}
</style>
