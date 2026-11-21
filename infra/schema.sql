-- Schema para triagem de chamados com IA
-- Executado automaticamente pelo docker-compose no primeiro start

CREATE TABLE IF NOT EXISTS chamados_classificados (
    id SERIAL PRIMARY KEY,
    id_chamado VARCHAR(50) UNIQUE NOT NULL,
    texto_original TEXT NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    prioridade VARCHAR(50) NOT NULL,
    filial VARCHAR(100),
    sistema VARCHAR(100),
    resumo TEXT,
    confianca NUMERIC(3,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'classificado',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modelo_usado VARCHAR(100),
    custo_usd NUMERIC(10,6),
    tempo_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chamados_nao_classificados (
    id SERIAL PRIMARY KEY,
    id_chamado VARCHAR(50) UNIQUE NOT NULL,
    texto_original TEXT NOT NULL,
    tentativas INTEGER DEFAULT 1,
    erro_ultimo TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS revisao_humana (
    id SERIAL PRIMARY KEY,
    id_chamado VARCHAR(50) UNIQUE NOT NULL,
    texto_original TEXT NOT NULL,
    categoria_prevista VARCHAR(50),
    prioridade_prevista VARCHAR(50),
    filial_prevista VARCHAR(100),
    sistema_prevista VARCHAR(100),
    resumo_previsto TEXT,
    confianca_prevista NUMERIC(3,2),
    categoria_corrigida VARCHAR(50),
    prioridade_corrigida VARCHAR(50),
    filial_corrigida VARCHAR(100),
    sistema_corrigida VARCHAR(100),
    resumo_corrigido TEXT,
    confianca_corrigida NUMERIC(3,2),
    comentario TEXT,
    revisado_por VARCHAR(100),
    revisado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_chamados_categoria ON chamados_classificados(categoria);
CREATE INDEX IF NOT EXISTS idx_chamados_prioridade ON chamados_classificados(prioridade);
CREATE INDEX IF NOT EXISTS idx_chamados_filial ON chamados_classificados(filial);
CREATE INDEX IF NOT EXISTS idx_chamados_status ON chamados_classificados(status);
CREATE INDEX IF NOT EXISTS idx_chamados_criado_em ON chamados_classificados(criado_em);