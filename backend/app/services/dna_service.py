import logging
import google.generativeai as genai
try:
    from langfuse.decorators import observe, langfuse_context
except ImportError:
    # Fallback silencioso si no hay credenciales o hay problemas de instalación de langfuse
    def observe(*args, **kwargs):
        def decorator(func):
            return func
        return decorator
    class MockCtx:
        def update_current_observation(self, *args, **kwargs):
            pass
    langfuse_context = MockCtx()
from app.core.config import settings
from app.core.supabase import supabase_client

logger = logging.getLogger(__name__)

# Configuración y fallback para Gemini y Langfuse
try:
    genai.configure(api_key=settings.GEMINI_API_KEY)
except Exception as e:
    logger.warning(f"Error inicializando Gemini: {e}")

class DNAService:
    
    @staticmethod
    @observe()
    def generate_and_save_dna(product_category: str, tone_of_voice: str, target_audience: str, core_values: str) -> str:
        """
        Genera un manual de marca estructurado usando Gemini,
        calcula su embedding y lo guarda en Supabase.
        """
        prompt = f"""
        Eres un Arquitecto de Marca (Brand DNA Architect) experto de clase mundial.
        Se te han proporcionado los siguientes parámetros para una nueva marca o línea de productos:
        - Categoría de Producto: {product_category}
        - Tono de Voz: {tone_of_voice}
        - Público Objetivo: {target_audience}
        - Valores Clave: {core_values}
        
        Tu tarea es generar un "Manual de Marca Estructurado" conciso y directo (máximo 4 párrafos).
        Este manual será almacenado en una base de datos vectorial para ser leído por una IA.
        Asegúrate de detallar las reglas visuales, de tono y restricciones explícitamente.
        """
        
        # Langfuse logging
        langfuse_context.update_current_observation(
            input=prompt,
            model="gemini-3.1-pro-preview",
            tags=["dna-architect", "brand-manual"]
        )
        
        try:
            # 1. Generar texto del manual
            model = genai.GenerativeModel('gemini-3.1-pro-preview')
            response = model.generate_content(prompt)
            generated_manual = response.text
            
            langfuse_context.update_current_observation(output=generated_manual)
            
            # 2. Calcular el embedding
            embedding_result = genai.embed_content(
                model="models/gemini-embedding-001",
                content=generated_manual,
                task_type="retrieval_document"
            )
            embedding_vector = embedding_result['embedding'][:768]
            
            # 3. Guardar en Supabase
            if supabase_client:
                # Se inserta en brand_manual_vectors
                res = supabase_client.table("brand_manual_vectors").insert({
                    "content": generated_manual,
                    "embedding": embedding_vector
                }).execute()
                
                # Obtener el ID insertado (opcional, para retorno)
                # La tabla genera un UUID por defecto.
            else:
                logger.warning("Supabase no conectado. No se pudo guardar el vector del manual.")
                
            return generated_manual
            
        except Exception as e:
            logger.error(f"Error en DNAService: {e}")
            langfuse_context.update_current_observation(level="ERROR", status_message=str(e))
            raise e
