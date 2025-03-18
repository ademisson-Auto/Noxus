-- Migração para corrigir o schema da tabela annotations
-- Altera as colunas user_id, book_id, chapter_id e position para NOT NULL

-- Primeiro, verificar se a tabela existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'annotations') THEN
        -- Alterar a coluna user_id para NOT NULL
        ALTER TABLE public.annotations 
        ALTER COLUMN user_id SET NOT NULL;
        
        -- Alterar a coluna book_id para NOT NULL
        ALTER TABLE public.annotations 
        ALTER COLUMN book_id SET NOT NULL;
        
        -- Alterar a coluna chapter_id para NOT NULL
        ALTER TABLE public.annotations 
        ALTER COLUMN chapter_id SET NOT NULL;
        
        -- Alterar a coluna position para NOT NULL
        ALTER TABLE public.annotations 
        ALTER COLUMN position SET NOT NULL;
        
        RAISE NOTICE 'Tabela annotations atualizada com sucesso!';
    ELSE
        RAISE NOTICE 'A tabela annotations não existe. Nenhuma alteração foi feita.';
    END IF;
END
$$; 