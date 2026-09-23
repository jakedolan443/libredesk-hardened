const defaultBrowser = {
  navigate: (url) => {
    window.location.href = url
  }
}
export const createLogout =
  (browser = defaultBrowser) =>
  () =>
    browser.navigate('/logout')
export const useLogout = () => createLogout()
