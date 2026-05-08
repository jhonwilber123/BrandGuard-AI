from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum

class RoleEnum(str, Enum):
    CREATOR = "creator"
    APPROVER_A = "approver_a"
    APPROVER_B = "approver_b"

class ContentStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

# --- Models for Auth ---
class UserLogin(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: RoleEnum

# --- Models for Content Generation ---
class ContentRequest(BaseModel):
    product_name: str = Field(..., description="Nombre del producto, ej: Snack saludable de quinua")
    tone: str = Field(..., description="Tono de la comunicación, ej: Divertido pero profesional")
    target_audience: str = Field(..., description="Público objetivo, ej: Gen Z")
    additional_instructions: Optional[str] = Field(default="", description="Instrucciones extra opcionales")

class ContentResponse(BaseModel):
    content_id: str
    generated_text: str
    status: ContentStatus
    
# --- Models for Audit ---
# Nota: La subida de imágenes se maneja a nivel de endpoint con UploadFile de FastAPI.
# Este modelo es para la respuesta estructurada de la auditoría.
class AuditResponse(BaseModel):
    is_approved: bool = Field(..., description="Verdadero si cumple el manual de marca, falso en caso contrario")
    explanation: str = Field(..., description="Explicación detallada del porqué fue aprobado o rechazado")

# --- Models for DNA Architect ---
class DNARequest(BaseModel):
    product_category: str = Field(..., description="Categoría del producto, ej: Snack saludable de quinua")
    tone_of_voice: str = Field(..., description="Tono de la comunicación, ej: Divertido pero profesional")
    target_audience: str = Field(..., description="Público objetivo, ej: Gen Z")
    core_values: str = Field(..., description="Valores clave de la marca, ej: Sostenibilidad, Innovación")

class DNAResponse(BaseModel):
    dna_id: str = Field(..., description="UUID del manual de marca generado")
    generated_manual: str = Field(..., description="El contenido del manual generado por la IA")
