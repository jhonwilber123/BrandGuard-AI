from fastapi import APIRouter, HTTPException, Depends
import uuid
from app.models.schemas import DNARequest, DNAResponse
from app.services.dna_service import DNAService
from app.api.auth import require_role
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/generate", response_model=DNAResponse)
def create_brand_dna(
    request: DNARequest,
    user=Depends(require_role(["approver_a"]))
):
    """
    Endpoint para el rol Aprobador A (Brand Manager).
    Genera el ADN de la marca y lo guarda en Supabase (vectorizado).
    """
    try:
        generated_manual = DNAService.generate_and_save_dna(
            product_category=request.product_category,
            tone_of_voice=request.tone_of_voice,
            target_audience=request.target_audience,
            core_values=request.core_values
        )
        
        dna_id = str(uuid.uuid4())
        
        return DNAResponse(
            dna_id=dna_id,
            generated_manual=generated_manual
        )
    except Exception as e:
        logger.error(f"Error al procesar la petición de DNA Architect: {e}")
        raise HTTPException(status_code=500, detail="Error interno durante la generación del manual de marca.")
