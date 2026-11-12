import logging

from fastapi import FastAPI, HTTPException

from .previsoes import (
    DOMINGO, HOJE, INICIO_LISTAGEM, SEGUNDA, Agendamento, Indicadores, consultar,
)

app = FastAPI(title="Sistema Preditivo de Agendamentos CRAS/SEDES")
log = logging.getLogger(__name__)


def falha(erro: Exception) -> HTTPException:
    log.exception("Falha na consulta de previsões")
    if isinstance(erro, FileNotFoundError):
        return HTTPException(503, "Base ou modelo ausente. Confira os CSVs e execute o treinamento.")
    if isinstance(erro, ValueError):
        return HTTPException(422, str(erro))
    return HTTPException(500, "Falha ao calcular as previsões. Consulte o log da API.")


@app.get("/api/agendamentos/futuros")
def agendamentos_futuros() -> list[Agendamento]:
    try:
        return consultar(INICIO_LISTAGEM)
    except Exception as erro:
        raise falha(erro) from erro


@app.get("/api/kpis")
def kpis() -> Indicadores:
    try:
        semana = consultar(SEGUNDA, DOMINGO)
        media = sum(a.probabilidade for a in semana) / len(semana) if semana else None
        return Indicadores(referencia=HOJE, inicio=SEGUNDA, fim=DOMINGO,
                           quantidade=len(semana), risco_medio=media)
    except Exception as erro:
        raise falha(erro) from erro
