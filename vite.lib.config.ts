import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    // dts({
    //   insertTypesEntry: true,
    // }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/lib/index.ts'),
      name: 'WsScrcpyDialog',
      fileName: (format) => `ws-scrcpy-dialog.${format}.js`,
    },
    rollupOptions: {
      external: [
        'vue',
        'primevue',
        '@kalimahapps/vue-icons',
        '@vueuse/core'
      ],
      output: {
        globals: {
          vue: 'Vue',
          primevue: 'PrimeVue',
        },
      },
    },
  },
}) 