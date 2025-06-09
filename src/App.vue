<!-- src/App.vue -->
<template>
  <div class="app">
    <!-- <router-view></router-view> -->
     <AndroidDevice/>

   
  </div>
</template>

<script setup lang="ts">
import AndroidDevice from './components/android/AndroidDevice.vue';
import DeviceList from './components/DeviceList.vue';
</script>

<style>
.app {
  width: 100%;
  height: 100vh;
}
</style>