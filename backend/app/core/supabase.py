import logging
from supabase import create_client, Client
from app.core.config import settings
from typing import Optional

logger = logging.getLogger(__name__)

def get_supabase_client() -> Optional[Client]:
    """
    Crea y retorna el cliente de Supabase para operaciones de base de datos y vector search.
    Si no hay credenciales configuradas en el entorno, retorna None para no bloquear
    el arranque del servidor local durante el desarrollo temprano.
    """
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        logger.warning("Faltan credenciales de Supabase en .env (SUPABASE_URL / SUPABASE_KEY).")
        return None
    
    try:
        return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    except Exception as e:
        logger.error(f"Error inicializando el cliente Supabase: {str(e)}")
        return None

# Instancia global del cliente de base de datos para usar en los servicios
supabase_client = get_supabase_client()
