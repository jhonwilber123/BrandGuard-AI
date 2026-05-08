from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

# Inicialización de la aplicación FastAPI
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API Backend para orquestar la generación de contenido y auditoría multimodal con RAG",
    version=settings.VERSION,
)

# Configuración de CORS
# Permitimos que cualquier origen se conecte para facilitar el desarrollo con el frontend en React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, reemplazar por el dominio exacto del Frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    """
    Endpoint de salud para verificar que el servidor está corriendo correctamente.
    """
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "message": "BrandGuard AI Backend is running."
    }

# Registrar Enrutadores
from app.api import auth, content, audit, dna

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(dna.router, prefix="/api/v1/dna", tags=["DNA Architect"])
app.include_router(content.router, prefix="/api/v1/content", tags=["Content"])
app.include_router(audit.router, prefix="/api/v1/audit", tags=["Audit"])
