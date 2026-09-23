// Clean up only this application's legacy push worker, without registering a new one.
export async function retireNotificationWorker() {
  if (!('serviceWorker' in navigator)) return
  try {
    const registrations = await navigator.serviceWorker.getRegistrations()
    for (const registration of registrations) {
      const worker = registration.active || registration.waiting || registration.installing
      if (!worker || new URL(worker.scriptURL).href !== new URL('/sw.js', location.origin).href)
        continue
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) await subscription.unsubscribe()
      await registration.unregister()
    }
  } catch {
    // Offline cleanup can retry on the next page load; the server no longer sends push.
  }
}
