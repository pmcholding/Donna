-- ============================================
-- DONNA SALAO DE BELEZA - RAG Schema
-- Supabase + pgvector
-- ============================================

-- 1. Habilitar extensao pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Criar tabela de documentos/chunks
CREATE TABLE IF NOT EXISTS donna_knowledge (
    id BIGSERIAL PRIMARY KEY,

    -- Conteudo
    question TEXT,                          -- Pergunta (para FAQs)
    answer TEXT NOT NULL,                   -- Resposta/conteudo
    content TEXT NOT NULL,                  -- Texto completo para embedding (question + answer)

    -- Metadata para filtragem
    category TEXT NOT NULL,                 -- maquiagem, cabelos, unhas, cilios, sobrancelhas, geral
    subcategory TEXT,                       -- tecnica especifica
    tags TEXT[],                            -- array de tags para busca
    service_type TEXT,                      -- servico, procedimento, produto, curso, info

    -- Embedding (usando text-embedding-3-small com 1536 dims)
    -- Pode usar halfvec para economizar espaco
    embedding vector(1536),

    -- Controle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- 3. Criar indice HNSW para busca vetorial rapida
CREATE INDEX IF NOT EXISTS donna_knowledge_embedding_idx
ON donna_knowledge
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 4. Criar indice para filtragem por categoria
CREATE INDEX IF NOT EXISTS donna_knowledge_category_idx
ON donna_knowledge (category);

-- 5. Criar indice para tags (GIN para arrays)
CREATE INDEX IF NOT EXISTS donna_knowledge_tags_idx
ON donna_knowledge USING GIN (tags);

-- 6. Funcao RPC para busca semantica
CREATE OR REPLACE FUNCTION search_donna_knowledge(
    query_embedding vector(1536),
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 5,
    filter_category TEXT DEFAULT NULL
)
RETURNS TABLE (
    id BIGINT,
    question TEXT,
    answer TEXT,
    category TEXT,
    subcategory TEXT,
    tags TEXT[],
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dk.id,
        dk.question,
        dk.answer,
        dk.category,
        dk.subcategory,
        dk.tags,
        1 - (dk.embedding <=> query_embedding) AS similarity
    FROM donna_knowledge dk
    WHERE
        dk.is_active = TRUE
        AND (filter_category IS NULL OR dk.category = filter_category)
        AND 1 - (dk.embedding <=> query_embedding) > match_threshold
    ORDER BY dk.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- 7. Funcao para busca hibrida (texto + vetor)
CREATE OR REPLACE FUNCTION search_donna_hybrid(
    query_embedding vector(1536),
    query_text TEXT,
    match_threshold FLOAT DEFAULT 0.6,
    match_count INT DEFAULT 5
)
RETURNS TABLE (
    id BIGINT,
    question TEXT,
    answer TEXT,
    category TEXT,
    similarity FLOAT,
    text_match BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dk.id,
        dk.question,
        dk.answer,
        dk.category,
        1 - (dk.embedding <=> query_embedding) AS similarity,
        dk.content ILIKE '%' || query_text || '%' AS text_match
    FROM donna_knowledge dk
    WHERE
        dk.is_active = TRUE
        AND (
            1 - (dk.embedding <=> query_embedding) > match_threshold
            OR dk.content ILIKE '%' || query_text || '%'
        )
    ORDER BY
        (1 - (dk.embedding <=> query_embedding)) DESC,
        dk.content ILIKE '%' || query_text || '%' DESC
    LIMIT match_count;
END;
$$;

-- 8. Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER donna_knowledge_updated_at
    BEFORE UPDATE ON donna_knowledge
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- 9. (Opcional) Row Level Security
-- ALTER TABLE donna_knowledge ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public read" ON donna_knowledge FOR SELECT USING (is_active = TRUE);

-- ============================================
-- EXEMPLO DE INSERT
-- ============================================
-- INSERT INTO donna_knowledge (question, answer, content, category, subcategory, tags, service_type, embedding)
-- VALUES (
--     'O Donna faz maquiagem para noivas?',
--     'Sim, e uma das nossas maiores especialidades. O Donna oferece o servico completo de maquiagem de noiva com teste previo, consultoria de estilo, preparacao de pele e produtos hipoalergenicos de alta definicao.',
--     'O Donna faz maquiagem para noivas? Sim, e uma das nossas maiores especialidades. O Donna oferece o servico completo de maquiagem de noiva com teste previo, consultoria de estilo, preparacao de pele e produtos hipoalergenicos de alta definicao.',
--     'maquiagem',
--     'noiva',
--     ARRAY['noiva', 'casamento', 'maquiagem', 'evento'],
--     'servico',
--     '[embedding vector here]'
-- );
