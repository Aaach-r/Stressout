export interface MockLmsTask {
  id: string;
  course: string;
  title: string;
  platform: 'teams' | 'classroom';
}

export const mockLmsResponse: MockLmsTask[] = [
  {
    id: "ms-01",
    course: "Ecuaciones Diferenciales",
    title: "Examen Parcial 2 - Resolución de problemas",
    platform: "teams"
  },
  {
    id: "ms-02",
    course: "Física Cuántica",
    title: "Ver el video documental y hacer un resumen",
    platform: "teams"
  },
  {
    id: "gc-01",
    course: "Historia del Arte",
    title: "Ensayo final sobre el Renacimiento (15 páginas)",
    platform: "classroom"
  },
  {
    id: "gc-02",
    course: "Taller de Lectura",
    title: "Leer el Capítulo 4",
    platform: "classroom"
  }
];
