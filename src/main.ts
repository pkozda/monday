import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { seedDatabaseIfEmpty } from '@/db/seed'

async function bootstrap() {
  await seedDatabaseIfEmpty()

  const app = createApp(App)
  app.use(router)
  app.mount('#app')
}

bootstrap()
