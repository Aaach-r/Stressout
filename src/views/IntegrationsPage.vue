<template>
  <ion-page>
    <ion-content :fullscreen="true" class="integrations-bg">
      
      <div class="header-simple">
        <div class="back-btn" @click="goBack">
          <ion-icon :icon="chevronBackOutline"></ion-icon>
        </div>
        <h2>Conectar Plataformas</h2>
      </div>

      <div class="intro-text">
        <p>Sincroniza tus aulas virtuales. <br>Stressout importará tus tareas automáticamente.</p>
      </div>

      <div class="platforms-grid">
        
        <div class="platform-card">
          <div class="platform-icon teams-bg">
            <ion-icon :icon="peopleOutline"></ion-icon>
          </div>
          <div class="platform-info">
            <h3>Microsoft Teams</h3>
            <p>Tareas y Asignaciones</p>
          </div>
          <ion-toggle 
            :checked="connectedTeams" 
            @ionChange="toggleConnection('teams', $event)"
            color="primary">
          </ion-toggle>
        </div>

        <div class="platform-card">
          <div class="platform-icon classroom-bg">
            <ion-icon :icon="schoolOutline"></ion-icon>
          </div>
          <div class="platform-info">
            <h3>Google Classroom</h3>
            <p>Pendientes y Calendario</p>
          </div>
          <ion-toggle 
            :checked="connectedClassroom" 
            @ionChange="toggleConnection('classroom', $event)"
            color="success">
          </ion-toggle>
        </div>

        <div class="platform-card">
          <div class="platform-icon moodle-bg">
            <ion-icon :icon="bookOutline"></ion-icon>
          </div>
          <div class="platform-info">
            <h3>Moodle / Canvas</h3>
            <p>Actividades del curso</p>
          </div>
          <ion-toggle 
            :checked="connectedMoodle" 
            @ionChange="toggleConnection('moodle', $event)"
            color="warning">
          </ion-toggle>
        </div>

      </div>

      <div v-if="isSyncing" class="sync-status animate-fade">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Buscando tareas nuevas en la nube...</p>
      </div>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonPage, IonContent, IonIcon, IonToggle, IonSpinner, toastController } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { chevronBackOutline, peopleOutline, schoolOutline, bookOutline } from 'ionicons/icons';
import { mockLmsResponse } from '../data/mockLmsData';

const router = useRouter();
const isSyncing = ref(false);

// Estado de las conexiones (Simulado)
const connectedTeams = ref(localStorage.getItem('ms_teams_connected') === 'true');
const connectedClassroom = ref(localStorage.getItem('ms_classroom_connected') === 'true');
const connectedMoodle = ref(false);

const goBack = () => router.back();

const toggleConnection = async (platform: string, event: any) => {
  const isChecked = event.detail.checked;
  
  if (isChecked) {
    // SIMULACIÓN DE CONEXIÓN API
    isSyncing.value = true;
    
    // Fingimos que tarda 2 segundos en conectarse al servidor de Microsoft/Google
    setTimeout(async () => {
      isSyncing.value = false;
      
      // Guardamos que ya está conectado
      if (platform === 'teams') localStorage.setItem('ms_teams_connected', 'true');
      if (platform === 'classroom') localStorage.setItem('ms_classroom_connected', 'true');
      
      // INYECTAMOS TAREAS FALSAS A LA BASE DE DATOS LOCAL
      injectFakeTasks(platform);

      const toast = await toastController.create({
        message: `¡Conexión exitosa! Tareas de ${platform} importadas.`,
        duration: 2000,
        color: 'success',
        position: 'top'
      });
      await toast.present();
    }, 2000);
  } else {
    // Desconectar
    if (platform === 'teams') localStorage.setItem('ms_teams_connected', 'false');
    if (platform === 'classroom') localStorage.setItem('ms_classroom_connected', 'false');
  }
};

const injectFakeTasks = (platform: string) => {
  // Recuperamos las tareas actuales
  const currentTasks = JSON.parse(localStorage.getItem('mindSyncTasks') || '[]');
  
  const newTasks = mockLmsResponse.filter(t => t.platform === platform).map((t, i) => {
    const lowerTitle = t.title.toLowerCase();
    let diff = 2;
    let diffLabel = '💧 Medio';
    
    // Analizador de Estrés de IA simulado
    if (lowerTitle.includes('examen') || lowerTitle.includes('proyecto') || lowerTitle.includes('ensayo') || lowerTitle.includes('final')) {
      diff = 3; diffLabel = '🔥 Difícil';
    } else if (lowerTitle.includes('leer') || lowerTitle.includes('video') || lowerTitle.includes('repaso') || lowerTitle.includes('cuestionario')) {
      diff = 1; diffLabel = '🍃 Fácil';
    }
    
    return {
      id: Date.now() + i,
      title: t.title,
      materia: t.course,
      difficulty: diff,
      difficultyLabel: diffLabel,
      source: platform
    };
  });

  // Fusionamos poniendo las nuevas arriba
  const updatedTasks = [...newTasks, ...currentTasks];
  localStorage.setItem('mindSyncTasks', JSON.stringify(updatedTasks));
};
</script>

<style scoped>
.integrations-bg { --background: #F4F7FE; }

.header-simple { padding: 20px; display: flex; align-items: center; gap: 20px; }
.back-btn { width: 40px; height: 40px; background: white; border-radius: 12px; display: flex; justify-content: center; align-items: center; box-shadow: 0 5px 15px rgba(0,0,0,0.05); cursor: pointer; }
h2 { font-size: 20px; font-weight: 700; color: #2B3674; margin: 0; }

.intro-text { padding: 0 25px 20px; color: #A3AED0; font-size: 14px; }

.platforms-grid { padding: 20px; display: flex; flex-direction: column; gap: 15px; }

.platform-card {
  background: white; padding: 20px; border-radius: 20px;
  display: flex; align-items: center; gap: 15px;
  box-shadow: 0 12px 30px rgba(0,0,0,0.04);
}

.platform-icon { width: 50px; height: 50px; border-radius: 14px; display: flex; justify-content: center; align-items: center; font-size: 24px; color: white; }
.teams-bg { background: #6264A7; } /* Color oficial Teams */
.classroom-bg { background: #0F9D58; } /* Color oficial Classroom */
.moodle-bg { background: #F98012; } /* Color Moodle */

.platform-info h3 { margin: 0; font-size: 16px; font-weight: 700; color: #2B3674; }
.platform-info p { margin: 2px 0 0; font-size: 12px; color: #A3AED0; }

.sync-status {
  text-align: center; margin-top: 40px; color: #4318FF; font-weight: 600; font-size: 14px;
  display: flex; flex-direction: column; align-items: center; gap: 10px;
}
.animate-fade { animation: fadeIn 0.5s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>