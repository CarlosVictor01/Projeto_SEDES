import pickle
from tempfile import NamedTemporaryFile
from pathlib import Path

import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

from .dados import ALVO, DATA, MATRIZ, MODELO, atributos, datas, entradas, ler_csv


def treinar(caminho: Path = MATRIZ, destino: Path = MODELO) -> None:
    dados = ler_csv(caminho)
    if ALVO not in dados or dados[ALVO].isna().any() or set(dados[ALVO].unique()) != {0, 1}:
        raise ValueError("O histórico deve conter Faltou_Flag com as classes 0 e 1.")
    y = dados[ALVO].astype(int)
    colunas = atributos(dados)
    x = entradas(dados, colunas)
    if DATA in dados:
        dias = datas(dados[DATA])
        corte = dias.sort_values().iloc[int(0.8 * len(dias))]
        treino, teste = dados.index[dias < corte], dados.index[dias >= corte]
        divisao = f"cronológica, teste a partir de {corte.date()}"
    else:
        treino, teste = train_test_split(dados.index, test_size=0.2, stratify=y, random_state=42)
        divisao = "estratificada com semente 42 (matriz sem data)"
    if not len(teste) or y.loc[treino].nunique() < 2:
        raise ValueError("Dados insuficientes para o corte 80/20 com duas classes no treino.")

    modelo = make_pipeline(StandardScaler(), LogisticRegression(max_iter=2000, random_state=42))
    modelo.fit(x.loc[treino], y.loc[treino])
    cortes = np.quantile(modelo.predict_proba(x.loc[treino])[:, 1], [1 / 3, 2 / 3])
    previsto = modelo.predict(x.loc[teste])
    real = y.loc[teste]
    print(f"Divisão {divisao}. Treino: {len(treino)} | Teste: {len(teste)}")
    print(f"Acurácia: {accuracy_score(real, previsto):.4f}")
    print(f"Precisão: {precision_score(real, previsto, zero_division=0):.4f}")
    print(f"Recall: {recall_score(real, previsto, zero_division=0):.4f}")
    print(f"F1-Score: {f1_score(real, previsto, zero_division=0):.4f}")
    print(f"Tercis do treino: {cortes[0]:.4%}, {cortes[1]:.4%}")
    destino.parent.mkdir(parents=True, exist_ok=True)
    with NamedTemporaryFile(dir=destino.parent, delete=False) as arquivo:
        temporario = Path(arquivo.name)
    try:
        with temporario.open("wb") as arquivo:
            pickle.dump({"modelo": modelo, "colunas": colunas, "cortes": cortes}, arquivo)
        temporario.replace(destino)
    finally:
        temporario.unlink(missing_ok=True)
    print(f"Modelo salvo em {destino}")


if __name__ == "__main__":
    try:
        treinar()
    except (OSError, ValueError) as erro:
        raise SystemExit(f"Falha no treinamento: {erro}") from erro
