import type { LucideIcon } from 'lucide-react'

// O mesmo cartão aceita qualquer ícone Lucide e um valor já formatado.
interface Props { label: string; valor: string; icone: LucideIcon }

export function MetricCard({ label, valor, icone: Icone }: Props) {
  return <div className="rounded-xl border border-stone-200 bg-white p-5">
    <div className="flex items-center justify-between gap-2">
      <dt className="text-sm font-medium text-slate-600">{label}</dt>
      <Icone size={19} aria-hidden="true" className="text-teal-700" />
    </div>
    <dd className="mt-3 text-3xl font-semibold tabular-nums">{valor}</dd>
  </div>
}
