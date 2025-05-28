<!-- src/App.vue -->
<template>
  <div class="app">
    <h1>Connected Devices</h1>
    <DeviceList />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DeviceList from './components/DeviceList.vue';

export default defineComponent({
  name: 'App',
  components: {
    DeviceList
  }
});
</script>