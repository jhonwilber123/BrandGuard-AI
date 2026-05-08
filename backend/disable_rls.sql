-- Desactivar RLS para que la API pueda leer y escribir con la llave anónima
alter table content_assets disable row level security;
alter table brand_manual_vectors disable row level security;
