import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';

// TODO: REEMPLAZA ESTO CON LA CONFIGURACIÓN DE TU PROYECTO FIREBASE
// Ve a https://console.firebase.google.com/, crea un proyecto web y copia el objeto firebaseConfig aquí.
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

// Bandera para saber si Firebase está configurado (para evitar que la app se rompa si no lo está)
export const isFirebaseConfigured = firebaseConfig.apiKey !== "TU_API_KEY";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// --- FUNCIONES DE AUTENTICACIÓN ---
export const login = async (email: string, pass: string) => {
  if (!isFirebaseConfigured) return { user: { email }, mock: true }; // Fallback para desarrollo
  return await signInWithEmailAndPassword(auth, email, pass);
};

export const register = async (email: string, pass: string) => {
  if (!isFirebaseConfigured) return { user: { email }, mock: true }; // Fallback para desarrollo
  return await createUserWithEmailAndPassword(auth, email, pass);
};

export const logout = async () => {
  if (!isFirebaseConfigured) return; // Fallback para desarrollo
  return await signOut(auth);
};

// --- FUNCIONES DE BASE DE DATOS (FIRESTORE) ---
export const getUserDataFromDb = async (userId: string) => {
  if (!isFirebaseConfigured) {
    // Fallback a localStorage si no hay Firebase
    return {
      energyLevel: parseInt(localStorage.getItem('mindSyncEnergy') || '50'),
      balanceStreak: parseInt(localStorage.getItem('mindSyncStreak') || '0'),
      lastStreakDate: localStorage.getItem('mindSyncLastStreakDate') || ''
    };
  }
  
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    // Inicializar datos del usuario si no existen
    const defaultData = { energyLevel: 50, balanceStreak: 0, lastStreakDate: '' };
    await setDoc(docRef, defaultData);
    return defaultData;
  }
};

export const updateUserDataInDb = async (userId: string, data: any) => {
  if (!isFirebaseConfigured) {
    // Fallback a localStorage
    if (data.energyLevel !== undefined) localStorage.setItem('mindSyncEnergy', data.energyLevel.toString());
    if (data.balanceStreak !== undefined) localStorage.setItem('mindSyncStreak', data.balanceStreak.toString());
    if (data.lastStreakDate !== undefined) localStorage.setItem('mindSyncLastStreakDate', data.lastStreakDate);
    return;
  }
  
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, data);
};

export const getUserTasksFromDb = async (userId: string) => {
  if (!isFirebaseConfigured) {
    // Fallback a localStorage
    const saved = localStorage.getItem('mindSyncTasks');
    return saved ? JSON.parse(saved) : [];
  }
  
  const q = query(collection(db, 'tasks'), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  const tasks: any[] = [];
  querySnapshot.forEach((doc) => {
    tasks.push({ id: doc.id, ...doc.data() });
  });
  // Ordenar por ID descendente para que las más nuevas aparezcan primero
  return tasks.sort((a, b) => b.id - a.id);
};

export const saveTaskToDb = async (userId: string, task: any) => {
  if (!isFirebaseConfigured) {
    // El frontend ya maneja el guardado en localStorage en HomePage, esto es solo un wrapper
    return task.id; 
  }
  
  // Guardamos la tarea en la colección global 'tasks' vinculada al userId
  const docRef = doc(collection(db, 'tasks'), task.id.toString());
  await setDoc(docRef, { ...task, userId });
  return task.id;
};

export const deleteTaskFromDb = async (taskId: number | string) => {
  if (!isFirebaseConfigured) return; // Fallback handled in frontend
  
  await deleteDoc(doc(db, 'tasks', taskId.toString()));
};
