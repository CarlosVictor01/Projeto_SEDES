import type { Agendamento } from '../types/agendamento'

// Valores ilustrativos fixos para demonstrar a interface.
export const agendaDemo: Agendamento[] = [
  { id: 'AG-1024', unidade: 'CRAS Itapoã', data: '2025-07-03', turno: 'Tarde', antecedencia: 24, probabilidade: 0.42, risco: 'Alto' },
  { id: 'AG-1025', unidade: 'CRAS Ceilândia Sul', data: '2025-07-03', turno: 'Manhã', antecedencia: 18, probabilidade: 0.36, risco: 'Alto' },
  { id: 'AG-1026', unidade: 'CRAS Itapoã', data: '2025-07-03', turno: 'Tarde', antecedencia: 12, probabilidade: 0.28, risco: 'Médio' },
  { id: 'AG-1027', unidade: 'CRAS Gama', data: '2025-07-03', turno: 'Manhã', antecedencia: 6, probabilidade: 0.12, risco: 'Baixo' },
  { id: 'AG-1028', unidade: 'CRAS Planaltina', data: '2025-07-04', turno: 'Tarde', antecedencia: 22, probabilidade: 0.38, risco: 'Alto' },
  { id: 'AG-1029', unidade: 'CRAS Gama', data: '2025-07-04', turno: 'Manhã', antecedencia: 11, probabilidade: 0.23, risco: 'Médio' },
  { id: 'AG-1030', unidade: 'CRAS Planaltina', data: '2025-07-04', turno: 'Tarde', antecedencia: 3, probabilidade: 0.09, risco: 'Baixo' },
  { id: 'AG-1031', unidade: 'CRAS Ceilândia Sul', data: '2025-07-04', turno: 'Manhã', antecedencia: 9, probabilidade: 0.19, risco: 'Médio' },
]
