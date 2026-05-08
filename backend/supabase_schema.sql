-- Habilitar la extensión de vectores
create extension if not exists vector;

-- Crear tabla para los fragmentos del manual de marca
create table if not exists brand_manual_vectors (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  embedding vector(768) -- Gemini text-embedding-004 genera vectores de 768 dimensiones
);

-- Crear tabla para el historial de contenido generado (Creative Engine)
create table if not exists content_assets (
  id uuid primary key,
  product_name text not null,
  generated_text text not null,
  status text not null default 'PENDING',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Crear la función RPC para realizar la búsqueda vectorial (Vector Search)
create or replace function match_brand_manuals (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  content text,
  similarity float
)
language sql stable
as $$
  select
    brand_manual_vectors.id,
    brand_manual_vectors.content,
    1 - (brand_manual_vectors.embedding <=> query_embedding) as similarity
  from brand_manual_vectors
  where 1 - (brand_manual_vectors.embedding <=> query_embedding) > match_threshold
  order by brand_manual_vectors.embedding <=> query_embedding
  limit match_count;
$$;

-- Opcional: Insertar un manual de marca de prueba
insert into brand_manual_vectors (content, embedding)
values (
  'Reglas Visuales: El logo siempre debe tener un tamaño mínimo de 50px y nunca deformarse. Colores: Azul marino y dorado.',
  array_fill(0.01, array[768])::vector -- Vector simulado
),
(
  'Tono de voz: La marca es divertida, empática y cercana para la Generación Z, pero nunca utiliza lenguaje vulgar.',
  array_fill(0.02, array[768])::vector -- Vector simulado
);
