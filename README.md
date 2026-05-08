# BrandGuard AI - Content Suite 🛡️✨

**BrandGuard AI** es una plataforma integral de consistencia de marca (Content Suite) construida para solucionar los cuellos de botella en la delegación de tareas creativas a gran escala. Utiliza un ecosistema de agentes, **RAG Multimodal**, y Gobernanza de Datos (RBAC) para garantizar que todo el contenido (texto e imágenes) respete las reglas visuales y de tono de una marca.

Este proyecto fue desarrollado como respuesta al reto técnico **PREDIQT - Gen AI**.

---

## 🏗️ Arquitectura del Sistema (Full-Stack AI)

La solución ha sido construida bajo una arquitectura modular y desacoplada, utilizando las herramientas más modernas y escalables:

- **Frontend:** React + Vite (Despliegue ultrarrápido y testing con Vitest & Playwright).
- **Backend:** FastAPI (Python) para la orquestación de Agentes, Control de Acceso (RBAC) y API REST de alto rendimiento.
- **Base de Datos & Vector Store:** Supabase con `pgvector` para persistencia relacional y búsqueda semántica avanzada.
- **Modelos IA (LLM y Visión):** Google Gemini 3.1 Pro Preview. Elegido por su velocidad, bajo costo y capacidad nativa multimodal (texto, embeddings y visión por computadora).
- **Observabilidad:** Langfuse integrado en la capa de servicios para trazabilidad de prompts, costos y latencias.
- **QA & CI/CD:** Suite de pruebas End-to-End con Pytest (Backend, Coverage: 84%) y Github Actions Pipeline automatizado.

---

## 🧩 Módulos Implementados

### Módulo I: Brand DNA Architect (La Fuente de Verdad)
Interfaz reservada para el Brand Manager (**Aprobador A**). Permite ingresar parámetros del negocio (Público Objetivo, Categoría, Valores) para que la IA estructure un Manual de Marca. Este manual es vectorizado (`gemini-embedding-001`) e insertado dinámicamente en Supabase.

### Módulo II: Creative Engine (Generación Coherente)
El **Creador** utiliza este motor para redactar copys. Antes de generar el texto, el sistema hace una consulta **RAG** a Supabase, recuperando las reglas del manual para que el contenido generado respete estrictamente el tono y las restricciones de la marca.

### Módulo III: Governance & Multimodal Audit (El Guardián)
El **Aprobador B** (Auditor Visual) sube las piezas creativas (imágenes). La plataforma orquesta una llamada a **Gemini Vision**, quien actúa como un Agente de QA Visual, contrastando la imagen contra las reglas del manual escrito y devolviendo una explicación clara de aprobación o rechazo.

---

## 🔐 Roles y Credenciales de Prueba

El sistema implementa Control de Acceso Basado en Roles (RBAC) a nivel de API (Middleware) y Frontend (Renderizado Condicional):

| Rol | Usuario (Mock) | Contraseña | Acceso a Módulo |
| :--- | :--- | :--- | :--- |
| **Creador** | `creador1` | `pwd` | Módulo II (Creative Engine) |
| **Aprobador A** (Brand Manager) | `aprobador1` | `pwd` | Módulo I (Brand DNA Architect) |
| **Aprobador B** (Auditor) | `aprobador2` | `pwd` | Módulo III (Multimodal Audit) |

---

## 🚀 Instalación y Ejecución Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/jhonwilber123/BrandGuard-AI.git
cd BrandGuard-AI
```

### 2. Backend (FastAPI)
Requiere Python 3.10+.
```bash
cd backend
python -m venv venv
# Activar entorno (Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate)
pip install -r requirements.txt

# Copiar el archivo .env.example a .env y llenar las credenciales de Supabase, Gemini y Langfuse
cp .env.example .env

# Ejecutar el servidor
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend (React)
Requiere Node.js 18.19+.
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing y QA Avanzado

La aplicación está respaldada por una robusta suite de pruebas unitarias y End-to-End.
- **Backend (Pytest):** Ejecutar `pytest --cov=app tests/` para correr las 8 pruebas integrales de orquestación IA y seguridad RBAC.
- **Frontend (Vitest):** Ejecutar `npm run test` y `npm run coverage` para validar la reactividad de la interfaz.
- **E2E (Playwright):** Ejecutar `npx playwright test` para pruebas completas en navegador (requiere Chromium y Node >= 18.19).

---

## 📈 Siguientes Pasos (Roadmap a Producción)
1. **Autenticación Real:** Migrar el sistema de tokens simulados a OAuth2 integrado con Supabase Auth.
2. **Multi-Tenant:** Implementar particionamiento de la base de datos vectorial para soportar múltiples marcas y agencias concurrentes.

*Desarrollado con ♥ para el reto técnico de PREDIQT.*
