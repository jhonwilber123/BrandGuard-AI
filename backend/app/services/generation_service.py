import google.generativeai as genai
from app.core.config import settings
from app.services.rag_service import RAGService
import logging
try:
    from langfuse.decorators import observe, langfuse_context
except ImportError:
    def observe(*args, **kwargs):
        def decorator(func): return func
        return decorator
    class MockCtx:
        def update_current_observation(self, **kwargs): pass
    langfuse_context = MockCtx()

logger = logging.getLogger(__name__)

class GenerationService:
    @staticmethod
    @observe()  # Decorador para trazar la ejecución en Langfuse
    def generate_content(product_name: str, tone: str, target_audience: str, additional_instructions: str = "") -> str:
        """
        Genera contenido (copy) inyectando el contexto de marca (RAG).
        """
        # 1. Recuperar contexto de la marca
        query = f"{product_name} con tono {tone} para {target_audience}"
        brand_context = RAGService.retrieve_brand_context(query)
        
        # 2. Construir el prompt
        prompt = f"""
Eres un experto copywriter publicitario. Tu tarea es redactar el copy promocional para el producto '{product_name}'.
El tono debe ser estrictamente '{tone}' y el texto está dirigido a '{target_audience}'.

A continuación, tienes las reglas oficiales extraídas del MANUAL DE MARCA que DEBES respetar obligatoriamente:
<brand_rules>
{brand_context}
</brand_rules>

Instrucciones adicionales del creador: {additional_instructions}

Redacta el copy ahora, cumpliendo todas las reglas y prohibiciones del manual:
"""     
        # Registrar metadatos de la llamada en Langfuse
        langfuse_context.update_current_observation(
            input=prompt,
            model="gemini-3.1-pro-preview",
            tags=["creative-engine", "rag-generation"]
        )
        
        try:
            if settings.MOCK_LLM_RESPONSE:
                mock_res = f"Mock Content for {product_name} targeting {target_audience} in a {tone} tone. (Context used: {bool(brand_context)})"
                
                langfuse_context.update_current_observation(output=mock_res)
                return mock_res
                
            model = genai.GenerativeModel('gemini-3.1-pro-preview')
            response = model.generate_content(prompt)
            
            # Trazar la salida generada
            langfuse_context.update_current_observation(output=response.text)
            
            return response.text
            
        except Exception as e:
            logger.error(f"Error en GenerationService: {e}")
            langfuse_context.update_current_observation(level="ERROR", status_message=str(e))
            raise e
