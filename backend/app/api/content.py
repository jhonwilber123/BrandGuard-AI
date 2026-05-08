from fastapi import APIRouter, HTTPException, Depends
import uuid
from app.models.schemas import ContentRequest, ContentResponse, ContentStatus
from app.services.generation_service import GenerationService
from app.core.supabase import supabase_client
from app.api.auth import require_role
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/generate", response_model=ContentResponse)
def generate_creative_content(
    request: ContentRequest,
    user=Depends(require_role(["creator"]))
):
    """
    Endpoint para el rol Creador (Creative Engine).
    Llama a GenerationService, inyecta RAG y genera contenido.
    Guarda el activo generado en base de datos con estado PENDING.
    """
    try:
        # Generar texto usando el LLM guiado por el manual de marca
        generated_text = GenerationService.generate_content(
            product_name=request.product_name,
            tone=request.tone,
            target_audience=request.target_audience,
            additional_instructions=request.additional_instructions
        )
        
        content_id = str(uuid.uuid4())
        status = ContentStatus.PENDING
        
        # Persistir el contenido generado en Supabase
        if supabase_client:
            supabase_client.table("content_assets").insert({
                "id": content_id,
                "product_name": request.product_name,
                "generated_text": generated_text,
                "status": status.value
            }).execute()
        else:
            logger.warning("No guardando en base de datos debido a falta de conexión Supabase.")
            
        return ContentResponse(
            content_id=content_id,
            generated_text=generated_text,
            status=status
        )
    except Exception as e:
        logger.error(f"Error al procesar la petición de contenido: {e}")
        raise HTTPException(status_code=500, detail="Error interno durante la generación de contenido.")
