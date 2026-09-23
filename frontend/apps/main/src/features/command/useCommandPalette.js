import { ref } from 'vue'

const open = ref(false)
const parent = ref(null)
const searchTerm = ref('')

export function useCommandPalette() {
  const openPalette = ({ parent: target = null } = {}) => {
    parent.value = target
    searchTerm.value = ''
    open.value = true
  }

  const closePalette = () => {
    open.value = false
  }

  const togglePalette = () => {
    if (open.value) closePalette()
    else openPalette({ parent: defaultParent() })
  }

  const setParent = (target) => {
    parent.value = target
    searchTerm.value = ''
  }

  // Ctrl+K inside the new-conversation dialog goes straight to macros.
  const defaultParent = () => null

  return {
    open,
    parent,
    searchTerm,

    openPalette,
    closePalette,
    togglePalette,
    setParent
  }
}
