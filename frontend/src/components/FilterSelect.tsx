interface Props {
  label: string
  todas: string
  valor: string
  opcoes: readonly string[]
  aoAlterar: (valor: string) => void
}

export function FilterSelect({ label, todas, valor, opcoes, aoAlterar }: Props) {
  return <label className="grid gap-1 text-sm font-medium">
    {label}
    <select value={valor} onChange={e => aoAlterar(e.target.value)}
      className="rounded-lg border border-stone-300 bg-white px-3 py-2">
      <option value="">{todas}</option>
      {opcoes.map(opcao => <option key={opcao}>{opcao}</option>)}
    </select>
  </label>
}
