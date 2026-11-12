import pickle
from datetime import date, timedelta
from typing import Literal

import numpy as np
import pandas as pd
from pydantic import BaseModel

from .dados import AGENDA, DATA, ID, MATRIZ, MODELO, datas, entradas, ler_csv

HOJE = date(2026, 11, 20)
INICIO_LISTAGEM = date(2026, 1, 20)
SEGUNDA = HOJE + timedelta(days=7 - HOJE.weekday())
DOMINGO = SEGUNDA + timedelta(days=6)
Faixa = Literal["Baixo", "Médio", "Alto"]


class Agendamento(BaseModel):
    id: str
    unidade: str
    data: date
    turno: str
    antecedencia: int
    probabilidade: float
    risco: Faixa


class Indicadores(BaseModel):
    referencia: date
    inicio: date
    fim: date
    quantidade: int
    risco_medio: float | None


def classificar(probabilidade: float, inferior: float, superior: float) -> Faixa:
    if probabilidade <= inferior:
        return "Baixo"
    if probabilidade <= superior:
        return "Médio"
    return "Alto"


def consultar(inicio: date, fim: date | None = None) -> list[Agendamento]:
    agenda = ler_csv(AGENDA if AGENDA.is_file() else MATRIZ)
    campos = {DATA, "Unidade_CRAS", "Horario_Agendamento", "Tempo_Espera_Dias"}
    if campos.difference(agenda.columns):
        raise ValueError("Forneça backend/dados/agenda.csv com data, unidade, turno e antecedência.")
    agenda[DATA] = datas(agenda[DATA])
    selecao = agenda[DATA] >= pd.Timestamp(inicio)
    if fim is not None:
        selecao &= agenda[DATA] <= pd.Timestamp(fim)
    if "Data_Criacao_Agendamento" in agenda:
        selecao &= datas(agenda["Data_Criacao_Agendamento"]) <= pd.Timestamp(HOJE)
    agenda = agenda.loc[selecao].copy()
    if agenda.empty:
        return []

    with MODELO.open("rb") as arquivo:
        pacote = pickle.load(arquivo)
    # A agenda pode vir da EDA com categorias textuais ou já conter as dummies do treino.
    categorias = ("Unidade_CRAS", "Horario_Agendamento", "Dia_Semana_Atendimento",
                  "Canal_Agendamento", "Quinzena_Atendimento")
    agenda["Mes_Atendimento"] = agenda[DATA].dt.month
    agenda["Dia_Semana_Atendimento"] = agenda[DATA].dt.day_name()
    agenda["Quinzena_Atendimento"] = np.where(agenda[DATA].dt.day <= 15, "1a Quinzena", "2a Quinzena")
    for coluna in pacote["colunas"]:
        if coluna in agenda:
            continue
        for categoria in categorias:
            prefixo = categoria + "_"
            if coluna.startswith(prefixo) and categoria in agenda:
                if agenda[categoria].isna().any():
                    raise ValueError(f"Categoria vazia em {categoria}.")
                agenda[coluna] = agenda[categoria].astype(str).str.strip().eq(coluna[len(prefixo):])
                break
    for campo in ("Unidade_CRAS", "Horario_Agendamento"):
        if agenda[campo].fillna("").astype(str).str.strip().eq("").any():
            raise ValueError(f"Campo obrigatório vazio: {campo}.")
    if ID in agenda and (agenda[ID].isna().any() or agenda[ID].duplicated().any()):
        raise ValueError("ID_Agendamento deve ser único e preenchido.")
    probabilidades = pacote["modelo"].predict_proba(entradas(agenda, pacote["colunas"]))[:, 1]
    inferior, superior = pacote["cortes"]
    registros = []
    for (indice, linha), p in zip(agenda.iterrows(), probabilidades):
        registros.append(Agendamento(
            id=str(linha.get(ID, f"AG-{indice + 1}")), unidade=linha["Unidade_CRAS"],
            data=linha[DATA].date(), turno=linha["Horario_Agendamento"],
            antecedencia=linha["Tempo_Espera_Dias"], probabilidade=float(p),
            risco=classificar(p, inferior, superior),
        ))
    return sorted(registros, key=lambda ag: -ag.probabilidade)
