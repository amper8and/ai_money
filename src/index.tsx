import { Hono } from 'hono'
// @ts-ignore — Vite raw import
import appHtml from '../public/static/app.html?raw'

const app = new Hono()

// Serve the full SPA HTML
app.get('/', (c) => c.html(appHtml))

// Serve image assets
app.get('/welcome-background-with-logo.jpg', async (c) => {
  // @ts-ignore
  const img = await import('../public/welcome-background-with-logo.jpg?url')
  return c.redirect(img.default)
})

app.get('/amina-profile.png', async (c) => {
  // @ts-ignore
  const img = await import('../public/amina-profile.png?url')
  return c.redirect(img.default)
})

export default app
