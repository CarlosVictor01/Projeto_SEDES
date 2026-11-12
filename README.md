# Sistema Preditivo de Agendamentos CRAS/SEDES

MVP acadêmico da UnDF para consultar a probabilidade estimada de falta por agendamento. O painel abre com o CRAS Areal e os atendimentos de outubro de 2026. Permite filtrar por unidade, faixa de risco e intervalo de datas, ordenar pelas sete colunas e navegar em páginas de até 15 agendamentos. Os indicadores consideram todos os registros da seleção.

## Status e tecnologias

O treinamento e a API rodam em Python localmente com pandas, NumPy, scikit-learn, FastAPI e Uvicorn. A interface usa React, TypeScript, Vite, Tailwind CSS e Lucide React. A demonstração usa os CSVs simulados do grupo. A execução e a avaliação com a matriz do projeto dependem do fornecimento dessa base.

## Organização

| Caminho | Finalidade |
| --- | --- |
| `backend/dados/base_cras_ML_pronta.csv` | Matriz de treino gerada pelo Colab |
| `backend/dados/agenda.csv` | Agenda datada, por exemplo a base EDA exportada |
| `backend/dados.py` | Leitura e validação das entradas |
| `backend/train_model.py` | Divisão 80/20, treinamento, avaliação e exportação |
| `backend/modelos/regressao_logistica.pkl` | Pipeline, ordem dos preditores e tercis gerados pelo treinamento |
| `backend/main.py` | Endpoints HTTP e tratamento de erros |
| `backend/previsoes.py` | Datas de referência, leitura da agenda e classificação do risco |
| `frontend/src/pages/` e `components/` | Painel, tabela, filtros e cartões |
| `frontend/src/services/`, `types/` e `utils/` | Cliente da API, tipos e formatação |
| `requirements.txt` | Dependências do backend |

## Preparar os dados

1. Coloque a matriz em `backend/dados/base_cras_ML_pronta.csv`. Use CSV UTF-8 com cabeçalho e uma linha por marcação. `Faltou_Flag` recebe 0 para comparecimento e 1 para falta. Use resultados confirmados no treinamento.
2. Coloque sua base EDA em `backend/dados/agenda.csv`. Os campos de exibição obrigatórios são `Data_Atendimento` (AAAA-MM-DD), `Unidade_CRAS`, `Horario_Agendamento` e `Tempo_Espera_Dias`. Forneça também `Canal_Agendamento` se o modelo usar dummies de canal. Use os mesmos rótulos da matriz, inclusive em categorias de referência omitidas por `drop_first=True`. A data prevista permite derivar mês, dia da semana em inglês e quinzena. A API também aceita as colunas indicadoras já codificadas.
3. Opcionalmente inclua `ID_Agendamento` único. Na ausência dele a interface identifica cada linha pela posição original no CSV. Se houver `Data_Criacao_Agendamento`, a API exclui as marcações criadas depois de 20/11/2026. A agenda deve conter marcações pertinentes à consulta, com cancelamentos já conhecidos tratados na origem.
4. Se a própria matriz contiver os campos de exibição e os preditores, a API poderá lê-la diretamente quando `agenda.csv` estiver ausente. Uma matriz apenas com dummies e mês exige uma agenda datada. As previsões são feitas linha a linha, sem unir arquivos por posição.

## Instalar e treinar no Windows

Use Python 3.11 ou 3.12 e Node.js 22.12 ou superior. Abra um PowerShell na raiz do projeto.

```powershell
py -3 -m venv backend/.venv
.\backend\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\backend\.venv\Scripts\python.exe -m backend.train_model
```

O script usa regressão logística e ajusta a padronização somente no treino. Quando a matriz contém `Data_Atendimento`, separa os atendimentos mais antigos para treino e os mais recentes para teste, mantendo registros do mesmo dia juntos. Nesse caso a proporção pode variar ligeiramente. Para a matriz original sem datas, usa divisão estratificada 80/20 por linhas com semente 42. Para uma avaliação temporal, exporte a data junto com a matriz antes do treino.

Os preditores selecionados são antecedência, mês e indicadores de unidade, canal, turno, dia da semana e quinzena. A seleção exclui status final, alvo, histórico individual e resultado do WhatsApp. O console informa os tamanhos dos conjuntos, acurácia, precisão, recall e F1 da classe falta (classe positiva 1, decisão padrão do modelo). As métricas referem-se ao teste reservado. A listagem da API pode incluir registros históricos usados no treino e serve para consulta, não para medir desempenho.

O script grava o arquivo pickle em `backend/modelos/`. Use o mesmo ambiente para treinamento e API e carregue apenas o modelo gerado pelo projeto.

## Executar a aplicação

No primeiro terminal, a partir da raiz:

```powershell
.\backend\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload
```

No segundo terminal:

```powershell
cd frontend
npm.cmd ci
npm.cmd run dev
```

Com Yarn, os comandos equivalentes são `yarn install` e `yarn dev`. Abra o endereço informado pelo Vite. O proxy encaminha `/api` para `http://127.0.0.1:8000`. A documentação interativa da API está em `http://127.0.0.1:8000/docs`. Para compilar a interface, execute `npm.cmd run build`. Em hospedagem estática, configure o servidor para encaminhar `/api` ao backend.

## Datas, endpoints e critérios

A data de referência é **20/11/2026**, independente do relógio do computador.

| Método e rota | Resultado |
| --- | --- |
| `GET /api/agendamentos/futuros` | Lista desde **20/01/2026 inclusive**, ordenada pela probabilidade de falta. Por requisito, este intervalo inclui atendimentos anteriores à referência. A resposta traz id, unidade, data, turno, antecedencia, probabilidade e risco. |
| `GET /api/kpis` | Média das probabilidades na próxima semana civil (segunda **23/11/2026** a domingo **29/11/2026**, inclusive), quantidade, início, fim e referência. A média está na escala 0–1. Sem registros, a quantidade é zero e a média é nula. |

O modelo estima a probabilidade da classe 1. Os limites são os quantis de 1/3 e 2/3 das probabilidades do **treino**. Valores até o primeiro corte recebem Baixo, valores acima do primeiro e até o segundo recebem Médio e os demais recebem Alto. Empates podem deixar alguma faixa vazia. Filtrar por CRAS mantém os limites originais e o KPI semanal global.

Uma agenda com datas somente de 2025 produzirá uma listagem vazia para o intervalo solicitado. Para demonstrar a semana do KPI, forneça marcações simuladas datadas de 23 a 29/11/2026. Uma base ou um modelo ausente ao calcular previsões resulta em HTTP 503. Dados incompatíveis resultam em HTTP 422.

## Autores e licença

Equipe acadêmica do Projeto SEDES, Universidade do Distrito Federal (UnDF). Licença de distribuição a definir pela equipe.
