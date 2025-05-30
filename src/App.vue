<!-- src/App.vue -->
<template>
  <div class="app">
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App'
});
</script>

<style>
.app {
  width: 100%;
  height: 100vh;
}
</style>