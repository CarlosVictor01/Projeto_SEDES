import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Agendamento } from '../types/agendamento'
import { formatarData, formatarPercentual } from '../utils/formatacao'
import { RiskBadge } from './RiskBadge'

const colunas = [
  ['id', 'Agendamento'], ['unidade', 'Unidade'], ['data', 'Atendimento'],
  ['turno', 'Turno'], ['antecedencia', 'Antecedência'],
  ['probabilidade', 'Chance de falta'], ['risco', 'Risco'],
] as const
type Coluna = typeof colunas[number][0]
const ordemRisco = { Baixo: 0, Médio: 1, Alto: 2 }
const compararTexto = new Intl.Collator('pt-BR', { numeric: true })
const porPagina = 15

function comparar(a: Agendamento, b: Agendamento, coluna: Coluna) {
  if (coluna === 'risco') return ordemRisco[a.risco] - ordemRisco[b.risco]
  if (coluna === 'antecedencia' || coluna === 'probabilidade') return a[coluna] - b[coluna]
  return compararTexto.compare(a[coluna], b[coluna])
}

export function AgendaTable({ registros }: { registros: readonly Agendamento[] }) {
  const [coluna, setColuna] = useState<Coluna>('probabilidade')
  const [crescente, setCrescente] = useState(false)
  const [pagina, setPagina] = useState(1)
  const ordenados = useMemo(() => [...registros].sort((a, b) =>
    comparar(a, b, coluna) * (crescente ? 1 : -1) || compararTexto.compare(a.id, b.id)),
    [registros, coluna, crescente])
  const paginas = Math.ceil(registros.length / porPagina)
  const inicio = (pagina - 1) * porPagina
  function ordenar(chave: Coluna) {
    setCrescente(chave === coluna ? !crescente : true)
    setColuna(chave)
    setPagina(1)
  }

  if (!registros.length) return <p className="p-6">Nenhum agendamento corresponde aos filtros selecionados.</p>
  return <>
    <div className="overflow-x-auto" role="region" aria-label="Tabela de agendamentos" tabIndex={0}>
      <table className="w-full whitespace-nowrap text-left text-sm">
        <caption className="sr-only">Agendamentos do período. Selecione um cabeçalho para ordenar.</caption>
        <thead><tr>{colunas.map(([chave, titulo]) => {
          const ativa = coluna === chave
          const Icone = ativa ? (crescente ? ArrowUp : ArrowDown) : ArrowUpDown
          return <th key={chave} scope="col" aria-sort={ativa ? (crescente ? 'ascending' : 'descending') : undefined}>
            <button className="inline-flex items-center gap-1 py-1" onClick={() => ordenar(chave)}>
              {titulo}<Icone size={14} aria-hidden="true" />
            </button></th>
        })}</tr></thead>
        <tbody>{ordenados.slice(inicio, inicio + porPagina).map(a => <tr key={a.id}>
          <th scope="row">{a.id}</th><td>{a.unidade}</td><td>{formatarData(a.data)}</td>
          <td>{a.turno}</td><td>{a.antecedencia} dias</td>
          <td className="font-semibold tabular-nums">{formatarPercentual(a.probabilidade)}</td>
          <td><RiskBadge risco={a.risco} /></td>
        </tr>)}</tbody>
      </table>
    </div>
    <nav aria-label="Páginas da agenda" className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 p-4 text-sm">
      <button disabled={pagina === 1} onClick={() => setPagina(p => p - 1)}
        className="flex items-center gap-1 rounded-lg border px-3 py-2 disabled:opacity-50">
        <ChevronLeft size={16} aria-hidden="true" />Anterior
      </button>
      <span role="status">Página {pagina} de {paginas}</span>
      <button disabled={pagina === paginas} onClick={() => setPagina(p => p + 1)}
        className="flex items-center gap-1 rounded-lg border px-3 py-2 disabled:opacity-50">
        Próxima<ChevronRight size={16} aria-hidden="true" />
      </button>
    </nav>
  </>
}
