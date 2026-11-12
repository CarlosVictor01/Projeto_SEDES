const percentual = new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1 })
const dataCurta = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' })

export const formatarPercentual = (valor: number) => percentual.format(valor)
export const formatarData = (iso: string) => dataCurta.format(new Date(iso + 'T00:00:00Z'))
