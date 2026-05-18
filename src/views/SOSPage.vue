<template>
  <ion-page>
    <ion-content :fullscreen="true" class="sos-bg">
      
      <div class="sos-header">
        <ion-buttons slot="start">
          <ion-back-button default-href="/home" text="Volver al Inicio" class="back-btn-white"></ion-back-button>
        </ion-buttons>
      </div>

      <div class="sos-container">
        
        <div class="pulse-ring">
          <div class="sos-icon-container">
            <ion-icon :icon="shieldCheckmarkOutline" class="shield-icon"></ion-icon>
          </div>
        </div>

        <h1 class="sos-title">No estás solo.</h1>
        <p class="sos-subtitle">
          Hemos detectado niveles críticos de desgaste emocional. 
          Tu seguridad es nuestra prioridad. Por favor, utiliza una de nuestras redes de apoyo inmediatas.
        </p>

        <div class="support-network">
          
          <button class="support-btn btn-tecnm" @click="callSupport('tecnm')">
            <div class="btn-icon"><ion-icon :icon="businessOutline"></ion-icon></div>
            <div class="btn-text">
              <h3>Psicopedagogía TecNM</h3>
              <span>Llamar al departamento de tu campus</span>
            </div>
            <ion-icon :icon="callOutline" class="action-icon"></ion-icon>
          </button>

          <button class="support-btn btn-nacional" @click="callSupport('contacto')">
            <div class="btn-icon"><ion-icon :icon="heartOutline"></ion-icon></div>
            <div class="btn-text">
              <h3>Contacto de Emergencia</h3>
              <span>Llamar por teléfono a un familiar o amigo</span>
            </div>
            <ion-icon :icon="callOutline" class="action-icon"></ion-icon>
          </button>

          <button class="support-btn btn-personal" @click="notifyTrustedContact">
            <div class="btn-icon"><ion-icon :icon="logoWhatsapp"></ion-icon></div>
            <div class="btn-text">
              <h3>Contacto de Confianza</h3>
              <span>Enviar alerta automática por WhatsApp</span>
            </div>
            <ion-icon :icon="paperPlaneOutline" class="action-icon"></ion-icon>
          </button>

        </div>

        <div class="grounding-box">
          <h3>Técnica de Aterrizaje 5-4-3-2-1</h3>
          <p>Si sientes que pierdes el control, mira a tu alrededor y nombra en voz alta:</p>
          <ul>
            <li><strong>5</strong> cosas que puedas ver 👀</li>
            <li><strong>4</strong> cosas que puedas tocar ✋</li>
            <li><strong>3</strong> cosas que puedas escuchar 👂</li>
            <li><strong>2</strong> cosas que puedas oler 👃</li>
            <li><strong>1</strong> cosa que puedas saborear 👅</li>
          </ul>
        </div>

      </div>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, IonContent, IonButtons, IonBackButton, IonIcon, toastController, alertController 
} from '@ionic/vue';
import { 
  shieldCheckmarkOutline, callOutline, businessOutline, heartOutline, logoWhatsapp, paperPlaneOutline 
} from 'ionicons/icons';

// --- FUNCIONES DE SIMULACIÓN DE EMERGENCIA ---

const callSupport = async (type: string) => {
  // Ahora el tipo 'contacto' llama a tu persona de confianza
  const entity = type === 'tecnm' ? 'Psicopedagogía TecNM' : 'tu Contacto de Emergencia';
  const alert = await alertController.create({
    header: `Llamando a ${entity}`,
    message: `¿Permitir que StressOut realice esta llamada por ti?`,
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      { text: 'Llamar', handler: () => {
          // En una app real esto abre el marcador del teléfono usando window.open('tel:número')
          showToast(`Llamada en curso a ${entity}...`);
        } 
      }
    ]
  });
  await alert.present();
};

const notifyTrustedContact = async () => {
  const toast = await toastController.create({
    message: 'Abriendo WhatsApp con mensaje de emergencia preconfigurado...',
    duration: 3000,
    color: 'success',
    icon: logoWhatsapp
  });
  await toast.present();
};

const showToast = async (msg: string) => {
  const toast = await toastController.create({ message: msg, duration: 2500, color: 'dark' });
  await toast.present();
};
</script>

<style scoped>
/* FONDO DE EMERGENCIA (Oscuro y solemne para enfocar al usuario) */
.sos-bg {
  --background: #1A202C; 
  color: white;
  font-family: 'Poppins', sans-serif;
}

.sos-header { padding: 15px 10px; }
.back-btn-white { color: #A0AEC0; font-weight: 600; }

.sos-container {
  padding: 20px 25px 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

/* ANIMACIÓN DE PULSO Y ESCUDO */
.pulse-ring {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(229, 62, 62, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  animation: pulse 2s infinite;
  margin-bottom: 20px;
}

.sos-icon-container {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: #E53E3E; 
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 10px 25px rgba(229, 62, 62, 0.5);
}

.shield-icon { font-size: 35px; color: white; }

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(229, 62, 62, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(229, 62, 62, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(229, 62, 62, 0); }
}

/* TEXTOS DE CONTENCIÓN */
.sos-title { font-size: 28px; font-weight: 800; margin: 0; color: #FC8181; letter-spacing: -0.5px; }
.sos-subtitle { font-size: 14px; color: #E2E8F0; margin-top: 10px; line-height: 1.5; padding: 0 10px; }

/* REDES DE APOYO (BOTONES) */
.support-network { width: 100%; margin-top: 30px; display: flex; flex-direction: column; gap: 15px; max-width: 600px;}

.support-btn {
  width: 100%; display: flex; align-items: center; padding: 15px; border-radius: 16px; border: none;
  cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; text-align: left;
}
.support-btn:active { transform: scale(0.96); }

.btn-icon { width: 45px; height: 45px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; margin-right: 15px; }
.btn-text { flex: 1; }
.btn-text h3 { margin: 0; font-size: 15px; font-weight: 700; color: white; }
.btn-text span { font-size: 11px; color: rgba(255,255,255,0.7); line-height: 1.2; display: block; margin-top: 3px; }
.action-icon { font-size: 20px; color: white; opacity: 0.8; }

/* Colores específicos de los botones */
.btn-tecnm { background: #2C5282; box-shadow: 0 8px 20px rgba(44, 82, 130, 0.4); }
.btn-tecnm .btn-icon { background: rgba(255,255,255,0.15); color: #90CDF4; }

/* Mantengo la clase btn-nacional para el CSS pero con el nuevo nombre visual */
.btn-nacional { background: #C53030; box-shadow: 0 8px 20px rgba(197, 48, 48, 0.4); }
.btn-nacional .btn-icon { background: rgba(255,255,255,0.15); color: #FEB2B2; }

.btn-personal { background: #276749; box-shadow: 0 8px 20px rgba(39, 103, 73, 0.4); }
.btn-personal .btn-icon { background: rgba(255,255,255,0.15); color: #9AE6B4; }

/* TÉCNICA DE GROUNDING (ATERRIZAJE) */
.grounding-box {
  width: 100%; margin-top: 40px; background: rgba(255,255,255,0.05); padding: 20px;
  border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); text-align: left; max-width: 600px;
}

.grounding-box h3 { margin: 0 0 10px 0; font-size: 16px; font-weight: 700; color: #E2E8F0; text-align: center;}
.grounding-box p { margin: 0 0 15px 0; font-size: 12px; color: #A0AEC0; text-align: center;}
.grounding-box ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.grounding-box li { font-size: 13px; color: #E2E8F0; display: flex; align-items: center; gap: 10px; background: rgba(0,0,0,0.2); padding: 8px 12px; border-radius: 8px;}
.grounding-box li strong { font-size: 16px; color: #4FD1C5; }
</style>