# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

# WS-SCRCPY Dialog

A Vue 3 dialog component for ws-scrcpy.

## Installation

```bash
npm install ws-scrcpy-dialog primevue@^4.3.0
```

## Requirements

This library requires the following peer dependencies:

- Vue 3.4+
- PrimeVue 4.3+

## Setup

1. Install and setup PrimeVue in your project:

```js
import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Dialog from 'primevue/dialog'

const app = createApp(App)
app.use(PrimeVue)
app.component('Dialog', Dialog)
```

2. Import PrimeVue CSS:

```js
import 'primevue/resources/themes/aura/theme.css'
import 'primevue/resources/primevue.min.css'
```

3. Import and use the dialog component:

```js
import { AndroidDeviceDialog } from 'ws-scrcpy-dialog'

// Use in your component
export default {
  components: {
    AndroidDeviceDialog
  }
}
```

## Usage

```vue
<template>
  <AndroidDeviceDialog
    v-model:visible="visible"
    :device="device"
    :wsUrl="wsUrl"
    @close="handleClose"
  />
</template>
```

For more details about TypeScript support and available props, please refer to the documentation.
