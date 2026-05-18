<template>
  <ion-app>
    <div v-if="isLoading" class="splash-screen">
      <div class="logo-container">
        <div class="pulse-circle"></div>
        <h1>StressOut</h1>
        <p>Sincronizando energía...</p>
      </div>
    </div>

    <ion-router-outlet v-else />
  </ion-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { IonApp, IonRouterOutlet } from '@ionic/vue';

const isLoading = ref(true);

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false;
  }, 3000); // 3 segundos de carga simulada
});
</script>

<style scoped>
.splash-screen {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: #F4F7F6; z-index: 9999;
  display: flex; align-items: center; justify-content: center;
}
.logo-container { text-align: center; color: #5B9BD5; font-family: sans-serif; }
.pulse-circle {
  width: 80px; height: 80px; background: #5B9BD5; border-radius: 50%;
  margin: 0 auto 20px; animation: pulse 2s infinite;
}
@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(91, 155, 213, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(91, 155, 213, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(91, 155, 213, 0); }
}
</style>