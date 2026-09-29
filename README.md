# FaceSecure Enterprise - Sistema de Reconocimiento Facial

Plataforma de validación de identidad y auditoría de accesos.

## Tecnologías Utilizadas
- **Backend:** FastAPI, Python, SQLAlchemy, PostgreSQL.
- **Frontend:** React (Vite), TypeScript, Tailwind CSS v4, Lucide Icons.

## Pasos para Ejecutar el Proyecto

### 1. Iniciar el Backend (FastAPI)
```bash
cd backend
.venv\Scripts\activate
python seed.py
uvicorn main:app --reload --port 8000