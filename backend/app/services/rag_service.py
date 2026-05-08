import google.generativeai as genai
from app.core.config import settings
from app.core.supabase import supabase_client
import logging

logger = logging.getLogger(__name__)

# Configurar el SDK de Gemini
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

class RAGService:
    @staticmethod
    def get_embedding(text: str) -> list[float]:
        """
        Genera el embedding vectorial de un texto usando Gemini.
        """
        try:
            if not settings.GEMINI_API_KEY:
                logger.warning("No Gemini API KEY found. Returning empty embedding.")
                return []
                
            result = genai.embed_content(
                model="models/gemini-embedding-001",
                content=text,
                task_type="retrieval_document"
            )
            return result.get('embedding', [])[:768]
        except Exception as e:
            logger.error(f"Error al generar embedding: {e}")
            return []

    @staticmethod
    def retrieve_brand_context(query: str, limit: int = 3) -> str:
        """
        Busca en Supabase fragmentos relevantes del manual de marca
        utilizando similitud de vectores con pgvector.
        """
        if not supabase_client:
            return "No database connection. Cannot retrieve brand rules."
            
        embedding = RAGService.get_embedding(query)
        if not embedding:
            return "No se pudo generar embedding de búsqueda."
            
        try:
            # Llamamos a una RPC function en Supabase asumiendo que el usuario
            # creará la función en postgres. 
            response = supabase_client.rpc(
                'match_brand_manuals',
                {'query_embedding': embedding, 'match_threshold': 0.7, 'match_count': limit}
            ).execute()
            
            if response.data:
                # Concatenar los textos encontrados para alimentar el LLM
                context = "\n---\n".join([item['content'] for item in response.data])
                return context
            return "No se encontraron reglas específicas en el manual para este contexto."
            
        except Exception as e:
            logger.error(f"Error recuperando contexto RAG: {e}")
            return "Error al consultar las reglas de la marca."
