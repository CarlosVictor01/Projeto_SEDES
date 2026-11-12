from pathlib import Path

import numpy as np
import pandas as pd

RAIZ = Path(__file__).resolve().parent
MATRIZ = RAIZ / "dados/base_cras_ML_pronta.csv"
AGENDA = RAIZ / "dados/agenda.csv"
MODELO = RAIZ / "modelos/regressao_logistica.pkl"
ALVO = "Faltou_Flag"
DATA = "Data_Atendimento"
ID = "ID_Agendamento"


def ler_csv(caminho: Path) -> pd.DataFrame:
    dados = pd.read_csv(caminho, sep=None, engine="python", encoding="utf-8-sig",
                        dtype={ID: "string"})
    dados.columns = dados.columns.str.strip()
    return dados


def datas(serie: pd.Series) -> pd.Series:
    resultado = pd.to_datetime(serie, format="ISO8601", errors="raise").dt.normalize()
    if resultado.isna().any():
        raise ValueError("Data_Atendimento contém data vazia.")
    return resultado


def atributos(dados: pd.DataFrame) -> list[str]:
    # Somente informações conhecidas na marcação. Dummies vêm da matriz do grupo.
    prefixos = ("Unidade_CRAS_", "Canal_Agendamento_", "Horario_Agendamento_",
                "Dia_Semana_Atendimento_", "Quinzena_Atendimento_")
    colunas = [c for c in dados if c in {"Tempo_Espera_Dias", "Mes_Atendimento"}
               or c.startswith(prefixos)]
    if not colunas:
        raise ValueError("Matriz sem preditores reconhecidos.")
    return colunas


def entradas(dados: pd.DataFrame, colunas: list[str]) -> pd.DataFrame:
    faltando = set(colunas).difference(dados.columns)
    if faltando:
        raise ValueError("Preditores ausentes: " + ", ".join(sorted(faltando)))
    valores = dados[colunas].replace({"TRUE": 1, "FALSE": 0, "True": 1, "False": 0})
    valores = valores.apply(pd.to_numeric, errors="raise").astype(float)
    if not np.isfinite(valores.to_numpy()).all():
        raise ValueError("Preditores contêm valores ausentes ou infinitos.")
    return valores
