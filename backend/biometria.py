import json
import math
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

import models
from database import get_db


router = APIRouter(
    prefix="/usuarios",
    tags=["Biometría facial"],
)


# ============================================================
# ESQUEMAS
# ============================================================

class DescriptorFacial(BaseModel):
    descriptor: list[float] = Field(
        ...,
        min_length=128,
        max_length=128,
        description="Descriptor facial de 128 valores generado por face-api",
    )


class VerificacionFacial(BaseModel):
    descriptor: list[float] = Field(
        ...,
        min_length=128,
        max_length=128,
        description="Descriptor facial capturado durante el inicio de sesión",
    )


# ============================================================
# DISTANCIA ENTRE DESCRIPTORES
# ============================================================

def calcular_distancia_euclidiana(
    descriptor_a: list[float],
    descriptor_b: list[float],
) -> float:

    if len(descriptor_a) != len(descriptor_b):
        raise ValueError(
            "Los descriptores deben tener la misma dimensión"
        )

    suma = 0.0

    for a, b in zip(descriptor_a, descriptor_b):
        diferencia = a - b
        suma += diferencia * diferencia

    return math.sqrt(suma)


# ============================================================
# REGISTRAR / ACTUALIZAR ROSTRO
# ============================================================

@router.post("/{usuario_id}/rostro")
def guardar_descriptor_facial(
    usuario_id: int,
    datos: DescriptorFacial,
    db: Session = Depends(get_db),
):
    usuario = (
        db.query(models.Usuario)
        .filter(models.Usuario.id == usuario_id)
        .first()
    )

    if usuario is None:
        raise HTTPException(
            status_code=404,
            detail="El usuario no existe",
        )

    if str(usuario.estado).lower() != "activo":
        raise HTTPException(
            status_code=400,
            detail="El usuario no está activo",
        )

    descriptor = datos.descriptor

    if len(descriptor) != 128:
        raise HTTPException(
            status_code=400,
            detail="El descriptor facial debe contener exactamente 128 valores",
        )

    try:
        descriptor_limpio = [
            float(valor)
            for valor in descriptor
        ]
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=400,
            detail="El descriptor contiene valores no numéricos",
        )

    descriptor_json = json.dumps(
        descriptor_limpio,
        separators=(",", ":"),
    )

    fecha_actual = datetime.utcnow()

    rostro_existente = (
        db.query(models.BiometriaFacial)
        .filter(
            models.BiometriaFacial.usuario_id == usuario_id
        )
        .first()
    )

    if rostro_existente:
        rostro_existente.descriptor = descriptor_json
        rostro_existente.fecha_registro = fecha_actual
        accion = "actualizado"

    else:
        nuevo_rostro = models.BiometriaFacial(
            usuario_id=usuario_id,
            descriptor=descriptor_json,
            fecha_registro=fecha_actual,
        )

        db.add(nuevo_rostro)
        accion = "registrado"

    db.commit()

    return {
        "ok": True,
        "mensaje": f"Rostro {accion} correctamente",
        "usuario_id": usuario.id,
        "dni": usuario.dni,
        "nombre": usuario.nombre,
        "rol": usuario.rol,
        "estado": usuario.estado,
        "descriptor_registrado": True,
        "cantidad_valores": len(descriptor_limpio),
        "fecha_registro": fecha_actual.isoformat(),
    }


# ============================================================
# CONSULTAR SI UN USUARIO TIENE ROSTRO
# ============================================================

@router.get("/{usuario_id}/rostro")
def consultar_descriptor_facial(
    usuario_id: int,
    db: Session = Depends(get_db),
):
    usuario = (
        db.query(models.Usuario)
        .filter(models.Usuario.id == usuario_id)
        .first()
    )

    if usuario is None:
        raise HTTPException(
            status_code=404,
            detail="El usuario no existe",
        )

    rostro = (
        db.query(models.BiometriaFacial)
        .filter(
            models.BiometriaFacial.usuario_id == usuario_id
        )
        .first()
    )

    if rostro is None:
        return {
            "usuario_id": usuario.id,
            "dni": usuario.dni,
            "nombre": usuario.nombre,
            "tiene_rostro": False,
            "fecha_registro": None,
        }

    return {
        "usuario_id": usuario.id,
        "dni": usuario.dni,
        "nombre": usuario.nombre,
        "tiene_rostro": True,
        "fecha_registro": rostro.fecha_registro.isoformat(),
    }


# ============================================================
# CONSULTAR USUARIO POR DNI
# ============================================================

@router.get("/biometria/dni/{dni}")
def consultar_usuario_por_dni(
    dni: str,
    db: Session = Depends(get_db),
):
    usuario = (
        db.query(models.Usuario)
        .filter(models.Usuario.dni == dni)
        .first()
    )

    if usuario is None:
        raise HTTPException(
            status_code=404,
            detail="DNI no registrado en MatrixFlow",
        )

    rostro = (
        db.query(models.BiometriaFacial)
        .filter(
            models.BiometriaFacial.usuario_id == usuario.id
        )
        .first()
    )

    return {
        "id": usuario.id,
        "dni": usuario.dni,
        "nombre": usuario.nombre,
        "rol": usuario.rol,
        "estado": usuario.estado,
        "tiene_rostro": rostro is not None,
        "fecha_registro": (
            rostro.fecha_registro.isoformat()
            if rostro
            else None
        ),
    }


# ============================================================
# VERIFICAR ROSTRO
# ============================================================

@router.post("/{usuario_id}/rostro/verificar")
def verificar_rostro(
    usuario_id: int,
    datos: VerificacionFacial,
    db: Session = Depends(get_db),
):
    usuario = (
        db.query(models.Usuario)
        .filter(models.Usuario.id == usuario_id)
        .first()
    )

    if usuario is None:
        raise HTTPException(
            status_code=404,
            detail="El usuario no existe",
        )

    if str(usuario.estado).lower() != "activo":
        raise HTTPException(
            status_code=400,
            detail="El usuario no está activo",
        )

    rostro = (
        db.query(models.BiometriaFacial)
        .filter(
            models.BiometriaFacial.usuario_id == usuario_id
        )
        .first()
    )

    if rostro is None:
        raise HTTPException(
            status_code=404,
            detail="El usuario no tiene un rostro registrado",
        )

    try:
        descriptor_guardado = json.loads(
            rostro.descriptor
        )
    except (json.JSONDecodeError, TypeError):
        raise HTTPException(
            status_code=500,
            detail="El descriptor facial almacenado no es válido",
        )

    if len(descriptor_guardado) != 128:
        raise HTTPException(
            status_code=500,
            detail="El descriptor facial almacenado no tiene 128 valores",
        )

    descriptor_actual = datos.descriptor

    if len(descriptor_actual) != 128:
        raise HTTPException(
            status_code=400,
            detail="El descriptor recibido debe contener exactamente 128 valores",
        )

    try:
        descriptor_actual = [
            float(valor)
            for valor in descriptor_actual
        ]

        descriptor_guardado = [
            float(valor)
            for valor in descriptor_guardado
        ]

    except (ValueError, TypeError):
        raise HTTPException(
            status_code=400,
            detail="El descriptor contiene valores no numéricos",
        )

    distancia = calcular_distancia_euclidiana(
        descriptor_actual,
        descriptor_guardado,
    )

    UMBRAL = 0.60

    coincide = distancia <= UMBRAL

    return {
        "ok": True,
        "coincide": coincide,
        "distancia": round(distancia, 6),
        "umbral": UMBRAL,
        "usuario_id": usuario.id,
        "dni": usuario.dni,
        "nombre": usuario.nombre,
        "rol": usuario.rol,
        "estado": usuario.estado,
    }
