import type { Risco } from '../types/agendamento'

const cores: Record<Risco, string> = {
  Alto: 'bg-orange-100 text-orange-900',
  Médio: 'bg-amber-100 text-amber-900',
  Baixo: 'bg-teal-100 text-teal-900',
}

export function RiskBadge({ risco }: { risco: Risco }) {
  return <span className={'rounded-full px-3 py-1 text-xs font-semibold ' + cores[risco]}>{risco}</span>
}
