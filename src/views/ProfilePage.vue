<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar color="light">
        <ion-buttons slot="start">
          <ion-back-button default-href="/home" text=""></ion-back-button>
        </ion-buttons>
        <ion-title>Mi Perfil</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="bg-gray">
      
      <div class="profile-header">
        <div class="avatar-container">
          <img src="https://i.pravatar.cc/150?img=12" alt="Perfil" class="profile-avatar"/>
          <div class="camera-badge">
            <ion-icon :icon="cameraOutline"></ion-icon>
          </div>
        </div>
        <h2 class="user-name">Estudiante Innovador</h2>
        <p class="user-career">Ingeniería en Sistemas</p>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <h3>12</h3>
          <p>Tareas</p>
        </div>
        <div class="stat-card">
          <h3>85%</h3>
          <p>Balance</p>
        </div>
        <div class="stat-card">
          <h3>{{ balanceStreak }}</h3>
          <p>Rachas</p>
        </div>
      </div>

      <div class="options-list">
        <ion-item button detail="true" class="custom-item" lines="none" @click="goToIntegrations">
          <div class="icon-box bg-purple"><ion-icon :icon="cloudUploadOutline"></ion-icon></div>
          <ion-label>Sincronizar Plataformas</ion-label>
        </ion-item>
        
        <ion-item class="custom-item" lines="none">
          <div class="icon-box bg-blue"><ion-icon :icon="notificationsOutline"></ion-icon></div>
          <ion-label>Notificaciones</ion-label>
          <ion-toggle slot="end" :checked="true" color="primary"></ion-toggle>
        </ion-item>

        <ion-item button class="custom-item item-logout" lines="none" @click="logout">
          <div class="icon-box bg-red-light"><ion-icon :icon="logOutOutline" class="text-red"></ion-icon></div>
          <ion-label class="text-red font-bold">Cerrar Sesión</ion-label>
        </ion-item>
      </div>

      <div class="analytics-container">
        <div class="analytics-header">
          <h3 class="section-title">Analítica Preventiva</h3>
          <p class="section-subtitle">Monitoreo de desgaste cognitivo para prevención de Burnout.</p>
        </div>

        <div class="chart-box">
          <div class="chart-legend">
            <span class="legend-item"><div class="dot dot-high"></div> Óptimo</span>
            <span class="legend-item"><div class="dot dot-med"></div> Medio</span>
            <span class="legend-item"><div class="dot dot-low"></div> Crítico</span>
          </div>

          <div class="chart-layout">
            <div class="y-axis">
              <span>100%</span>
              <span>50%</span>
              <span>0%</span>
            </div>
            
            <div class="bars-wrapper">
              <div class="grid-line" style="bottom: 100%;"></div>
              <div class="grid-line" style="bottom: 50%;"></div>
              <div class="grid-line" style="bottom: 0%;"></div>

              <div class="bar-col"><div class="bar bar-high" style="height: 80%"></div><span class="x-label">L</span></div>
              <div class="bar-col"><div class="bar bar-med" style="height: 60%"></div><span class="x-label">M</span></div>
              <div class="bar-col"><div class="bar bar-low" style="height: 20%"></div><span class="x-label">M</span></div>
              <div class="bar-col"><div class="bar bar-high" style="height: 90%"></div><span class="x-label">J</span></div>
              <div class="bar-col"><div class="bar bar-med" style="height: 50%"></div><span class="x-label">V</span></div>
              <div class="bar-col"><div class="bar bar-low" style="height: 10%"></div><span class="x-label">S</span></div>
              <div class="bar-col"><div class="bar bar-high" :style="`height: ${currentEnergy}%`"></div><span class="x-label today-text">D</span></div>
            </div>
          </div>
        </div>

        <div class="export-card" @click="downloadRealReport">
          <ion-icon :icon="documentTextOutline" class="export-icon"></ion-icon>
          <div class="export-texts">
            <h4>Exportar Reporte Clínico</h4>
            <p>Descarga un documento oficial con tu historial para el departamento de Psicopedagogía.</p>
          </div>
          <ion-icon :icon="downloadOutline" class="download-icon"></ion-icon>
        </div>
      </div>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButtons, IonBackButton, IonItem, IonLabel, IonIcon, 
  IonToggle, toastController 
} from '@ionic/vue';
import { 
  cameraOutline, cloudUploadOutline, notificationsOutline, 
  logOutOutline, documentTextOutline, downloadOutline 
} from 'ionicons/icons';
import { useRouter } from 'vue-router'; // Importamos el router
import { logout as firebaseLogout, getUserDataFromDb } from '../services/firebase';

const router = useRouter();
const currentEnergy = ref(50);
const balanceStreak = ref(0);

// NAVEGACIÓN
const goToIntegrations = () => {
  router.push('/integrations');
};

const logout = async () => {
  await firebaseLogout();
  localStorage.removeItem('mindSyncUserId');
  const toast = await toastController.create({ 
    message: 'Sesión cerrada correctamente.', duration: 2000, color: 'dark' 
  });
  await toast.present();
  router.push('/login'); // O la ruta que tengas para el inicio
};

// Al entrar, obtenemos la información desde Firebase
onMounted(async () => {
  const userId = localStorage.getItem('mindSyncUserId') || 'mock-user-123';
  const userData = await getUserDataFromDb(userId);
  currentEnergy.value = userData.energyLevel ?? 50;
  balanceStreak.value = userData.balanceStreak ?? 0;
});

// --- FUNCIÓN REAL DE DESCARGA DE REPORTE ---
const downloadRealReport = async () => {
  const toast = await toastController.create({ 
    message: '⏳ Recopilando métricas y generando documento...', 
    duration: 1500, 
    color: 'primary' 
  });
  await toast.present();

  setTimeout(async () => {
    const reportContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Reporte Preventivo - StressOut</title>
        <style>
          body { font-family: 'Arial', sans-serif; padding: 40px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #4FD1C5; padding-bottom: 20px; }
          h1 { color: #2D3748; }
          .logo { font-size: 24px; font-weight: bold; color: #4FD1C5; }
          .section { margin-top: 30px; background: #F7FAFC; padding: 20px; border-radius: 10px; }
          .warning { color: #E53E3E; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #CBD5E1; padding: 10px; text-align: left; }
          th { background-color: #E2E8F0; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">StressOut App</div>
          <h1>Reporte Clínico de Bienestar Estudiantil</h1>
          <p><strong>Fecha de emisión:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <div class="section">
          <h3>Datos del Estudiante</h3>
          <p><strong>Nombre:</strong> Estudiante Innovador</p>
          <p><strong>Carrera:</strong> Ingeniería en Sistemas</p>
          <p><strong>Nivel de Energía Actual:</strong> ${currentEnergy.value}%</p>
        </div>
        <div class="section">
          <h3>Historial Semanal (Batería Mental)</h3>
          <table>
            <tr><th>Día</th><th>Nivel de Energía</th><th>Estado</th></tr>
            <tr><td>Lunes</td><td>80%</td><td>Óptimo</td></tr>
            <tr><td>Martes</td><td>60%</td><td>Medio</td></tr>
            <tr><td>Miércoles</td><td class="warning">20%</td><td class="warning">Riesgo de Burnout</td></tr>
            <tr><td>Jueves</td><td>90%</td><td>Óptimo</td></tr>
            <tr><td>Viernes</td><td>50%</td><td>Medio</td></tr>
            <tr><td>Sábado</td><td class="warning">10%</td><td class="warning">Alerta Máxima</td></tr>
            <tr><td>Domingo</td><td>${currentEnergy.value}%</td><td>Actual</td></tr>
          </table>
          <p style="margin-top: 15px;"><em>Nota algorítmica: El estudiante presentó 2 días críticos en la semana. Se recomienda intervención de primer nivel o pausa activa obligatoria.</em></p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([reportContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Reporte_Clinico_StressOut.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    const successToast = await toastController.create({ 
      message: '✅ Reporte descargado exitosamente.', 
      duration: 3000, 
      color: 'success' 
    });
    await successToast.present();
  }, 1500);
};
</script>

<style scoped>
/* GENERAL */
.bg-gray { --background: #F4F7FE; }
ion-header { background: transparent; }
ion-toolbar { --background: transparent; --border-width: 0; }
ion-title { font-weight: 700; color: #1A202C; }

/* 1. HEADER */
.profile-header { display: flex; flex-direction: column; align-items: center; padding: 20px 20px 10px; }
.avatar-container { position: relative; margin-bottom: 10px; }
.profile-avatar { width: 90px; height: 90px; border-radius: 30px; object-fit: cover; box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
.camera-badge { position: absolute; bottom: -5px; right: -5px; background: #4FD1C5; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 3px solid #F4F7FE; cursor: pointer; }
.user-name { margin: 0; font-size: 20px; font-weight: 700; color: #1A202C; }
.user-career { margin: 5px 0 0; font-size: 13px; color: #718096; }

/* 2. TARJETAS DE ESTADÍSTICAS */
.stats-row { display: flex; justify-content: space-between; padding: 0 20px; margin-top: 15px; gap: 10px; max-width: 600px; margin-left: auto; margin-right: auto; }
.stat-card { flex: 1; background: white; border-radius: 20px; padding: 15px 10px; text-align: center; box-shadow: 0 12px 30px rgba(0,0,0,0.04); }
.stat-card h3 { margin: 0; font-size: 22px; font-weight: 800; color: #1A202C; }
.stat-card p { margin: 5px 0 0; font-size: 11px; color: #A0AEC0; font-weight: 600; text-transform: uppercase; }

/* 3. LISTA DE OPCIONES */
.options-list { padding: 0 20px; margin-top: 25px; max-width: 600px; margin-left: auto; margin-right: auto; }
.custom-item { --background: white; border-radius: 20px; margin-bottom: 12px; box-shadow: 0 12px 30px rgba(0,0,0,0.04); --padding-start: 15px; --inner-padding-end: 15px; font-family: 'Poppins', sans-serif;}
.custom-item ion-label { font-size: 14px; font-weight: 600; color: #2D3748; margin-left: 10px; }
.icon-box { width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; margin-right: 5px; }

/* Colores de íconos */
.bg-purple { background: #FAF5FF; color: #805AD5; }
.bg-blue { background: #EBF8FF; color: #3182CE; }
.bg-red-light { background: #FFF5F5; }
.text-red { color: #E53E3E !important; }
.font-bold { font-weight: 700 !important; }

/* 4. ANALÍTICA PREVENTIVA */
.analytics-container { padding: 0 20px; margin-top: 35px; margin-bottom: 40px; max-width: 600px; margin-left: auto; margin-right: auto; }
.analytics-header { margin-bottom: 15px; }
.section-title { font-size: 18px; font-weight: 700; color: #2D3748; margin: 0; }
.section-subtitle { font-size: 12px; color: #718096; margin: 5px 0 0; line-height: 1.4; }

/* Gráfica Explicativa */
.chart-box { background: white; padding: 25px 20px 20px; border-radius: 20px; box-shadow: 0 12px 30px rgba(0,0,0,0.04); margin-bottom: 15px; }
.chart-legend { display: flex; justify-content: center; gap: 15px; margin-bottom: 20px; }
.legend-item { display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 600; color: #718096; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.dot-high { background: #4FD1C5; } .dot-med { background: #63B3ED; } .dot-low { background: #FC8181; }

.chart-layout { display: flex; height: 160px; gap: 10px; }
.y-axis { display: flex; flex-direction: column; justify-content: space-between; align-items: flex-end; width: 35px; color: #A0AEC0; font-size: 10px; font-weight: 700; padding-bottom: 20px; /* Espacio para las letras LMMJVSD */ }
.bars-wrapper { flex: 1; display: flex; justify-content: space-between; align-items: flex-end; position: relative; padding-bottom: 20px; }

/* Líneas guía horizontales */
.grid-line { position: absolute; left: 0; right: 0; height: 1px; background-color: #EDF2F7; z-index: 1; }

.bar-col { display: flex; flex-direction: column; align-items: center; width: 28px; height: 100%; justify-content: flex-end; z-index: 2; position: relative; }
.bar { width: 100%; border-radius: 6px; transition: height 1s ease-in-out; position: relative; z-index: 2;}
.bar-high { background: #4FD1C5; } .bar-med { background: #63B3ED; } .bar-low { background: #FC8181; }

.x-label { position: absolute; bottom: -20px; font-size: 11px; font-weight: 600; color: #A0AEC0; width: 100%; text-align: center; }
.today-text { color: #2D3748 !important; font-weight: 800 !important; }

/* Botón Exportar */
.export-card { background: white; padding: 18px 20px; border-radius: 20px; display: flex; align-items: center; gap: 15px; box-shadow: 0 12px 30px rgba(0,0,0,0.04); cursor: pointer; transition: 0.2s; border: 2px solid transparent; }
.export-card:hover { border-color: #E2E8F0; }
.export-card:active { transform: scale(0.97); border-color: #4FD1C5; }
.export-icon { font-size: 32px; color: #4FD1C5; }
.export-texts { flex: 1; }
.export-texts h4 { margin: 0; font-size: 15px; font-weight: 700; color: #2D3748; }
.export-texts p { margin: 4px 0 0; font-size: 11px; color: #A0AEC0; line-height: 1.3; }
.download-icon { font-size: 24px; color: #CBD5E1; }
</style>