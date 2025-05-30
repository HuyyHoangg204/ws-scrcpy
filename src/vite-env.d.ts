/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Add Buffer to window
interface Window {
  Buffer: typeof Buffer;
}

declare module 'buffer/' {
  export { Buffer } from 'buffer';
}
