import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, ChartNoAxesColumn, Landmark, ListFilter, TriangleAlert } from 'lucide-react'
import { AgendaTable } from '../components/AgendaTable'
import { FilterSelect } from '../components/FilterSelect'
import { MetricCard } from '../components/MetricCard'
import { carregarAgenda } from '../services/agendamentos'
import { formatarPercentual } from '../utils/formatacao'
import type { Risco } from '../types/agendamento'

const faixas: Risco[] = ['Alto', 'Médio', 'Baixo']

export function Dashboard() {
  const [unidade, setUnidade] = useState('CRAS Areal')
  const [inicio, setInicio] = useState('2026-10-01')
  const [fim, setFim] = useState('2026-10-31')
  const [risco, setRisco] = useState('')
  const [painel, setPainel] = useState<Awaited<ReturnType<typeof carregarAgenda>> | null>(null)
  const [erro, setErro] = useState('')
  const [tentativa, setTentativa] = useState(0)
  useEffect(() => {
    const controle = new AbortController()
    setErro('')
    carregarAgenda(controle.signal).then(dados => {
      if (!controle.signal.aborted) setPainel(dados)
    }).catch((e: unknown) => {
      if (!controle.signal.aborted) setErro(e instanceof Error ? e.message : 'Erro ao consultar a agenda.')
    })
    return () => controle.abort()
  }, [tentativa])
  const unidades = useMemo(() => [...new Set(['CRAS Areal', ...(painel ?? []).map(a => a.unidade)])]
    .sort((a, b) => a.localeCompare(b, 'pt-BR')), [painel])
  const registros = useMemo(() => (painel ?? []).filter(a =>
    (!unidade || a.unidade === unidade) && (!risco || a.risco === risco) &&
    (!inicio || a.data >= inicio) && (!fim || a.data <= fim)), [painel, unidade, risco, inicio, fim])
  if (erro) return <main className="mx-auto max-w-xl p-8"><h1 className="text-2xl">Agenda indisponível</h1>
    <p role="alert" className="my-4">{erro}</p>
    <button className="rounded border p-2" onClick={() => setTentativa(n => n + 1)}>Tentar novamente</button></main>
  if (!painel) return <main className="p-8" role="status">Carregando previsões…</main>
  const total = registros.length
  const altos = registros.filter(a => a.risco === 'Alto').length
  const media = total ? formatarPercentual(registros.reduce((s, a) => s + a.probabilidade, 0) / total) : '—'

  return <>
    <header className="border-b-4 border-amber-400 bg-[#103b39] text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5">
        <div className="flex items-center gap-3"><Landmark aria-hidden="true" />
          <span className="text-lg font-bold tracking-wide">SEDES-DF</span></div>
        <span className="text-sm text-teal-50">Demonstração com dados simulados</span>
      </div>
    </header>
    <main className="mx-auto max-w-6xl px-5 py-9">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Previsão de abstenções nos CRAS</h1>
      <p className="mt-2 text-slate-600">Consulte a probabilidade de abstenção por unidade e data de atendimento.</p>
      <section aria-label="Filtros" className="my-6 flex flex-wrap items-end gap-4">
        <FilterSelect label="Unidade CRAS" todas="Todas as unidades" valor={unidade} opcoes={unidades} aoAlterar={setUnidade} />
        <FilterSelect label="Faixa de risco" todas="Todas as faixas" valor={risco} opcoes={faixas} aoAlterar={setRisco} />
        <label className="grid gap-1 text-sm font-medium">Data inicial
          <input type="date" value={inicio} max={fim || undefined} onChange={e => setInicio(e.target.value)}
            className="rounded-lg border border-stone-300 bg-white px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm font-medium">Data final
          <input type="date" value={fim} min={inicio || undefined} onChange={e => setFim(e.target.value)}
            className="rounded-lg border border-stone-300 bg-white px-3 py-2" />
        </label>
        <button disabled={!unidade && !risco && !inicio && !fim} onClick={() => { setUnidade(''); setRisco(''); setInicio(''); setFim('') }}
          className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-teal-800 underline disabled:text-slate-500 disabled:no-underline">
          <ListFilter size={16} aria-hidden="true" /> Limpar filtros
        </button>
      </section>
      {inicio && fim && inicio > fim && <p role="alert" className="mb-4 text-red-800">A data final deve ser igual ou posterior à data inicial.</p>}
      <dl aria-label="Indicadores dos agendamentos filtrados" className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="Agendamentos" valor={String(total)} icone={CalendarDays} />
        <MetricCard label="Agendamentos de alto risco" valor={String(altos)} icone={TriangleAlert} />
        <MetricCard label="Risco médio de abstenção no período" valor={media} icone={ChartNoAxesColumn} />
      </dl>
      <section className="mt-7 overflow-hidden rounded-xl border border-stone-200 bg-white" aria-labelledby="agenda">
        <div className="flex flex-wrap items-center justify-between gap-2 p-5">
          <h2 id="agenda" className="text-xl font-semibold">Agendamentos do período</h2>
          <span role="status" className="text-sm text-slate-600">{total} {total === 1 ? 'registro' : 'registros'}</span>
        </div>
        <AgendaTable key={JSON.stringify([unidade, risco, inicio, fim])} registros={registros} />
      </section>
    </main>
  </>
}
