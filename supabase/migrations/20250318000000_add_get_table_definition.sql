-- Função para obter a definição das colunas de uma tabela
CREATE OR REPLACE FUNCTION public.get_table_definition(p_table_name text)
RETURNS TABLE (
  column_name text,
  data_type text,
  is_nullable boolean,
  column_default text,
  character_maximum_length integer
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    c.column_name::text,
    c.data_type::text,
    (c.is_nullable = 'YES')::boolean as is_nullable,
    c.column_default::text,
    c.character_maximum_length
  FROM 
    information_schema.columns c
  WHERE 
    c.table_schema = 'public' 
    AND c.table_name = p_table_name
  ORDER BY 
    c.ordinal_position;
$$;

-- Conceder permissões à função
GRANT EXECUTE ON FUNCTION public.get_table_definition TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_table_definition TO anon;
GRANT EXECUTE ON FUNCTION public.get_table_definition TO service_role;

-- Criar tabela annotations se não existir
CREATE TABLE IF NOT EXISTS annotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE,
  chapter_id uuid REFERENCES chapters(id) ON DELETE CASCADE,
  content text NOT NULL,
  position integer NOT NULL,
  color text DEFAULT '#FFEB3B',
  category text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS na tabela
ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;

-- Criar política apenas se não existir (verificando antes)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'annotations' 
    AND policyname = 'Usuários podem gerenciar suas próprias anotações'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Usuários podem gerenciar suas próprias anotações"
        ON annotations
        FOR ALL
        TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id)
    $policy$;
  END IF;
END
$$; 