// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
vi.mock('vue-router', () => ({ useRouter: () => ({ currentRoute: { value: { params: {} } } }) }))
vi.mock('@main/websocket', () => ({
  subscribeToConversation: vi.fn(),
  sendTypingIndicator: vi.fn(),
  subscribeListReplace: vi.fn()
}))
vi.mock('@main/i18n', () => ({ getI18n: () => ({ global: { t: (key) => key } }) }))
vi.mock('@main/composables/useEmitter', () => ({
  useEmitter: () => ({ emit: vi.fn(), on: vi.fn(), off: vi.fn() })
}))
vi.mock('@main/api', () => ({ default: {} }))
import { useConversationStore } from './conversation'

describe('mail reply recipients', () => {
  it('prefills the sender address without a contact profile', async () => {
    setActivePinia(createPinia())
    const store = useConversationStore()
    store.conversation.data = {
      uuid: 'mail',
      inbox_mail: 'mail@example.test',
      correspondent: { email: 'sender@example.test' }
    }
    store.messages.data.addMessages(
      'mail',
      [
        {
          uuid: 'message',
          type: 'incoming',
          private: false,
          created_at: new Date().toISOString(),
          meta: { from: ['sender@example.test'], to: ['mail@example.test'] }
        }
      ],
      1,
      1
    )
    store.messages.version++
    await nextTick()
    expect(store.currentTo).toEqual(['sender@example.test'])
    expect(store.currentCC).toEqual([])
  })
})
