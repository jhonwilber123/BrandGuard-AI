from fastapi import APIRouter, HTTPException, Header, Depends
from app.models.schemas import UserLogin, TokenResponse, RoleEnum

router = APIRouter()

# Base de datos mockeada de usuarios para demostrar el RBAC requerido
MOCK_USERS = {
    "creador1": {"password": "pwd", "role": RoleEnum.CREATOR},
    "aprobador1": {"password": "pwd", "role": RoleEnum.APPROVER_A},
    "aprobador2": {"password": "pwd", "role": RoleEnum.APPROVER_B},
}

@router.post("/login", response_model=TokenResponse)
def login(user: UserLogin):
    """
    Endpoint de inicio de sesión simulado.
    Valida credenciales estáticas y devuelve un token con el rol del usuario.
    """
    db_user = MOCK_USERS.get(user.username)
    
    if not db_user or db_user["password"] != user.password:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
        
    return TokenResponse(
        access_token=f"mock_token_{user.username}",
        token_type="bearer",
        role=db_user["role"]
    )

def require_role(allowed_roles: list[str]):
    def role_checker(authorization: str = Header(None)):
        if not authorization or not authorization.startswith("Bearer mock_token_"):
            raise HTTPException(status_code=401, detail="No autenticado")
        username = authorization.split("mock_token_")[1]
        user = MOCK_USERS.get(username)
        if not user or user["role"].value not in allowed_roles:
            raise HTTPException(status_code=403, detail="No tienes permisos para esta acción.")
        return user
    return role_checker
