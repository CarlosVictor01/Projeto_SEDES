import type { Agendamento } from '../types/agendamento'

async function consultar<T>(rota: string, signal: AbortSignal): Promise<T> {
  const resposta = await fetch(rota, { signal })
  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => null)
    throw new Error(erro?.detail || 'Não foi possível consultar a API.')
  }
  return resposta.json()
}

export function carregarAgenda(signal: AbortSignal) {
  const rota = import.meta.env.MODE === 'apresentacao' ? './agendamentos.json' : '/api/agendamentos/futuros'
  return consultar<Agendamento[]>(rota, signal)
}
