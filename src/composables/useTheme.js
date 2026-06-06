import { ref } from 'vue'

const isDark = ref(false)

export function useTheme() {
  function initTheme() {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') {
      isDark.value = true
      document.documentElement.setAttribute('data-theme', 'dark')
    } else if (saved === 'light') {
      isDark.value = false
      document.documentElement.removeAttribute('data-theme')
    } else {
      const p = window.matchMedia('(prefers-color-scheme: dark)').matches
      isDark.value = p
      if (p) document.documentElement.setAttribute('data-theme', 'dark')
    }
  }

  function toggleTheme() {
    isDark.value = !isDark.value
    if (isDark.value) {
      document.documentElement.setAttribute('data-theme', 'dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem('theme', 'light')
    }
  }

  return { isDark, initTheme, toggleTheme }
}
