if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      })
      console.log('Service Worker registered successfully:', registration)
    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  })
}

let deferredPrompt

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt = e
  window.dispatchEvent(new CustomEvent('pwa-installable'))
})

window.installPWA = async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response to the install prompt: ${outcome}`)
    deferredPrompt = null
    window.dispatchEvent(new CustomEvent('pwa-installed'))
  }
}
