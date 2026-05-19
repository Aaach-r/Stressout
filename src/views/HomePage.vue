<template>
  <ion-page>
    <ion-content :fullscreen="true" class="app-bg">
      
      <div class="header-container">
        <div class="header-texts">
          <span class="date-badge">{{ todayDate }} <span class="streak-badge" v-if="balanceStreak > 0"><ion-icon :icon="flameOutline" style="margin-right: 4px;"></ion-icon> Racha: {{ balanceStreak }}</span></span>
          <h1>Hola, Campeón</h1>
        </div>
        <div class="profile-btn" @click="goToProfile">
          <img src="https://i.pravatar.cc/150?img=12" alt="Perfil" />
        </div>
      </div>

      <div class="main-wrapper">
        
        <div class="energy-card boundary-container" :class="energyClass" ref="boundaryRef">
          
          <div class="mascot-floater" :style="mascotDynamicStyle" @click="toggleBubble">
            <div class="advice-bubble" v-if="!isChatOpen">
              <span v-if="isThinking" style="display: flex; align-items: center; gap: 5px;">Analizando tu biometría... <ion-spinner name="dots" style="width: 15px; height: 15px;"></ion-spinner></span>
              <span v-else>{{ currentAdvice }}</span>
            </div>
            
            <img v-if="imageLoaded" :src="currentMascotImage" class="mascot-img-live" @error="handleImageError" />
            <div v-else class="emoji-fallback" style="font-size: 30px; color: #4FD1C5;"><ion-icon :icon="currentEmoji"></ion-icon></div>
          </div>

          <div class="card-content content-layer">
            <span class="energy-label">Batería Mental</span>
            <p class="quote-text">"{{ currentQuote }}"</p>

            <div class="slider-wrapper">
              <ion-range :min="0" :max="100" v-model="energyLevel" @ionChange="handleSliderChange" class="premium-range"></ion-range>
              <div class="slider-labels"><span>Agotado</span><span>Al 100%</span></div>
            </div>

            <div class="card-footer">
              <div class="stat-pill"><ion-icon :icon="flash"></ion-icon> {{ energyLevel }}%</div>
              <div class="calib-btn" @click="setDiagOpen(true)"><ion-icon :icon="pulseOutline"></ion-icon></div>
            </div>
          </div>
        </div>

        <div class="tasks-header">
          <h3>Tu Plan de Hoy</h3>
          <div style="display: flex; align-items: center; gap: 8px;">
            <transition name="fade-sos">
              <div 
                v-if="survivalMode"
                class="sos-button sos-active" 
                style="cursor: default; pointer-events: none;"
              >
                <span>🔴 SOS Activo</span>
              </div>
            </transition>
            <div class="mode-tag" :class="energyTextClass">{{ modeName }}</div>
          </div>
        </div>

        <transition-group name="task-list" tag="div" class="tasks-list">
          <ion-item-sliding v-for="task in filteredTasks" :key="task.id" class="task-slide-item">
            
            <ion-item class="task-item-premium" :class="{ 'mission-card': task.difficulty === 0 }" lines="none">
              
              <div class="difficulty-dot" :class="getDifficultyColor(task.difficulty)"></div>
              
              <div class="task-info" @click="openPomodoro(task)" style="cursor: pointer;">
                <div class="title-row">
                  <h4>{{ task.title }}</h4>
                  <ion-icon v-if="task.source === 'teams'" :icon="logoMicrosoft" class="source-icon teams-color"></ion-icon>
                  <ion-icon v-if="task.source === 'classroom'" :icon="logoGoogle" class="source-icon google-color"></ion-icon>
                </div>
                <p style="display: flex; align-items: center; gap: 4px; margin-top: 4px;">
                  {{ task.materia }} • 
                  <ion-icon :icon="getDifficultyIcon(task.difficulty)" :style="{ color: getDifficultyIconColor(task.difficulty) }"></ion-icon> 
                  {{ task.difficultyLabel }}
                </p>
              </div>

              <div class="task-action" style="display: flex; gap: 10px; align-items: center;">
                <div v-if="task.difficulty === 3" class="magic-btn" @click.stop="magicBreakdown(task)">
                  <ion-icon :icon="sparkles" class="magic-icon"></ion-icon>
                </div>
                <div class="checkbox-circle" @click.stop="completeTask(task)">
                  <ion-icon v-if="task.difficulty === 0" :icon="star" class="star-icon"></ion-icon>
                </div>
              </div>
            </ion-item>

            <ion-item-options side="end">
              <ion-item-option color="danger" @click="deleteTask(task.id)">
                <ion-icon :icon="trashOutline" slot="icon-only"></ion-icon>
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>

          <div v-if="filteredTasks.length === 0" key="empty" class="empty-premium">
            <div class="empty-icon-wrapper">
              <ion-icon :icon="leafOutline"></ion-icon>
            </div>
            <div v-if="allTasks.length === 0">
              <h4>¡Día libre de estrés!</h4>
              <p>Has alcanzado el equilibrio perfecto.<br>Tómate este tiempo para ti.</p>
            </div>
            <div v-else>
              <h4>Modo Protección Activo</h4>
              <p>Tareas difíciles ocultas por tu bienestar.</p>
            </div>
          </div>
        </transition-group>
      </div>

      <div class="floating-actions">
        <button class="fab-dump" @click="setDumpOpen(true)">
          <ion-icon :icon="createOutline"></ion-icon>
        </button>
        <button class="fab-zen" @click="setZenOpen(true)">
          <ion-icon :icon="leafOutline"></ion-icon>
        </button>
        <button class="fab-main" @click="setOpen(true)">+</button>
      </div>

      <ion-modal :is-open="isOpen" :initial-breakpoint="0.6" :breakpoints="[0, 0.6]" @didDismiss="setOpen(false)">
        <div class="modal-content ion-padding">
          <h3 style="display: flex; align-items: center; gap: 8px;"><ion-icon :icon="rocketOutline" color="primary"></ion-icon> Nueva Misión</h3>
          <div class="input-group">
            <label>Título</label>
            <ion-input v-model="newTask.title" placeholder="Ej. Leer Capítulo 1" class="custom-input"></ion-input>
          </div>
          <div class="input-group">
            <label>Materia</label>
            <ion-input v-model="newTask.materia" placeholder="Ej. Literatura" class="custom-input"></ion-input>
          </div>
          <div class="input-group">
            <label>Nivel de Desgaste</label>
            <div class="difficulty-selector">
              <div class="diff-option" :class="{ active: newTask.difficulty === 1 }" @click="newTask.difficulty = 1"><ion-icon :icon="leafOutline" style="color: #48BB78; margin-right: 5px;"></ion-icon> Bajo</div>
              <div class="diff-option" :class="{ active: newTask.difficulty === 2 }" @click="newTask.difficulty = 2"><ion-icon :icon="waterOutline" style="color: #4299E1; margin-right: 5px;"></ion-icon> Medio</div>
              <div class="diff-option" :class="{ active: newTask.difficulty === 3 }" @click="newTask.difficulty = 3"><ion-icon :icon="flameOutline" style="color: #F56565; margin-right: 5px;"></ion-icon> Alto</div>
            </div>
          </div>
          <ion-button expand="block" class="save-btn" @click="attemptAddTask">Guardar Tarea</ion-button>
        </div>
      </ion-modal>

      <ion-modal :is-open="isDiagOpen" :initial-breakpoint="0.95" :breakpoints="[0, 0.95, 1]" @didDismiss="setDiagOpen(false)">
        <div class="modal-content ion-padding">
          <h3 style="display: flex; align-items: center; gap: 8px;"><ion-icon :icon="pulseOutline" color="secondary"></ion-icon> Escáner de Bienestar</h3>
          <p class="modal-subtitle">6 factores clave para calibrar tu batería mental con precisión.</p>
          <div class="diag-question">
            <label>1. Sueño (Anoche)</label>
            <ion-segment v-model="diagSleep">
              <ion-segment-button value="bad"><ion-label>&lt;5h</ion-label></ion-segment-button>
              <ion-segment-button value="neutral"><ion-label>5-7h</ion-label></ion-segment-button>
              <ion-segment-button value="good"><ion-label>&gt;7h</ion-label></ion-segment-button>
            </ion-segment>
          </div>
          <div class="diag-question">
            <label>2. Alimentación de hoy</label>
            <ion-segment v-model="diagFood">
              <ion-segment-button value="bad"><ion-label>Salté/Mal</ion-label></ion-segment-button>
              <ion-segment-button value="neutral"><ion-label>Regular</ion-label></ion-segment-button>
              <ion-segment-button value="good"><ion-label>Sano</ion-label></ion-segment-button>
            </ion-segment>
          </div>
          <div class="diag-question">
            <label>3. Hidratación (Agua hoy)</label>
            <ion-segment v-model="diagHydration">
              <ion-segment-button value="bad"><ion-label>Poca</ion-label></ion-segment-button>
              <ion-segment-button value="neutral"><ion-label>Regular</ion-label></ion-segment-button>
              <ion-segment-button value="good"><ion-label>Suficiente</ion-label></ion-segment-button>
            </ion-segment>
          </div>
          <div class="diag-question">
            <label>4. Fatiga Visual / Pantallas</label>
            <ion-segment v-model="diagScreenTime">
              <ion-segment-button value="high"><ion-label>Excesivo</ion-label></ion-segment-button>
              <ion-segment-button value="neutral"><ion-label>Normal</ion-label></ion-segment-button>
              <ion-segment-button value="low"><ion-label>Poco</ion-label></ion-segment-button>
            </ion-segment>
          </div>
          <div class="diag-question">
            <label>5. Nivel de Ansiedad/Estrés</label>
            <ion-segment v-model="diagStress">
              <ion-segment-button value="high"><ion-label>Mucho</ion-label></ion-segment-button>
              <ion-segment-button value="neutral"><ion-label>Algo</ion-label></ion-segment-button>
              <ion-segment-button value="low"><ion-label>Poco</ion-label></ion-segment-button>
            </ion-segment>
          </div>
          <div class="diag-question">
            <label>6. Sobrecarga Cognitiva</label>
            <ion-segment v-model="diagCognitive">
              <ion-segment-button value="yes"><ion-label>Saturado</ion-label></ion-segment-button>
              <ion-segment-button value="little"><ion-label>Regular</ion-label></ion-segment-button>
              <ion-segment-button value="no"><ion-label>Fresco</ion-label></ion-segment-button>
            </ion-segment>
          </div>
          <ion-button expand="block" class="calc-btn" @click="calculateRealEnergy">Calcular Energía Exacta</ion-button>
        </div>
      </ion-modal>

      <ion-modal :is-open="isChatOpen" :initial-breakpoint="0.85" :breakpoints="[0, 0.85, 1]" @didDismiss="setChatOpen(false)">
        <div class="chat-modal">
          <div class="chat-header">
            <div class="chat-avatar"><img src="/axel_alto.png" alt="Axel" /></div>
            <div class="chat-title-info">
              <h3>Axel IA</h3>
              <p style="display: flex; align-items: center; gap: 5px;">Tu Mini-Psicólogo Digital <ion-icon :icon="hardwareChipOutline"></ion-icon></p>
            </div>
            <ion-icon :icon="closeOutline" class="close-chat" @click="setChatOpen(false)"></ion-icon>
          </div>

          <div class="chat-messages" id="chat-container">
            <div v-for="(msg, index) in chatMessages" :key="index" class="message-wrapper" :class="msg.role === 'user' ? 'msg-user' : 'msg-axel'">
              <div class="message-bubble">{{ msg.text }}</div>
            </div>
            <div v-if="isAxelTyping" class="message-wrapper msg-axel">
              <div class="message-bubble typing-indicator"><span></span><span></span><span></span></div>
            </div>
          </div>

          <div class="chat-input-area">
            <input type="text" v-model="newChatMessage" placeholder="Cuéntame, ¿qué te estresa hoy?..." @keyup.enter="sendChatMessage" />
            <button class="send-btn" @click="sendChatMessage" :disabled="!newChatMessage.trim() || isAxelTyping">
              <ion-icon :icon="sendOutline"></ion-icon>
            </button>
          </div>
        </div>
      </ion-modal>

      <ion-modal :is-open="isZenOpen" :initial-breakpoint="0.95" :breakpoints="[0, 0.95, 1]" @didDismiss="setZenOpen(false)">
        <div class="zen-modal-content">
          <div class="zen-header">
            <button class="btn-music" @click="toggleMusic" :class="{ 'music-active': isMusicPlaying }">
              <ion-icon :icon="isMusicPlaying ? volumeHighOutline : volumeMuteOutline"></ion-icon>
            </button>
            <ion-icon :icon="closeOutline" class="close-zen" @click="setZenOpen(false)"></ion-icon>
          </div>

          <div class="zen-body">
            <h2 class="zen-title">Respiración 4-7-8</h2>
            <p class="zen-subtitle">Sigue el círculo para calmar tu sistema nervioso.</p>

            <div class="breathing-container">
              <div class="breathing-circle" :class="circleAnimationClass">
                <span class="breathing-text">{{ breathingText }}</span>
              </div>
            </div>

            <div class="zen-controls">
              <button v-if="!isBreathing" class="btn-zen-start" @click="startBreathing">Comenzar</button>
              <button v-else class="btn-zen-stop" @click="stopBreathing">Detener</button>
            </div>
            
            <div class="zen-tip">
              <ion-icon :icon="bulbOutline"></ion-icon>
              <span>Esta técnica reduce el cortisol y frena ataques de ansiedad en minutos.</span>
            </div>
          </div>

          <audio ref="audioRef" loop>
            <source src="https://actions.google.com/sounds/v1/weather/rain_on_roof.ogg" type="audio/ogg">
          </audio>
        </div>
      </ion-modal>

      <!-- DIARIO DE DESCARGA EXPRÉS -->
      <ion-modal :is-open="isDumpOpen" :initial-breakpoint="0.8" :breakpoints="[0, 0.8]" @didDismiss="setDumpOpen(false)">
        <div class="modal-content ion-padding">
          <h3 style="display: flex; align-items: center; gap: 8px;"><ion-icon :icon="hardwareChipOutline" color="primary"></ion-icon> Diario de Descarga</h3>
          <p class="modal-subtitle">Escribe todo lo que te abruma. Separaremos las tareas por ti.</p>
          <ion-textarea 
            v-model="dumpText" 
            placeholder="Ej. tengo que leer historia y mandar un correo a mi profesor..." 
            class="custom-textarea"
            :rows="6"
          ></ion-textarea>
          <ion-button expand="block" class="save-btn" @click="processBrainDump" :disabled="isThinkingDump">
            <span v-if="!isThinkingDump" style="display: flex; align-items: center; gap: 5px;"><ion-icon :icon="sparkles"></ion-icon> Extraer Tareas</span>
            <ion-spinner v-else name="dots"></ion-spinner>
          </ion-button>
        </div>
      </ion-modal>

      <!-- POMODORO EMPÁTICO (Glassmorphism) -->
      <ion-modal :is-open="isPomodoroOpen" :initial-breakpoint="0.95" :breakpoints="[0, 0.95, 1]" @didDismiss="closePomodoro" class="glass-modal-container">
        <div class="glass-content ion-padding">
          <div class="glass-header">
            <h3>{{ pomodoroTask?.title }}</h3>
            <p>{{ pomodoroMessage }}</p>
          </div>
          
          <div class="pomodoro-circle-glass" :class="{'running': isPomodoroRunning}">
            {{ formattedPomodoroTime }}
          </div>
          
          <div class="pomodoro-controls-glass">
            <button class="btn-glass" @click="adjustPomodoro(-5)">-5m</button>
            <button class="btn-glass" @click="adjustPomodoro(5)">+5m</button>
          </div>
          
          <button class="btn-glass-primary" @click="togglePomodoro">
            {{ isPomodoroRunning ? 'Pausar' : 'Iniciar Enfoque Profundo' }}
          </button>
        </div>
      </ion-modal>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { getUserDataFromDb, updateUserDataInDb, getUserTasksFromDb, saveTaskToDb, deleteTaskFromDb } from '../services/firebase';
import { startAxelChatSession } from '../services/ai';
import { 
  IonPage, IonContent, IonRange, IonItem, IonItemSliding, IonItemOptions, IonItemOption, 
  IonIcon, IonModal, IonInput, IonButton, IonSegment, IonSegmentButton, IonLabel,
  IonToggle, IonTextarea, IonSpinner, toastController, alertController 
} from '@ionic/vue';
import { useRouter } from 'vue-router';
import { 
  flash, trashOutline, pulseOutline, logoMicrosoft, logoGoogle, closeOutline, 
  sendOutline, leafOutline, bulbOutline, volumeHighOutline, volumeMuteOutline, star,
  sparkles, createOutline, timerOutline, rocketOutline, waterOutline, flameOutline,
  hardwareChipOutline, happyOutline, sadOutline, shieldCheckmarkOutline, warningOutline,
  giftOutline, heartOutline
} from 'ionicons/icons';

const router = useRouter();

// --- ESTADO Y PERSISTENCIA ---
const energyLevel = ref(50);
const balanceStreak = ref(0);
interface Task { id: number; title: string; materia: string; difficulty: number; difficultyLabel: string; source?: 'manual' | 'teams' | 'classroom'; }
const allTasks = ref<Task[]>([]);
const isThinking = ref(false);
const thinkingTimer = ref<any>(null);
const imageLoaded = ref(true);

// --- VARIABLES DE MODALS Y DIAGNÓSTICO ---
const isOpen = ref(false);
const isDiagOpen = ref(false);
const newTask = ref({ title: '', materia: '', difficulty: 2 });

// --- NUEVAS FUNCIONALIDADES ---
const survivalMode = ref(false);
const isDumpOpen = ref(false);
const dumpText = ref('');
const isThinkingDump = ref(false);

const isPomodoroOpen = ref(false);
const pomodoroTask = ref<Task | null>(null);
const pomodoroTimeLeft = ref(25 * 60);
const isPomodoroRunning = ref(false);
let pomodoroInterval: any = null;
const consecutiveTasksWithoutBreak = ref(0);

const diagSleep = ref('neutral');
const diagFood = ref('neutral');
const diagStress = ref('neutral');
const diagCognitive = ref('little');
const diagHydration = ref('neutral');
const diagScreenTime = ref('neutral');

// --- BÓVEDA DE MISIONES DE AUTOCUIDADO (GAMIFICACIÓN) ---
const selfCareMissions = [
  "Beber 1 vaso de agua fresca",
  "Estiramiento de cuello y hombros por 1 min",
  "Escuchar tu canción favorita a todo volumen",
  "Cerrar los ojos y respirar profundo por 1 minuto",
  "Dar una caminata corta de 5 minutos",
  "Comer un snack saludable o una fruta",
  "Escribir 3 cosas por las que estás agradecido hoy",
  "Lavar tu cara con agua fría",
  "Ver un video que te dé mucha risa",
  "Despegar la vista de la pantalla por 2 minutos",
  "Hacer 5 respiraciones profundas (Técnica 4-7-8)",
  "Acariciar a tu mascota (o ver videos de perritos)"
];

// --- VIDA ARTIFICIAL (MOVIMIENTO AXEL) ---
const mascotX = ref(0);
const mascotY = ref(0);
let movementInterval: any = null;
const boundaryRef = ref<HTMLElement | null>(null);

const todayDate = computed(() => new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }));

onMounted(async () => {
  const userId = localStorage.getItem('mindSyncUserId') || 'mock-user-123';
  
  const userData = await getUserDataFromDb(userId);
  energyLevel.value = userData.energyLevel ?? 50;
  balanceStreak.value = userData.balanceStreak ?? 0;
  
  const tasks = await getUserTasksFromDb(userId);
  if (tasks && tasks.length > 0) {
    // Limpiar emojis legacy que ya estaban guardados en la base de datos local
    tasks.forEach((t: any) => {
      if (t.title) t.title = t.title.replace(/[🔥🍃💧✨🧠🚀🩺🛡️🎁💧🧘🎵🌬️🚶🍎📝🧊😂👀🐶]/g, '').trim();
      if (t.difficultyLabel) t.difficultyLabel = t.difficultyLabel.replace(/[🔥🍃💧✨🧠🚀🩺🛡️🎁]/g, '').trim();
    });
    allTasks.value = tasks;
  } else {
    allTasks.value = [{ id: 1, title: 'Terminar memoria técnica', materia: 'Taller II', difficulty: 3, difficultyLabel: 'Difícil', source: 'manual' }];
  }

  setTimeout(() => {
    moveMascotRandomly();
    movementInterval = setInterval(moveMascotRandomly, 5000);
  }, 1000);

  // Initialize AI chat session
  axelChatSession = startAxelChatSession();
});

onUnmounted(() => { if (movementInterval) clearInterval(movementInterval); });

// --- LÓGICA DE MONITOREO Y GUARDADO ---
const saveData = async () => {
  const userId = localStorage.getItem('mindSyncUserId') || 'mock-user-123';
  await updateUserDataInDb(userId, { energyLevel: energyLevel.value, balanceStreak: balanceStreak.value });
  
  // Backup local opcional para fluidez visual
  localStorage.setItem('mindSyncEnergy', energyLevel.value.toString());
  localStorage.setItem('mindSyncTasks', JSON.stringify(allTasks.value));
  
  if (energyLevel.value <= 10) {
    setTimeout(() => { router.push('/sos?forced=true'); }, 200);
  }
};

watch([energyLevel, allTasks], saveData, { deep: true });

// --- INYECCIÓN DE MISIONES DE AUTOCUIDADO ---
watch(energyLevel, async (newLevel, oldLevel) => {
  if (newLevel <= 40 && oldLevel > 40) {
    const hasSelfCare = allTasks.value.some(t => t.difficulty === 0);
    if (!hasSelfCare) {
      const randomMission = selfCareMissions[Math.floor(Math.random() * selfCareMissions.length)];
      allTasks.value.unshift({ 
        id: Date.now(), title: randomMission, materia: 'Axel te Cuida', 
        difficulty: 0, difficultyLabel: 'Recuperación', source: 'manual' 
      });

      const toast = await toastController.create({
        message: 'Axel ha detectado fatiga y te asignó una misión especial.',
        icon: giftOutline,
        duration: 3000, color: 'tertiary'
      });
      await toast.present();
    }
  }
});

// --- GESTIÓN VISUAL DE LA MASCOTA ---
const currentMascotImage = computed(() => {
  if (energyLevel.value > 70) return '/axel_alto.png';
  if (energyLevel.value > 30) return '/axel_medio.png';
  return '/axel_bajo.png';
});
watch(currentMascotImage, () => { imageLoaded.value = true; });
const handleImageError = () => { imageLoaded.value = false; };
const currentEmoji = computed(() => (energyLevel.value > 70 ? flash : energyLevel.value > 30 ? happyOutline : sadOutline));

const currentAdvice = computed(() => {
  if (energyLevel.value > 80) return "Tu enfoque está al máximo. ¡Aprovecha!";
  if (energyLevel.value > 50) return "Buen ritmo. Recuerda tomar agua.";
  if (energyLevel.value > 20) return "Tu energía baja. Tómate 5 minutos.";
  return "Nivel crítico. Necesitas descansar ya.";
});

const currentQuote = computed(() => {
  if (energyLevel.value > 70) return "Hoy eres imparable.";
  if (energyLevel.value > 30) return "Mantén el equilibrio. No te satures.";
  return "Tu mente es tu mayor activo.";
});

const moveMascotRandomly = () => {
  if (!boundaryRef.value) return;
  const rect = boundaryRef.value.getBoundingClientRect();
  const pad = 30;
  const maxX = rect.width - 120 - pad; 
  const maxY = rect.height - 120 - pad; 
  mascotX.value = Math.max(pad, Math.random() * maxX);
  mascotY.value = Math.max(pad, Math.random() * maxY);
};
const mascotDynamicStyle = computed(() => ({ transform: `translate(${mascotX.value}px, ${mascotY.value}px)`, transition: 'transform 4s ease-in-out' }));

// --- CHATBOT IA ---
const isChatOpen = ref(false);
const newChatMessage = ref('');
const isAxelTyping = ref(false);
let axelChatSession: any = null;

const setChatOpen = (state: boolean) => { isChatOpen.value = state; };
const toggleBubble = () => { setChatOpen(true); };

const chatMessages = ref([{ role: 'axel', text: '¡Hola! Soy Axel. Mi programación está enfocada en ayudarte con el estrés. ¿Qué hay en tu mente hoy?' }]);

const sendChatMessage = async () => {
  if (!newChatMessage.value.trim() || isAxelTyping.value) return;
  
  const userText = newChatMessage.value;
  chatMessages.value.push({ role: 'user', text: userText });
  newChatMessage.value = '';
  isAxelTyping.value = true;
  
  // Desplazar hacia abajo
  setTimeout(() => {
    const container = document.getElementById('chat-container');
    if (container) container.scrollTop = container.scrollHeight;
  }, 50);
  
  try {
    if (!axelChatSession) {
      axelChatSession = startAxelChatSession();
    }
    
    // Provide a small hint of current context to Axel without showing it in the chat
    const contextInfo = `[Nivel de Energía del Usuario: ${energyLevel.value}%] `;
    const finalMessage = contextInfo + userText;
    
    const result = await axelChatSession.sendMessage(finalMessage);
    const responseText = result.response.text();
    
    chatMessages.value.push({ role: 'axel', text: responseText });
  } catch (error) {
    console.error("Error communicating with Axel AI:", error);
    chatMessages.value.push({ 
      role: 'axel', 
      text: 'Lo siento, estoy teniendo problemas de conexión con mi módulo de IA. ¿Tienes configurada la API Key?' 
    });
  } finally {
    isAxelTyping.value = false;
    setTimeout(() => {
      const container = document.getElementById('chat-container');
      if (container) container.scrollTop = container.scrollHeight;
    }, 50);
  }
};

// --- BOTIQUÍN ZEN ---
const isZenOpen = ref(false);
const isBreathing = ref(false);
const breathingText = ref('Presiona Comenzar');
const circleAnimationClass = ref('');
const audioRef = ref<HTMLAudioElement | null>(null);
const isMusicPlaying = ref(false);

const toggleMusic = () => {
  if (!audioRef.value) return;
  if (isMusicPlaying.value) { audioRef.value.pause(); isMusicPlaying.value = false; }
  else { audioRef.value.volume = 0.4; audioRef.value.play(); isMusicPlaying.value = true; }
};

const setZenOpen = (state: boolean) => { 
  isZenOpen.value = state; 
  if (!state) { stopBreathing(); if (audioRef.value) { audioRef.value.pause(); isMusicPlaying.value = false; } }
};

const startBreathing = async () => {
  isBreathing.value = true;
  while (isBreathing.value) {
    breathingText.value = 'Inhala...'; circleAnimationClass.value = 'anim-inhale';
    await new Promise(r => setTimeout(r, 4000)); if (!isBreathing.value) break; 
    breathingText.value = 'Sostén...'; circleAnimationClass.value = 'anim-hold';
    await new Promise(r => setTimeout(r, 7000)); if (!isBreathing.value) break;
    breathingText.value = 'Exhala...'; circleAnimationClass.value = 'anim-exhale';
    await new Promise(r => setTimeout(r, 8000));
  }
};
const stopBreathing = () => { isBreathing.value = false; breathingText.value = 'Presiona Comenzar'; circleAnimationClass.value = ''; };

// --- GESTIÓN DE TAREAS ---
const handleSliderChange = () => { 
  isThinking.value = true; saveData(); 
  if (thinkingTimer.value) clearTimeout(thinkingTimer.value); 
  thinkingTimer.value = setTimeout(() => { isThinking.value = false; }, 1000); 
};

const attemptAddTask = async () => {
  if (!newTask.value.title) return;
  if (energyLevel.value < 30 && newTask.value.difficulty === 3) {
    const alert = await alertController.create({ 
      header: 'Axel te protege', message: 'Muy cansado para esto. ¿Seguro?', 
      buttons: [{ text: 'Descansar', role: 'cancel' }, { text: 'Agregar', handler: () => addTaskLogic() }]
    });
    await alert.present();
  } else { addTaskLogic(); }
};

const addTaskLogic = async () => {
  let label = 'Medio';
  if (newTask.value.difficulty === 3) label = 'Difícil';
  if (newTask.value.difficulty === 1) label = 'Fácil';
  
  const newTaskObj = { id: Date.now(), title: newTask.value.title, materia: newTask.value.materia || 'General', difficulty: newTask.value.difficulty, difficultyLabel: label, source: 'manual' as const };
  allTasks.value.push(newTaskObj);
  newTask.value = { title: '', materia: '', difficulty: 2 }; setOpen(false);
  
  const userId = localStorage.getItem('mindSyncUserId') || 'mock-user-123';
  await saveTaskToDb(userId, newTaskObj);
};

const completeTask = async (task: Task) => {
  if (task.difficulty === 0) {
    let newEnergy = energyLevel.value + 15;
    if (newEnergy > 100) newEnergy = 100;
    energyLevel.value = newEnergy;
    consecutiveTasksWithoutBreak.value = 0; // Se tomó un descanso
    
    let streakMessage = '¡Energía recuperada! +15%';

    if (task.materia === 'Reconexión') {
      const prevStreak = parseInt(localStorage.getItem('mindSyncPreviousStreak') || '1');
      balanceStreak.value = prevStreak + 1; // Restaura la anterior + la de hoy
      localStorage.setItem('mindSyncStreak', balanceStreak.value.toString());
      localStorage.removeItem('mindSyncPreviousStreak'); // Limpia
      streakMessage = `¡Racha de ${prevStreak} días restaurada y aumentada!`;
    }

    setTimeout(async () => { 
      allTasks.value = allTasks.value.filter(t => t.id !== task.id); 
      await deleteTaskFromDb(task.id);
    }, 300);
    const toast = await toastController.create({ message: `${streakMessage}`, icon: sparkles, duration: 3500, color: 'success' }); 
    await toast.present();
  } else {
    let cost = task.difficulty === 3 ? 15 : task.difficulty === 2 ? 10 : 5;
    let newEnergy = energyLevel.value - cost;
    if (newEnergy < 0) newEnergy = 0;
    energyLevel.value = newEnergy;
    
    consecutiveTasksWithoutBreak.value++;
    setTimeout(async () => { 
      allTasks.value = allTasks.value.filter(t => t.id !== task.id); 
      await deleteTaskFromDb(task.id);
    }, 300);
    
    // REFLEXIÓN COSTO REAL VS PERCIBIDO
    if (task.difficulty === 3) {
      setTimeout(() => triggerReflection(), 400);
    }
    
    if (consecutiveTasksWithoutBreak.value >= 3) {
      consecutiveTasksWithoutBreak.value = 0;
      setTimeout(triggerRescueDrop, task.difficulty === 3 ? 3000 : 1000);
    } else if (task.difficulty !== 3) {
      const toast = await toastController.create({ message: `¡Hecho! Energía -${cost}%`, duration: 2000, color: 'dark' }); 
      await toast.present();
    }
  }
};

const deleteTask = async (id: number) => { 
  allTasks.value = allTasks.value.filter(t => t.id !== id); 
  await deleteTaskFromDb(id);
};

const filteredTasks = computed(() => {
  if (survivalMode.value) {
    return allTasks.value.filter(t => t.difficulty === 1 || t.difficulty === 0).slice(0, 3);
  }
  if (energyLevel.value > 70) return allTasks.value;
  if (energyLevel.value > 30) return allTasks.value.filter(t => t.difficulty < 3 || t.difficulty === 0);
  return allTasks.value.filter(t => t.difficulty === 1 || t.difficulty === 0);
});

watch(energyLevel, (newVal) => {
  if (newVal <= 20) survivalMode.value = true;
  else if (newVal > 40) survivalMode.value = false;
});

const calculateRealEnergy = async () => {
  isThinking.value = true;
  
  // Algoritmo de cálculo más preciso
  let baseScore = 100;
  const sleepPenalty = diagSleep.value === 'bad' ? 30 : diagSleep.value === 'neutral' ? 12 : 0;
  const foodPenalty = diagFood.value === 'bad' ? 16 : diagFood.value === 'neutral' ? 8 : 0;
  const hydrationPenalty = diagHydration.value === 'bad' ? 12 : diagHydration.value === 'neutral' ? 5 : 0;
  const screenPenalty = diagScreenTime.value === 'high' ? 12 : diagScreenTime.value === 'neutral' ? 5 : 0;
  const stressPenalty = diagStress.value === 'high' ? 18 : diagStress.value === 'neutral' ? 8 : 0;
  const cognitivePenalty = diagCognitive.value === 'yes' ? 16 : diagCognitive.value === 'little' ? 8 : 0;

  let score = baseScore - sleepPenalty - foodPenalty - hydrationPenalty - screenPenalty - stressPenalty - cognitivePenalty;

  // Factor de arrastre (suavizar el cambio basándonos en la energía previa)
  score = Math.floor((score * 0.8) + (energyLevel.value * 0.2));

  // Límite inferior y superior
  if (score < 5) score = 5;
  if (score > 100) score = 100;

  // LÓGICA DE RACHA DE BIENESTAR (MÁXIMO +1 POR DÍA AL USAR EL ESCÁNER)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toDateString();
  const lastStreakDateStr = localStorage.getItem('mindSyncLastStreakDate');
  
  let streakMessage = '';
  
  if (lastStreakDateStr !== todayStr) {
    if (lastStreakDateStr) {
      const lastDate = new Date(lastStreakDateStr);
      const diffTime = Math.abs(today.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays > 1) {
        const lostStreak = balanceStreak.value;
        localStorage.setItem('mindSyncPreviousStreak', lostStreak.toString());
        
        balanceStreak.value = 1; // Rompió la racha
        streakMessage = '¡Nueva racha de escáner iniciada!';
        
        if (lostStreak > 2) {
           setTimeout(() => offerStreakRecovery(lostStreak), 3500);
        }
      } else {
        balanceStreak.value++; // Racha continua
        streakMessage = `¡Racha aumentada a ${balanceStreak.value}!`;
        score += 2; // Pequeño bono de energía por mantener la racha
        if (score > 100) score = 100;
      }
    } else {
      balanceStreak.value = 1; // Primera vez
      streakMessage = '¡Primera calibración! Racha iniciada';
    }
    
    localStorage.setItem('mindSyncStreak', balanceStreak.value.toString());
    localStorage.setItem('mindSyncLastStreakDate', todayStr);
    
    setTimeout(async () => {
      const toast = await toastController.create({ message: `${streakMessage}`, icon: sparkles, duration: 3500, color: 'success' }); 
      await toast.present();
    }, 1500);
  } else {
    setTimeout(async () => {
      const toast = await toastController.create({ message: 'Escáner preciso. (Racha de hoy asegurada)', icon: shieldCheckmarkOutline, duration: 2500, color: 'medium' }); 
      await toast.present();
    }, 1500);
  }

  setTimeout(() => { energyLevel.value = score; isThinking.value = false; setDiagOpen(false); }, 1200);
};

// --- FUNCIONES NUEVAS ---
const offerStreakRecovery = async (lostStreak: number) => {
  const alert = await alertController.create({
    header: 'Racha Interrumpida',
    message: `Axel notó que perdiste tu racha de ${lostStreak} días. La salud mental no es un camino perfecto. ¿Quieres realizar una Misión Comodín para restaurarla?`,
    buttons: [
      { text: 'Dejarla ir', role: 'cancel' },
      { 
        text: '¡Restaurar Racha!', 
        handler: () => {
          allTasks.value.unshift({ 
            id: Date.now(), title: `Comodín: Escribe 3 cosas que agradeces hoy`, materia: 'Reconexión', 
            difficulty: 0, difficultyLabel: 'Comodín', source: 'manual' 
          });
        }
      }
    ]
  });
  await alert.present();
};

const triggerRescueDrop = async () => {
  const randomMission = selfCareMissions[Math.floor(Math.random() * selfCareMissions.length)];
  allTasks.value.unshift({ 
    id: Date.now(), title: `¡Misión Relámpago! ${randomMission}`, materia: 'Axel te Cuida', 
    difficulty: 0, difficultyLabel: 'Rescate', source: 'manual' 
  });
  if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  const toast = await toastController.create({
    message: '¡Has trabajado mucho! Tómate una pausa obligatoria.',
    icon: warningOutline,
    duration: 4000, color: 'warning', position: 'top'
  });
  await toast.present();
};

const magicBreakdown = async (task: Task) => {
  const alert = await alertController.create({
    header: 'Desglose Mágico',
    message: '¿Quieres que Axel divida esta tarea pesada en pasos más simples?',
    buttons: [
      { text: 'No', role: 'cancel' },
      { text: 'Sí, por favor', handler: () => {
        const idx = allTasks.value.findIndex(t => t.id === task.id);
        if (idx > -1) {
          allTasks.value.splice(idx, 1);
          allTasks.value.unshift(
            { id: Date.now()+2, title: `[Paso 3] Repaso final de ${task.title.substring(0,10)}...`, materia: task.materia, difficulty: 1, difficultyLabel: 'Fácil', source: 'manual' },
            { id: Date.now()+1, title: `[Paso 2] Desarrollo de ${task.title.substring(0,10)}...`, materia: task.materia, difficulty: 2, difficultyLabel: 'Medio', source: 'manual' },
            { id: Date.now(), title: `[Paso 1] Buscar info para ${task.title.substring(0,10)}...`, materia: task.materia, difficulty: 1, difficultyLabel: 'Fácil', source: 'manual' }
          );
        }
      }}
    ]
  });
  await alert.present();
};

const setDumpOpen = (state: boolean) => isDumpOpen.value = state;
const processBrainDump = () => {
  if (!dumpText.value.trim()) return;
  isThinkingDump.value = true;
  setTimeout(() => {
    const lines = dumpText.value.split(/[,y\n]+/).map(t => t.trim()).filter(t => t.length > 3);
    lines.forEach((line, i) => {
      allTasks.value.push({
        id: Date.now() + i, title: line.charAt(0).toUpperCase() + line.slice(1), 
        materia: 'Descarga', difficulty: 1, difficultyLabel: 'Fácil', source: 'manual'
      });
    });
    dumpText.value = '';
    isThinkingDump.value = false;
    isDumpOpen.value = false;
  }, 1500);
};

const openPomodoro = async (task: Task) => {
  if (task.difficulty === 0) return;
  
  // PROTECTOR NOCTURNO (Cronotipo)
  const currentHour = new Date().getHours();
  if (task.difficulty === 3 && energyLevel.value <= 40 && currentHour >= 22) { // 10 PM
    const alert = await alertController.create({
      header: 'Protector Nocturno',
      message: 'Son más de las 10 PM y tu batería está baja. Tu cerebro ya no retendrá información compleja. Axel te sugiere dormir y atacar esto mañana.',
      buttons: [
        { text: 'Hacer caso a Axel', role: 'cancel' },
        { text: 'Forzar Estudio', handler: () => { openPomodoroModal(task); } }
      ]
    });
    await alert.present();
  } else {
    openPomodoroModal(task);
  }
};

const openPomodoroModal = (task: Task) => {
  pomodoroTask.value = task;
  pomodoroTimeLeft.value = energyLevel.value > 50 ? 25 * 60 : 15 * 60;
  isPomodoroOpen.value = true;
};

const closePomodoro = () => {
  isPomodoroOpen.value = false;
  if (pomodoroInterval) clearInterval(pomodoroInterval);
  isPomodoroRunning.value = false;
};
const adjustPomodoro = (mins: number) => {
  let newTime = pomodoroTimeLeft.value + (mins * 60);
  if (newTime < 60) newTime = 60;
  pomodoroTimeLeft.value = newTime;
};
const togglePomodoro = () => {
  if (isPomodoroRunning.value) {
    clearInterval(pomodoroInterval);
    isPomodoroRunning.value = false;
  } else {
    isPomodoroRunning.value = true;
    pomodoroInterval = setInterval(() => {
      if (pomodoroTimeLeft.value > 0) {
        pomodoroTimeLeft.value--;
      } else {
        handlePomodoroFinish();
      }
    }, 1000);
  }
};

const handlePomodoroFinish = async () => {
  clearInterval(pomodoroInterval);
  isPomodoroRunning.value = false;
  
  if (pomodoroTask.value && pomodoroTask.value.difficulty === 3) {
    await triggerReflection();
  }
  
  closePomodoro();
};

const triggerReflection = async () => {
  const alert = await alertController.create({
    header: 'Misión Superada',
    message: 'Terminaste esta tarea "Difícil". Del 1 al 10, ¿qué tan pesada fue realmente?',
    inputs: [{ name: 'score', type: 'number', min: 1, max: 10, value: 5 }],
    buttons: [
      { 
        text: 'Evaluar', 
        handler: (data) => {
          const score = parseInt(data.score);
          let msg = score <= 6 ? `¡Le diste un ${score}! La ansiedad te hizo creer que era peor. Eres capaz de más de lo que crees.` : 'Fue dura, pero lo lograste. Mereces un descanso real.';
          setTimeout(async () => {
            const toast = await toastController.create({ message: msg, duration: 4500, color: 'tertiary', position: 'middle' });
            await toast.present();
          }, 500);
        }
      }
    ]
  });
  await alert.present();
};
const formattedPomodoroTime = computed(() => {
  const m = Math.floor(pomodoroTimeLeft.value / 60);
  const s = pomodoroTimeLeft.value % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
});
const pomodoroMessage = computed(() => {
  if (energyLevel.value > 50) return "Ciclo completo de 25 mins. Tú puedes con esto.";
  return "Batería baja detectada. Sugiero un ciclo corto de 15 mins.";
});

// --- NAVEGACIÓN Y CLASES ---
const goToProfile = () => router.push('/profile');
const setOpen = (s: boolean) => isOpen.value = s;
const setDiagOpen = (s: boolean) => isDiagOpen.value = s;

const getDifficultyColor = (d: number) => {
  if (d === 3) return 'line-red';
  if (d === 2) return 'line-blue';
  if (d === 1) return 'line-green';
  return 'line-gold';
};
const getDifficultyIcon = (d: number) => {
  if (d === 3) return flameOutline;
  if (d === 2) return waterOutline;
  if (d === 1) return leafOutline;
  return shieldCheckmarkOutline;
};

const getDifficultyIconColor = (d: number) => {
  if (d === 3) return '#F56565';
  if (d === 2) return '#4299E1';
  if (d === 1) return '#48BB78';
  return '#D69E2E';
};

const energyClass = computed(() => (energyLevel.value > 70 ? 'bg-high' : energyLevel.value > 30 ? 'bg-med' : 'bg-low'));
const energyTextClass = computed(() => (energyLevel.value > 70 ? 'text-high' : energyLevel.value > 30 ? 'text-med' : 'text-low'));
const modeName = computed(() => (energyLevel.value > 70 ? 'Modo Productivo' : energyLevel.value > 30 ? 'Modo Balance' : 'Modo Ahorro'));
</script>

<style scoped>
/* APLICAMOS EL GRIS SUAVE DE FONDO A LA APP PARA CONTRASTE */
.app-bg { --background: #F4F7FE; }

/* GENERAL */
.header-container { padding: 20px 25px; display: flex; justify-content: space-between; align-items: center; max-width: 800px; margin: 0 auto; }
.date-badge { font-size: 11px; letter-spacing: 1.5px; color: #A0AEC0; font-weight: 700; text-transform: uppercase; display: flex; align-items: center; gap: 10px; }
.streak-badge { background: #E6FFFA; color: #319795; padding: 2px 8px; border-radius: 12px; font-weight: 800; letter-spacing: 0; }
h1 { font-size: 26px; font-weight: 700; color: #1A202C; margin: 5px 0; }
.profile-btn img { width: 45px; height: 45px; border-radius: 14px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); cursor: pointer;}

/* LIMITAR ANCHO EN PC */
.main-wrapper { padding: 0 20px 100px; }
.energy-card, .tasks-header, .tasks-list { max-width: 800px; margin-left: auto; margin-right: auto; }

/* PECERA DE AXEL */
.boundary-container { position: relative; overflow: hidden; min-height: 280px; border-radius: 30px; margin-bottom: 30px; box-shadow: 0 20px 40px -10px rgba(56, 178, 172, 0.4); }
.bg-high { background: linear-gradient(135deg, #38B2AC, #81E6D9); } 
.bg-med { background: linear-gradient(135deg, #4299E1, #90CDF4); } 
.bg-low { background: linear-gradient(135deg, #ED8936, #FBD38D); }

.mascot-floater { position: absolute; z-index: 1; cursor: pointer; }
.mascot-img-live { width: 120px; animation: gentle-bob 3s infinite alternate; }
@keyframes gentle-bob { from { transform: scale(1); } to { transform: scale(1.05) translateY(-5px); } }

.content-layer { position: relative; z-index: 10; padding: 25px; height: 100%; display: flex; flex-direction: column; justify-content: space-between; pointer-events: none; }
.premium-range, .calib-btn { pointer-events: auto; }
.energy-label { color: white; font-weight: 700; text-transform: uppercase; font-size: 11px; opacity: 0.9; }
.quote-text { color: white; font-style: italic; font-size: 14px; margin-top: 5px; opacity: 0.95; }
.slider-wrapper { margin-top: 80px; } 
.slider-labels { display: flex; justify-content: space-between; color: white; font-size: 11px; font-weight: 600; opacity: 0.9; margin-top: 5px; }
.premium-range { --knob-background: white; --bar-background: rgba(255,255,255,0.4); --bar-background-active: white; }
.card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 15px; }
.stat-pill { background: rgba(255,255,255,0.3); color: white; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 5px; }
.calib-btn { width: 40px; height: 40px; background: white; border-radius: 12px; display: flex; justify-content: center; align-items: center; color: #4A5568; font-size: 20px; cursor: pointer; }

.advice-bubble { background: white; padding: 10px 14px; border-radius: 14px; font-size: 11px; font-weight: 700; position: absolute; top: -40px; left: 50%; transform: translateX(-50%); white-space: nowrap; box-shadow: 0 5px 15px rgba(0,0,0,0.1); pointer-events: none; }

/* TAREAS - DISEÑO MEJORADO Y CONTRASTANTE */
.tasks-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.mode-tag { font-size: 10px; font-weight: 800; padding: 5px 10px; border-radius: 8px; background: white; }
.text-high { color: #319795; } .text-med { color: #3182CE; } .text-low { color: #DD6B20; }

.task-item-premium { 
  --background: #FFFFFF; 
  border-radius: 20px; 
  margin-bottom: 15px; 
  /* Aumentamos un poquito la sombra y el borde para que resalte del fondo gris */
  box-shadow: 0 4px 15px rgba(0,0,0,0.05); 
  padding: 10px 15px; 
  border: 1px solid #E2E8F0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.task-item-premium:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(0,0,0,0.08); }

.difficulty-dot { width: 12px; height: 12px; border-radius: 50%; margin-right: 18px; }
.line-red { background: #FC8181; } 
.line-blue { background: #63B3ED; } 
.line-green { background: #68D391; }
.line-gold { background: #F6E05E; box-shadow: 0 0 10px rgba(246, 224, 94, 0.8); }

.task-info h4 { margin: 0; font-size: 16px; font-weight: 600; color: #2D3748; }
.task-info p { margin: 4px 0 0; font-size: 12px; color: #A0AEC0; }
.task-action { margin-left: auto; }

/* Checkbox mejorado */
.checkbox-circle { width: 28px; height: 28px; border: 2px solid #E2E8F0; border-radius: 50%; display: flex; justify-content: center; align-items: center; transition: all 0.2s; cursor: pointer; }
.checkbox-circle:hover { border-color: #A0AEC0; }
.checkbox-circle:active { background: #4FD1C5; border-color: #4FD1C5; transform: scale(0.9); }

.title-row { display: flex; align-items: center; gap: 8px; }
.source-icon { font-size: 14px; }
.teams-color { color: #6264A7; }
.google-color { color: #0F9D58; }

/* ================= DISEÑO ESPECIAL: MISIONES DORADAS ================= */
.mission-card {
  --background: linear-gradient(135deg, #FFFEF5 0%, #FEFCBF 100%);
  border: 2px solid #F6E05E;
  box-shadow: 0 10px 25px -5px rgba(246, 224, 94, 0.4);
}
.mission-card h4 { color: #B7791F !important; font-weight: 800 !important; }
.mission-card p { color: #D69E2E !important; font-weight: 600; }
.mission-card .checkbox-circle { border-color: #D69E2E; background: rgba(255,255,255,0.7); }
.mission-card .checkbox-circle:active { background: #D69E2E; }
.star-icon { color: #D69E2E; font-size: 14px; }

/* MODALS Y FORMULARIOS */
.modal-content { height: 100%; background: white; }
.input-group { margin-bottom: 20px; }
.input-group label { display: block; font-size: 12px; font-weight: bold; color: #486581; margin-bottom: 8px; }
.custom-input { --background: #F0F4F8; --color: #2D3748; --padding-start: 15px; border-radius: 8px; }
.difficulty-selector { display: flex; gap: 10px; margin-top: 5px; }
.diff-option { flex: 1; padding: 12px; text-align: center; background: #F0F4F8; border-radius: 8px; font-weight: 600; color: #829AB1; cursor: pointer; transition: all 0.2s; }
.diff-option.active { background: white; color: #3182CE; border: 2px solid #3182CE; box-shadow: 0 4px 10px rgba(49, 130, 206, 0.15); }
.save-btn { margin-top: 30px; --background: #3182CE; --border-radius: 10px; font-weight: 700; }
.diag-question { margin-bottom: 25px; }
.diag-question label { font-size: 14px; font-weight: 700; color: #102A43; display: block; margin-bottom: 10px; }
.calc-btn { margin-top: 30px; --background: #38B2AC; --border-radius: 10px; font-weight: 700; }
.modal-subtitle { color: #627D98; margin-bottom: 20px; font-size: 14px; }
.empty-premium { text-align: center; margin-top: 40px; color: #A0AEC0; font-size: 14px; }
.icon-bg { font-size: 40px; margin-bottom: 10px; }

/* BOTONES FLOTANTES */
.floating-actions { position: fixed; bottom: 30px; right: 25px; display: flex; flex-direction: column; gap: 15px; z-index: 100; }
.fab-main { width: 60px; height: 60px; border-radius: 20px; background: #2D3748; color: white; font-size: 30px; border: none; box-shadow: 0 10px 25px rgba(45, 55, 72, 0.4); cursor: pointer; }
.fab-zen { width: 50px; height: 50px; border-radius: 50%; background: #E6FFFA; color: #319795; font-size: 24px; border: 2px solid #319795; display: flex; justify-content: center; align-items: center; align-self: flex-end; cursor: pointer; box-shadow: 0 10px 25px rgba(49, 151, 149, 0.3); }
.fab-dump { width: 50px; height: 50px; border-radius: 50%; background: #FFF5F5; color: #E53E3E; font-size: 24px; border: 2px solid #E53E3E; display: flex; justify-content: center; align-items: center; align-self: flex-end; cursor: pointer; box-shadow: 0 10px 25px rgba(229, 62, 62, 0.3); }
.fab-main:active, .fab-zen:active, .fab-dump:active { transform: scale(0.9); }

/* NUEVAS FUNCIONALIDADES */
.magic-btn { width: 28px; height: 28px; background: #FAF5FF; border: 2px solid #D6BCFA; border-radius: 50%; display: flex; justify-content: center; align-items: center; cursor: pointer; color: #9F7AEA; }
.magic-btn:active { background: #D6BCFA; color: white; transform: scale(0.9); }
.survival-toggle { --background: #E2E8F0; --background-checked: #FC8181; --handle-background-checked: white; font-weight: bold; font-size: 12px; }
.custom-textarea { --background: #F0F4F8; --color: #2D3748; --padding-start: 15px; --padding-top: 15px; border-radius: 12px; margin-bottom: 20px; font-size: 14px; }
.pomodoro-circle { width: 200px; height: 200px; border-radius: 50%; border: 8px solid #E2E8F0; display: flex; justify-content: center; align-items: center; font-size: 48px; font-weight: bold; color: #2D3748; margin-top: 30px; transition: border-color 0.3s; }
.pomodoro-circle.running { border-color: #4FD1C5; color: #319795; box-shadow: 0 0 30px rgba(79, 209, 197, 0.4); }

/* CHAT IA */
.chat-modal { display: flex; flex-direction: column; height: 100%; background: #F4F7FE; }
.chat-header { display: flex; align-items: center; padding: 20px; background: white; box-shadow: 0 4px 15px rgba(0,0,0,0.05); z-index: 10; }
.chat-avatar { width: 45px; height: 45px; background: #E6F7FF; border-radius: 50%; display: flex; justify-content: center; align-items: center; margin-right: 15px; }
.chat-avatar img { width: 35px; }
.chat-title-info h3 { margin: 0; font-size: 16px; font-weight: 700; color: #1A202C; }
.chat-title-info p { margin: 2px 0 0; font-size: 12px; color: #4FD1C5; font-weight: 600; }
.close-chat { margin-left: auto; font-size: 24px; color: #A0AEC0; cursor: pointer; }
.chat-messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 15px; }
.message-wrapper { display: flex; width: 100%; }
.msg-user { justify-content: flex-end; }
.msg-axel { justify-content: flex-start; }
.message-bubble { max-width: 80%; padding: 12px 18px; border-radius: 20px; font-size: 14px; line-height: 1.4; box-shadow: 0 2px 8px rgba(0,0,0,0.05); font-weight: 500; }
.msg-user .message-bubble { background: #4FD1C5; color: white; border-bottom-right-radius: 4px; }
.msg-axel .message-bubble { background: white; color: #2D3748; border-bottom-left-radius: 4px; border: 1px solid #EDF2F7; }
.chat-input-area { display: flex; align-items: center; padding: 15px 20px; background: white; border-top: 1px solid #EDF2F7; }
.chat-input-area input { flex: 1; padding: 12px 20px; border: none; background: #F4F7FE; color: #2D3748; border-radius: 20px; outline: none; font-size: 14px; }
.send-btn { background: #4FD1C5; color: white; border: none; width: 45px; height: 45px; border-radius: 50%; margin-left: 10px; display: flex; justify-content: center; align-items: center; font-size: 20px; cursor: pointer; }

/* BOTIQUÍN ZEN */
.zen-modal-content { height: 100%; display: flex; flex-direction: column; background: radial-gradient(circle at center, #2C5282 0%, #1A202C 100%); color: white; overflow-y: auto;}
.zen-header { padding: 25px; display: flex; justify-content: space-between; align-items: center; }
.btn-music { background: rgba(255,255,255,0.1); border-radius: 50%; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; color: white; border: 1px solid rgba(255,255,255,0.3); cursor: pointer; }
.btn-music.music-active { background: #4FD1C5; box-shadow: 0 0 15px #4FD1C5; }
.close-zen { font-size: 28px; color: rgba(255,255,255,0.7); cursor: pointer; margin-left: auto;}
.zen-body { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px 20px 40px; text-align: center; }
.zen-title { font-size: 28px; font-weight: 700; margin: 0; color: #E6FFFA; }
.zen-subtitle { font-size: 14px; color: #A0AEC0; margin-top: 10px; max-width: 250px; }
.breathing-container { margin: 30px 0; width: 220px; height: 220px; display: flex; justify-content: center; align-items: center; }
.breathing-circle { width: 110px; height: 110px; border-radius: 50%; background: linear-gradient(135deg, #4FD1C5, #319795); transition: transform 4s ease-in-out; display: flex; align-items: center; justify-content: center; }
.breathing-text { font-size: 16px; font-weight: 700; color: white; }
.anim-inhale { transform: scale(2.0); box-shadow: 0 0 80px rgba(79, 209, 197, 0.8); }
.anim-hold { transform: scale(2.0); }
.anim-exhale { transform: scale(1); }
.zen-controls { margin-top: 10px; }
.btn-zen-start { background: white; color: #2C5282; padding: 15px 40px; border-radius: 30px; font-weight: 700; border: none; cursor: pointer;}
.btn-zen-stop { background: transparent; color: white; padding: 12px 35px; border-radius: 30px; font-weight: 600; border: 2px solid rgba(255,255,255,0.5); cursor: pointer;}
.zen-tip { margin-top: 30px; background: rgba(0,0,0,0.2); padding: 15px 20px; border-radius: 16px; display: flex; align-items: center; gap: 15px; text-align: left; max-width: 300px; }
.zen-tip ion-icon { font-size: 30px; color: #F6E05E; min-width: 30px; }
.zen-tip span { font-size: 11px; color: #E2E8F0; }

/* BOTÓN SOS MEJORADO */
.sos-button { background: white; border: 1px solid #E2E8F0; color: #E53E3E; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 2px 5px rgba(0,0,0,0.02); display: flex; align-items: center; justify-content: center; }
.sos-button:active { transform: scale(0.95); }
.sos-active { background: #FFF5F5; border-color: #FC8181; color: #C53030; animation: pulse-red 1.5s infinite; }
@keyframes pulse-red { 0% { box-shadow: 0 0 0 0 rgba(252, 129, 129, 0.4); } 70% { box-shadow: 0 0 0 6px rgba(252, 129, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(252, 129, 129, 0); } }

/* TRANSICIÓN DEL BOTÓN SOS */
.fade-sos-enter-active, .fade-sos-leave-active { transition: opacity 0.4s ease, transform 0.4s ease; }
.fade-sos-enter-from, .fade-sos-leave-to { opacity: 0; transform: scale(0.8); }

/* --- MOTION DESIGN (TASK LIST) --- */
.task-list-enter-active, .task-list-leave-active { transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
.task-list-enter-from { opacity: 0; transform: translateY(30px) scale(0.95); }
.task-list-leave-to { opacity: 0; transform: translateX(-50px) scale(0.9); }
.task-list-move { transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); }

/* --- EMPTY STATE PREMIUM --- */
.empty-premium { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; text-align: center; animation: floatEmpty 3s ease-in-out infinite; margin-top: 20px; }
.empty-icon-wrapper { width: 80px; height: 80px; background: linear-gradient(135deg, #E6FFFA 0%, #B2F5EA 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40px; color: #319795; margin-bottom: 20px; box-shadow: 0 10px 25px rgba(49,151,149,0.2); }
.empty-premium h4 { font-size: 20px; font-weight: 800; color: #2D3748; margin: 0; }
.empty-premium p { font-size: 14px; color: #718096; margin-top: 5px; line-height: 1.5; }
@keyframes floatEmpty { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

/* --- PULIDO DE SOMBRAS --- */
.task-item-premium { box-shadow: 0 12px 30px rgba(0,0,0,0.04) !important; border-radius: 20px !important; margin-bottom: 12px !important; }

/* --- GLASSMORPHISM POMODORO --- */
ion-modal.glass-modal-container { --background: transparent; }
.glass-content { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: linear-gradient(135deg, rgba(230,255,250,0.85) 0%, rgba(235,244,255,0.85) 100%); backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px); color: #2D3748; padding: 40px 20px; border-radius: 40px 40px 0 0; }
.glass-header { text-align: center; margin-bottom: 50px; }
.glass-header h3 { font-size: 24px; font-weight: 800; color: #2D3748; margin: 0 0 10px; }
.glass-header p { font-size: 14px; color: #4A5568; margin: 0; max-width: 280px; line-height: 1.4; }
.pomodoro-circle-glass { width: 220px; height: 220px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 54px; font-weight: 900; color: #319795; background: rgba(255,255,255,0.6); border: 2px solid rgba(255,255,255,0.8); box-shadow: 0 20px 40px rgba(49,151,149,0.15), inset 0 0 20px rgba(255,255,255,1); transition: all 0.3s ease; margin-bottom: 40px; }
.pomodoro-circle-glass.running { animation: pulse-glass 2s infinite; color: #2C5282; border-color: #BEE3F8; box-shadow: 0 20px 50px rgba(44,82,130,0.2), inset 0 0 20px rgba(255,255,255,1); }
@keyframes pulse-glass { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
.pomodoro-controls-glass { display: flex; gap: 20px; margin-bottom: 30px; }
.btn-glass { background: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.8); color: #4A5568; padding: 12px 25px; border-radius: 30px; font-weight: 700; font-size: 16px; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.05); transition: 0.2s; }
.btn-glass:active { transform: scale(0.95); }
.btn-glass-primary { background: linear-gradient(135deg, #4FD1C5 0%, #319795 100%); border: none; color: white; padding: 18px 40px; border-radius: 30px; font-weight: 800; font-size: 16px; width: 100%; max-width: 300px; cursor: pointer; box-shadow: 0 10px 25px rgba(49,151,149,0.3); transition: 0.2s; }
.btn-glass-primary:active { transform: scale(0.95); }
</style>