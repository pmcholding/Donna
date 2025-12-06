# Donna Salao de Beleza - Chatbot WhatsApp com RAG

Chatbot inteligente para atendimento ao cliente via WhatsApp usando RAG (Retrieval-Augmented Generation) com n8n e Supabase.

## Arquitetura

```
Cliente (WhatsApp)
       |
       v
+------------------+
|   n8n Webhook    |
+--------+---------+
         |
    +----+----+
    v         v
+-------+  +----------+
| OpenAI|  | Supabase |
| Embed |  | pgvector |
+-------+  +----------+
    |           |
    +-----+-----+
          v
    +-----------+
    | OpenAI    |
    | GPT-4o    |
    +-----------+
          |
          v
    +-----------+
    | WhatsApp  |
    | Response  |
    +-----------+
```

## Estrutura de Arquivos

```
Donna/
├── prompts/
│   └── system_prompt.txt      # System prompt enxuto (comportamento)
├── supabase/
│   ├── schema.sql             # Schema do banco + funcoes RPC
│   └── chunks_faqs.json       # FAQs estruturadas para importacao
├── n8n/
│   ├── workflow_ingest.json   # Workflow para importar FAQs
│   └── workflow_chatbot.json  # Workflow principal do chatbot
└── README.md
```

## Setup

### 1. Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Va em SQL Editor e execute o arquivo `supabase/schema.sql`
3. Copie a URL e ANON KEY do projeto

### 2. n8n

1. Instale as credenciais:
   - OpenAI API
   - Supabase (URL + Service Role Key)
   - WhatsApp Business API

2. Importe os workflows:
   - `workflow_ingest.json` - Para importar FAQs
   - `workflow_chatbot.json` - Chatbot principal

### 3. Importar FAQs

1. Edite `chunks_faqs.json` com todas as FAQs
2. Execute o workflow de ingest no n8n
3. Verifique no Supabase se os dados foram inseridos

### 4. Configurar WhatsApp

1. Configure o webhook do WhatsApp para apontar para o n8n
2. Teste enviando uma mensagem

## System Prompt

O system prompt em `prompts/system_prompt.txt` contem:

- Identidade e tom de voz
- Regras criticas (precos, listas, etc)
- Informacoes fixas (horario, endereco)
- Placeholder `{{context}}` para injecao do RAG

## Funcao de Busca (Supabase RPC)

```sql
search_donna_knowledge(
    query_embedding vector(1536),  -- Embedding da pergunta
    match_threshold FLOAT,          -- Minimo de similaridade (0.7 recomendado)
    match_count INT,                -- Quantidade de resultados (3-5)
    filter_category TEXT            -- Filtro opcional por categoria
)
```

## Categorias de FAQs

- `maquiagem` - Todos os servicos de maquiagem
- `cabelos` - Cortes, mechas, tratamentos, escovas
- `unhas` - Manicure, pedicure, alongamento, nail art
- `cilios` - Extensao de cilios
- `sobrancelhas` - Design, micropigmentacao, brow lamination
- `cursos` - Treinamentos e mentorias
- `geral` - Diferenciais, informacoes gerais

## Ajustes de Performance

### Threshold de Similaridade

- `0.8+` = Apenas respostas muito precisas
- `0.7` = Balanceado (recomendado)
- `0.6` = Mais resultados, menos precisao

### Quantidade de Chunks

- `3` = Rapido, contexto focado
- `5` = Mais contexto, respostas completas
- `10` = Maximo contexto (cuidado com tokens)

## Modelo de Embedding

Usando `text-embedding-3-small` (1536 dimensoes):
- Custo: ~$0.02 por 1M tokens
- Performance: Excelente para portugues
- Alternativa: `text-embedding-3-large` para maior precisao

## Custos Estimados

| Componente | Custo Estimado |
|------------|----------------|
| OpenAI Embeddings | ~$5/mes (10k consultas) |
| OpenAI GPT-4o-mini | ~$20/mes (10k respostas) |
| Supabase Free Tier | $0 (ate 500MB) |
| n8n Self-hosted | $0 |
| **Total** | **~$25/mes** |

## Links Uteis

- [n8n RAG Template](https://n8n.io/workflows/6771-whatsapp-rag-chatbot-with-supabase-gemini-25-flash-and-openai-embeddings/)
- [Supabase pgvector Docs](https://supabase.com/docs/guides/ai)
- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)
