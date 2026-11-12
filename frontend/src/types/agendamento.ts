// A faixa vem da fonte da previsão e acompanha a probabilidade de 0 a 1.
export type Risco = 'Alto' | 'Médio' | 'Baixo'

// Cada registro representa uma marcação e contém somente os campos do painel.
export interface Agendamento {
  id: string
  unidade: string
  data: string
  turno: 'Manhã' | 'Tarde'
  antecedencia: number
  probabilidade: number
  risco: Risco
}
