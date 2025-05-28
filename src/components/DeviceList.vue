<!-- src/components/DeviceList.vue -->
<template>
    <div>
      
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, onMounted, onUnmounted, ref } from 'vue';
  import { DeviceService } from '../services/DeviceService';

  interface Device {
    udid: string;
    pid?: number;
    'ro.product.manufacturer': string;
    'ro.product.model': string;
    'ro.build.version.release': string;
    'ro.build.version.sdk': string;
  }
  
  export default defineComponent({
    name: 'DeviceList',
    setup() {
      const devices = ref<Device[]>([]);
      const isLoading = ref(false);
      const deviceService = new DeviceService();
      let cleanup: (() => void) | null = null;
  
      onMounted(() => {
        deviceService.connect();
        cleanup = deviceService.onDeviceList((deviceList: Device[]) => {
          devices.value = deviceList;
        });
      });

      onUnmounted(() => {
        if (cleanup) {
          cleanup();
        }
        deviceService.disconnect();
      });
  
      const startServer = async (device: Device) => {
        try {
          isLoading.value = true;
          const response = await fetch('http://localhost:8000/start', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              udid: device.udid
            })
          });
          
          if (!response.ok) {
            throw new Error('Failed to start server');
          }

          const result = await response.json();
          console.log('Server started:', result);
        } catch (error) {
          console.error('Error starting server:', error);
          alert('Failed to start server. Please try again.');
        } finally {
          isLoading.value = false;
        }
      };
  
      const stopServer = async (device: Device) => {
        try {
          isLoading.value = true;
          const response = await fetch('http://localhost:8000/stop', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              udid: device.udid
            })
          });
          
          if (!response.ok) {
            throw new Error('Failed to stop server');
          }

          const result = await response.json();
          console.log('Server stopped:', result);
        } catch (error) {
          console.error('Error stopping server:', error);
          alert('Failed to stop server. Please try again.');
        } finally {
          isLoading.value = false;
        }
      };
  
      return {
        devices,
        isLoading,
        startServer,
        stopServer
      };
    }
  });
  </script>
  
  <style scoped>
  .device-list {
    padding: 20px;
  }
  
  .device-item {
    border: 1px solid #ddd;
    margin: 10px 0;
    padding: 15px;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .device-info h3 {
    margin: 0 0 10px 0;
    color: #333;
  }
  
  .device-info p {
    margin: 5px 0;
    color: #666;
  }
  
  .device-actions {
    margin-top: 15px;
  }
  
  button {
    padding: 8px 16px;
    border-radius: 4px;
    border: none;
    background: #4CAF50;
    color: white;
    cursor: pointer;
    transition: background 0.3s;
  }
  
  button:hover {
    background: #45a049;
  }

  button:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
  </style>