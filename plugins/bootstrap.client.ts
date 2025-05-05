import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Define Bootstrap for TypeScript
declare global {
  interface Window {
    bootstrap: any;
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  // Bootstrap is automatically initialized by importing the JS
  
  // Ensure Bootstrap components are initialized after page navigation
  nuxtApp.hook('page:finish', () => {
    // This ensures dropdowns work correctly after page changes
    if (typeof window !== 'undefined' && window.bootstrap) {
      const dropdownElementList = document.querySelectorAll('.dropdown-toggle')
      dropdownElementList.forEach(dropdownToggle => {
        new window.bootstrap.Dropdown(dropdownToggle)
      })
    }
  })
}) 