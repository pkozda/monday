import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { purgeSeedMockData, seedDatabaseIfEmpty } from '@/db/seed'
import { initTheme } from '@/composables/useTheme'

initTheme()

async function bootstrap() {
  await purgeSeedMockData()
  await seedDatabaseIfEmpty()

  const app = createApp(App)
  app.use(router)
  app.mount('#app')
}

bootstrap()
