<template>
  <ion-page>
    <ion-content :fullscreen="true" class="login-content">
      
      <div class="login-container animate-up">
        <div class="hero-section">
          <div class="mascot-circle">
            <img src="/public/axel_alto.png" alt="Axel" class="hero-img" />
          </div>
          <h1 class="app-title">Stressout</h1>
          <p class="app-subtitle">Tu mente es tu mayor activo.<br>Cuídala.</p>
        </div>

        <div class="form-card">
          <div class="input-group">
            <ion-icon :icon="mailOutline" class="input-icon"></ion-icon>
            <input type="email" placeholder="Correo Institucional" v-model="email" />
          </div>

          <div class="input-group">
            <ion-icon :icon="lockClosedOutline" class="input-icon"></ion-icon>
            <input type="password" placeholder="Contraseña" v-model="password" />
          </div>

          <ion-button expand="block" class="btn-primary" @click="doAuth" :disabled="isLoading">
            {{ isLoading ? 'Cargando...' : (isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión') }}
          </ion-button>

          </div>

        <div class="footer-text">
          <p v-if="!isRegistering">¿No tienes cuenta? <strong @click="toggleMode">Regístrate aquí</strong></p>
          <p v-else>¿Ya tienes cuenta? <strong @click="toggleMode">Inicia Sesión</strong></p>
        </div>
      </div>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonPage, IonContent, IonButton, IonIcon, toastController } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { mailOutline, lockClosedOutline } from 'ionicons/icons';
import { login, register, isFirebaseConfigured } from '../services/firebase';

const router = useRouter();

const email = ref('');
const password = ref('');
const isRegistering = ref(false);
const isLoading = ref(false);

const toggleMode = () => {
  isRegistering.value = !isRegistering.value;
};

const doAuth = async () => {
  if (!email.value || !password.value) {
    const toast = await toastController.create({ message: 'Ingresa correo y contraseña', duration: 2000, color: 'warning' });
    await toast.present();
    return;
  }

  isLoading.value = true;
  try {
    let res;
    if (isRegistering.value) {
      res = await register(email.value, password.value);
    } else {
      res = await login(email.value, password.value);
    }

    if (res?.mock) {
      // Si Firebase no está configurado, simulamos el login y avisamos
      const toast = await toastController.create({ 
        message: 'Aviso: Firebase no configurado. Usando modo de prueba local.', 
        duration: 3000, 
        color: 'tertiary' 
      });
      await toast.present();
    } else {
      const msg = isRegistering.value ? 'Cuenta creada exitosamente' : 'Bienvenido de vuelta';
      const toast = await toastController.create({ message: msg, duration: 2000, color: 'success' });
      await toast.present();
    }
    
    // Guardamos el UID en localStorage temporalmente si queremos para referencias rápidas
    if (res?.user?.uid) {
      localStorage.setItem('mindSyncUserId', res.user.uid);
    } else {
      localStorage.setItem('mindSyncUserId', 'mock-user-123');
    }

    router.push('/home');
  } catch (error: any) {
    console.error('Auth error:', error);
    let msg = 'Error de autenticación';
    if (error.code === 'auth/email-already-in-use') msg = 'El correo ya está registrado';
    if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') msg = 'Credenciales inválidas';
    if (error.code === 'auth/weak-password') msg = 'La contraseña debe tener al menos 6 caracteres';
    
    const toast = await toastController.create({ message: msg, duration: 3000, color: 'danger' });
    await toast.present();
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Fondo degradado suave animado */
.login-content { --background: linear-gradient(135deg, #E6FFFA 0%, #EBF4FF 50%, #FAF5FF 100%); background-size: 200% 200%; animation: gradientBG 10s ease infinite; }
@keyframes gradientBG { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }

.login-container {
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  min-height: 100%; padding: 20px;
}

/* HERO SECTION */
.hero-section { text-align: center; margin-bottom: 35px; animation: floatHero 4s ease-in-out infinite; }
@keyframes floatHero { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

/* Círculo blanco GIGANTE para la mascota */
.mascot-circle {
  width: 240px;
  height: 240px;
  background: white; border-radius: 50%;
  margin: 0 auto 25px; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 20px 40px rgba(0,0,0,0.08); /* Sombra un poco más marcada */
}
/* Tu imagen GIGANTE dentro del círculo */
.hero-img { 
  width: 200px;
  height: auto;
  transform: scale(1.6);
}

/* Títulos */
.app-title { 
  font-family: 'Poppins', sans-serif; font-size: 36px; font-weight: 800; color: #0F172A; margin: 0; letter-spacing: -0.5px;
}
.app-subtitle { 
  font-family: 'Poppins', sans-serif; color: #64748B; font-size: 16px; margin-top: 10px; line-height: 1.5;
}

/* CARD DEL FORMULARIO (Glassmorphism) */
.form-card {
  background: rgba(255, 255, 255, 0.65); width: 100%; max-width: 400px;
  padding: 40px 30px; border-radius: 30px;
  box-shadow: 0 20px 50px rgba(49, 151, 149, 0.08);
  backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);
  border: 2px solid rgba(255, 255, 255, 0.8);
}

/* Inputs */
.input-group {
  display: flex; align-items: center; margin-bottom: 20px; background: #F8FAFC;
  border-radius: 16px; padding: 0 15px; border: 2px solid transparent;
  transition: all 0.2s ease; height: 55px;
}
.input-group:focus-within { border-color: #4FD1C5; background: white; }
.input-icon { color: #94A3B8; font-size: 22px; margin-right: 12px; }
input {
  width: 100%; border: none; background: transparent; outline: none;
  font-family: 'Poppins', sans-serif; font-size: 15px; color: #334155; font-weight: 500;
}
input::placeholder { color: #CBD5E1; }

/* BOTÓN PRIMARIO (Gradient Glass) */
.btn-primary {
  --background: linear-gradient(135deg, #4FD1C5 0%, #319795 100%); 
  --border-radius: 16px; 
  --box-shadow: 0 10px 25px rgba(49,151,149,0.3);
  font-family: 'Poppins', sans-serif; font-weight: 800; text-transform: none; 
  font-size: 16px; height: 55px; margin-top: 15px; transition: transform 0.2s ease;
}
.btn-primary:active { transform: scale(0.96); }

/* FOOTER */
.footer-text { 
  text-align: center; margin-top: 30px; font-size: 14px; color: #64748B; font-weight: 500;
}
.footer-text strong { color: #4FD1C5; cursor: pointer; }

/* Animación de entrada */
.animate-up { animation: fadeUp 0.6s ease-out; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>