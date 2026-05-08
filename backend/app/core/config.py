import os
from pydantic import BaseModel
from dotenv import load_dotenv

# Cargar las variables de entorno desde el archivo .env
load_dotenv()

class Settings(BaseModel):
    """
    Configuración centralizada de la aplicación.
    Extrae los valores de las variables de entorno para su fácil uso en toda la app.
    """
    PROJECT_NAME: str = "Content Suite - BrandGuard AI"
    VERSION: str = "1.0.0"
    
    # Gemini (Google AI Studio)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Supabase (Base de datos y Vector Store)
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    
    # Langfuse (Observabilidad)
    LANGFUSE_PUBLIC_KEY: str = os.getenv("LANGFUSE_PUBLIC_KEY", "")
    LANGFUSE_SECRET_KEY: str = os.getenv("LANGFUSE_SECRET_KEY", "")
    LANGFUSE_HOST: str = os.getenv("LANGFUSE_HOST", "https://cloud.langfuse.com")

# Instancia global de las configuraciones
settings = Settings()
