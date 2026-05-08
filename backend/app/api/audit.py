from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from app.models.schemas import AuditResponse
from app.services.audit_service import AuditService
from app.api.auth import require_role
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/audit-image", response_model=AuditResponse)
async def audit_brand_image(
    product_context: str = Form(..., description="Contexto del producto (ej: Snack de quinua gen Z)"),
    file: UploadFile = File(..., description="Imagen a auditar contra el manual de marca"),
    user=Depends(require_role(["approver_a", "approver_b"]))
):
    """
    Endpoint para los roles Aprobadores (Governance & Multimodal Audit).
    Recibe una imagen por Form-Data y el contexto del producto.
    Audita que la imagen cumpla con las directrices visuales de la marca.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="El archivo proporcionado no es una imagen válida.")
        
    try:
        # Leer el contenido del archivo en memoria sin guardarlo en disco
        image_bytes = await file.read()
        mime_type = file.content_type
        
        # Procesar usando el servicio multimodal
        is_approved, explanation = AuditService.audit_image(
            image_bytes=image_bytes,
            mime_type=mime_type,
            product_context=product_context
        )
        
        return AuditResponse(
            is_approved=is_approved,
            explanation=explanation
        )
    except Exception as e:
        logger.error(f"Error al procesar la auditoría de la imagen: {e}")
        raise HTTPException(status_code=500, detail="Error interno durante la auditoría multimodal.")
