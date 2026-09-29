from pathlib import Path
import json
import math
import sqlite3
from datetime import datetime

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field


BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BASE_DIR / "matrixflow.db"


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
# BASE DE DATOS
# ============================================================

def obtener_conexion():
    conexion = sqlite3.connect(str(DATABASE_PATH))
    conexion.row_factory = sqlite3.Row
    return conexion


def crear_tabla_biometria():
    conexion = obtener_conexion()

    try:
        conexion.execute(
            """
            CREATE TABLE IF NOT EXISTS biometria_facial (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER NOT NULL UNIQUE,
                descriptor TEXT NOT NULL,
                fecha_registro TEXT NOT NULL,
                FOREIGN KEY (usuario_id)
                    REFERENCES usuarios(id)
            )
            """
        )

        conexion.commit()

    finally:
        conexion.close()


crear_tabla_biometria()


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
):
    conexion = obtener_conexion()

    try:
        usuario = conexion.execute(
            """
            SELECT
                id,
                dni,
                nombre,
                rol,
                estado
            FROM usuarios
            WHERE id = ?
            """,
            (usuario_id,),
        ).fetchone()

        if usuario is None:
            raise HTTPException(
                status_code=404,
                detail="El usuario no existe",
            )

        if str(usuario["estado"]).lower() != "activo":
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

        fecha_actual = datetime.now().isoformat()

        rostro_existente = conexion.execute(
            """
            SELECT id
            FROM biometria_facial
            WHERE usuario_id = ?
            """,
            (usuario_id,),
        ).fetchone()

        if rostro_existente:

            conexion.execute(
                """
                UPDATE biometria_facial
                SET
                    descriptor = ?,
                    fecha_registro = ?
                WHERE usuario_id = ?
                """,
                (
                    descriptor_json,
                    fecha_actual,
                    usuario_id,
                ),
            )

            accion = "actualizado"

        else:

            conexion.execute(
                """
                INSERT INTO biometria_facial (
                    usuario_id,
                    descriptor,
                    fecha_registro
                )
                VALUES (?, ?, ?)
                """,
                (
                    usuario_id,
                    descriptor_json,
                    fecha_actual,
                ),
            )

            accion = "registrado"

        conexion.commit()

        return {
            "ok": True,
            "mensaje": f"Rostro {accion} correctamente",
            "usuario_id": usuario["id"],
            "dni": usuario["dni"],
            "nombre": usuario["nombre"],
            "rol": usuario["rol"],
            "estado": usuario["estado"],
            "descriptor_registrado": True,
            "cantidad_valores": len(descriptor_limpio),
            "fecha_registro": fecha_actual,
        }

    except HTTPException:
        raise

    except sqlite3.Error as error:
        conexion.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Error de base de datos: {error}",
        )

    finally:
        conexion.close()


# ============================================================
# CONSULTAR SI UN USUARIO TIENE ROSTRO
# ============================================================

@router.get("/{usuario_id}/rostro")
def consultar_descriptor_facial(usuario_id: int):
    conexion = obtener_conexion()

    try:
        usuario = conexion.execute(
            """
            SELECT
                id,
                dni,
                nombre,
                rol,
                estado
            FROM usuarios
            WHERE id = ?
            """,
            (usuario_id,),
        ).fetchone()

        if usuario is None:
            raise HTTPException(
                status_code=404,
                detail="El usuario no existe",
            )

        rostro = conexion.execute(
            """
            SELECT
                id,
                fecha_registro
            FROM biometria_facial
            WHERE usuario_id = ?
            """,
            (usuario_id,),
        ).fetchone()

        if rostro is None:
            return {
                "usuario_id": usuario["id"],
                "dni": usuario["dni"],
                "nombre": usuario["nombre"],
                "tiene_rostro": False,
                "fecha_registro": None,
            }

        return {
            "usuario_id": usuario["id"],
            "dni": usuario["dni"],
            "nombre": usuario["nombre"],
            "tiene_rostro": True,
            "fecha_registro": rostro["fecha_registro"],
        }

    finally:
        conexion.close()


# ============================================================
# CONSULTAR USUARIO POR DNI
# ============================================================

@router.get("/biometria/dni/{dni}")
def consultar_usuario_por_dni(dni: str):
    conexion = obtener_conexion()

    try:
        usuario = conexion.execute(
            """
            SELECT
                id,
                dni,
                nombre,
                rol,
                estado
            FROM usuarios
            WHERE dni = ?
            """,
            (dni,),
        ).fetchone()

        if usuario is None:
            raise HTTPException(
                status_code=404,
                detail="DNI no registrado en MatrixFlow",
            )

        rostro = conexion.execute(
            """
            SELECT
                id,
                fecha_registro
            FROM biometria_facial
            WHERE usuario_id = ?
            """,
            (usuario["id"],),
        ).fetchone()

        return {
            "id": usuario["id"],
            "dni": usuario["dni"],
            "nombre": usuario["nombre"],
            "rol": usuario["rol"],
            "estado": usuario["estado"],
            "tiene_rostro": rostro is not None,
            "fecha_registro": (
                rostro["fecha_registro"]
                if rostro
                else None
            ),
        }

    finally:
        conexion.close()


# ============================================================
# VERIFICAR ROSTRO
# ============================================================

@router.post("/{usuario_id}/rostro/verificar")
def verificar_rostro(
    usuario_id: int,
    datos: VerificacionFacial,
):
    conexion = obtener_conexion()

    try:
        # ----------------------------------------------------
        # 1. Buscar usuario
        # ----------------------------------------------------

        usuario = conexion.execute(
            """
            SELECT
                id,
                dni,
                nombre,
                rol,
                estado
            FROM usuarios
            WHERE id = ?
            """,
            (usuario_id,),
        ).fetchone()

        if usuario is None:
            raise HTTPException(
                status_code=404,
                detail="El usuario no existe",
            )

        # ----------------------------------------------------
        # 2. Verificar usuario activo
        # ----------------------------------------------------

        if str(usuario["estado"]).lower() != "activo":
            raise HTTPException(
                status_code=400,
                detail="El usuario no está activo",
            )

        # ----------------------------------------------------
        # 3. Buscar rostro registrado
        # ----------------------------------------------------

        rostro = conexion.execute(
            """
            SELECT
                descriptor,
                fecha_registro
            FROM biometria_facial
            WHERE usuario_id = ?
            """,
            (usuario_id,),
        ).fetchone()

        if rostro is None:
            raise HTTPException(
                status_code=404,
                detail="El usuario no tiene un rostro registrado",
            )

        # ----------------------------------------------------
        # 4. Leer descriptor almacenado
        # ----------------------------------------------------

        try:
            descriptor_guardado = json.loads(
                rostro["descriptor"]
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

        # ----------------------------------------------------
        # 5. Descriptor recibido desde la cámara
        # ----------------------------------------------------

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

        # ----------------------------------------------------
        # 6. Calcular distancia facial
        # ----------------------------------------------------

        distancia = calcular_distancia_euclidiana(
            descriptor_actual,
            descriptor_guardado,
        )

        # ----------------------------------------------------
        # 7. Umbral de coincidencia
        # ----------------------------------------------------
        #
        # face-api.js utiliza descriptores de 128 dimensiones.
        # Un valor menor significa mayor similitud.
        #
        # Este umbral se puede calibrar posteriormente con
        # pruebas reales de diferentes condiciones.
        #

        UMBRAL = 0.60

        coincide = distancia <= UMBRAL

        # ----------------------------------------------------
        # 8. Respuesta
        # ----------------------------------------------------

        return {
            "ok": True,
            "coincide": coincide,
            "distancia": round(distancia, 6),
            "umbral": UMBRAL,
            "mensaje": (
                "Identidad facial verificada correctamente"
                if coincide
                else "El rostro no coincide con el usuario"
            ),
            "usuario": {
                "id": usuario["id"],
                "dni": usuario["dni"],
                "nombre": usuario["nombre"],
                "rol": usuario["rol"],
                "estado": usuario["estado"],
            },
        }

    except HTTPException:
        raise

    except sqlite3.Error as error:
        raise HTTPException(
            status_code=500,
            detail=f"Error de base de datos: {error}",
        )

    finally:
        conexion.close()