import { describe, expect, it, vi } from 'vitest'
import { createLogout } from './useLogout'
describe('logout', () => {
  it('navigates to the server logout route', () => {
    const browser = { navigate: vi.fn() }
    createLogout(browser)()
    expect(browser.navigate).toHaveBeenCalledWith('/logout')
  })
})
