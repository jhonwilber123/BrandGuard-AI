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
import json
import re

logger = logging.getLogger(__name__)

class AuditService:
    @staticmethod
    @observe()  # Decorador para métricas en Langfuse
    def audit_image(image_bytes: bytes, mime_type: str, product_context: str) -> tuple[bool, str]:
        """
        Audita una imagen comprobando que cumple con el manual de marca usando Gemini 1.5 Pro Multimodal.
        """
        # 1. Recuperar contexto visual del manual de marca vía RAG
        brand_context = RAGService.retrieve_brand_context(f"Reglas visuales, logo y estilo de imagen para {product_context}")
        
        # 2. Construir el prompt multimodal
        prompt = f"""
Eres un auditor experto en consistencia de marca (Brand Guardian). Tu objetivo es evaluar la imagen adjunta.
Debes verificar si la imagen cumple con el siguiente manual de marca:

<brand_rules>
{brand_context}
</brand_rules>

Contexto de la evaluación: {product_context}

Debes responder estrictamente en formato JSON con la siguiente estructura:
{{
    "is_approved": true o false,
    "explanation": "Explicación detallada de por qué se aprueba o rechaza según el manual de marca."
}}
"""
        # Registrar metadatos en Langfuse
        langfuse_context.update_current_observation(
            input=prompt,
            model="gemini-3.1-pro-preview",
            tags=["multimodal-audit", "vision"]
        )
        
        try:
            if settings.MOCK_LLM_RESPONSE:
                mock_res = {
                    "is_approved": True,
                    "explanation": "Mock Audit: The image complies with the brand rules."
                }
                langfuse_context.update_current_observation(output=json.dumps(mock_res))
                return mock_res["is_approved"], mock_res["explanation"]

            # Inicializar modelo
            model = genai.GenerativeModel('gemini-3.1-pro-preview')
            # Estructurar la imagen para la API de Gemini
            image_part = {
                "mime_type": mime_type,
                "data": image_bytes
            }
            
            # Llamada multimodal: array de contenido texto + datos binarios
            response = model.generate_content([prompt, image_part])
            
            text_response = response.text
            langfuse_context.update_current_observation(output=text_response)
            
            # 3. Parsear el JSON de la respuesta devuelta por Gemini
            json_match = re.search(r'\{.*\}', text_response, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
                return result.get("is_approved", False), result.get("explanation", "Sin explicación clara.")
            
            # Fallback en caso de que la respuesta no tenga el formato esperado
            return False, f"La evaluación falló por formato de respuesta inválido: {text_response}"
            
        except Exception as e:
            logger.error(f"Error en AuditService: {e}")
            langfuse_context.update_current_observation(level="ERROR", status_message=str(e))
            raise e
