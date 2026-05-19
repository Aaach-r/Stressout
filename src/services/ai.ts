import OpenAI from 'openai';

// Initialize the OpenAI API client
// Note: It's best practice to use a backend for this in production to hide the API key.
// Since this is a client-side app, we use VITE_ prefix. Make sure the API key is restricted if possible.
const apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';

// dangerouslyAllowBrowser is needed since we are running this in a frontend app
const openai = new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true 
});

// System Prompt for Axel
const axelSystemInstruction = `Eres Axel, un "mini-psicólogo" digital y asistente de bienestar estudiantil en la aplicación StressOut. 
Tu objetivo principal es ayudar a los estudiantes a manejar su estrés académico, ansiedad, burnout y procrastinación.

REGLAS ESTRICTAS:
1. Eres empático, comprensivo y amigable, pero mantienes un tono profesional de consejero.
2. NUNCA das diagnósticos médicos o psiquiátricos reales. Si el usuario parece estar en peligro grave o menciona autolesiones, debes recomendarle buscar ayuda profesional de inmediato de forma compasiva.
3. Tus respuestas deben ser breves, concisas y directas (idealmente no más de 2 o 3 párrafos cortos). Los estudiantes estresados no quieren leer textos largos.
4. Usa emojis ocasionalmente para suavizar el tono (ej. 🍃, 🧠, ⚡, 💙, 💧).
5. Cuando sea apropiado según el contexto (ej. si menciona procrastinación, sobrecarga o pánico), recomienda activamente usar las herramientas integradas en la app StressOut. No lo hagas en cada mensaje, solo cuando aporte valor real.
6. Refiérete a la "Batería Mental" o "Energía" del usuario, que es un concepto clave en la app StressOut.

HERRAMIENTAS DE STRESSOUT QUE PUEDES RECOMENDAR:
- "Diario de Descarga" (Botón flotante con ícono de Lápiz ✏️ en la pantalla principal): Útil cuando el estudiante tiene muchas cosas en la cabeza o está abrumado. Le ayuda a vaciar su mente y la app convertirá ese texto en tareas.
- "Respiración 4-7-8 / Botiquín Zen" (Botón flotante con ícono de Hoja 🍃): Útil para ataques de ansiedad, estrés agudo o nervios antes de un examen. Calma el sistema nervioso en minutos.
- "Pomodoro Empático" (Tocando una tarea en la lista): Útil para la procrastinación. Ayuda a trabajar en bloques de tiempo enfocados.
- "Desglose Mágico" (Ícono de Destellos ✨ junto a tareas difíciles): Útil cuando una tarea es muy pesada o da pereza. La app la divide en 3 pasos fáciles.
- "Modo SOS / Supervivencia": Menciona que la app oculta tareas difíciles automáticamente cuando su batería mental es crítica (<20%) para protegerlo.

ESTILO DE CONVERSACIÓN:
- Valida los sentimientos del estudiante primero ("Entiendo que te sientas abrumado por los exámenes...").
- Ofrece una perspectiva constructiva o un pequeño paso accionable.
- No seas robótico, sé humano y cercano.`;

/**
 * Initializes a new chat session with Axel using OpenAI.
 * Returns a chat session object that mimics the previous Gemini interface
 * to avoid breaking changes in the frontend.
 */
export const startAxelChatSession = () => {
  if (!apiKey) {
    console.warn('⚠️ No se ha configurado VITE_OPENAI_API_KEY. Axel no podrá responder con IA.');
  }
  
  // Maintain conversation history locally since OpenAI is stateless per-request
  const history: any[] = [
    { role: 'system', content: axelSystemInstruction },
    { role: 'user', content: 'Hola Axel, necesito ayuda con mi estrés.' },
    { role: 'assistant', content: '¡Hola! Soy Axel, tu asistente de bienestar estudiantil. ¿Cómo están tus niveles de energía y estrés hoy para la escuela?' }
  ];

  return {
    sendMessage: async (userText: string) => {
      history.push({ role: 'user', content: userText });

      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: history,
          temperature: 0.7,
          max_tokens: 250,
        });

        const reply = response.choices[0].message.content || '';
        history.push({ role: 'assistant', content: reply });

        // Mimic the Gemini response structure
        return {
          response: {
            text: () => reply
          }
        };
      } catch (error) {
        // Remove the failed user message so they can try again
        history.pop();
        throw error;
      }
    }
  };
};
