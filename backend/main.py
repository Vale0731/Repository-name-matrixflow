import os

from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from biometria import router as biometria_router
from database import Base, engine, get_db
import models
import schemas

from math_engine import (
    sumar_vectores,
    restar_vectores,
    producto_punto,
    multiplicar_por_escalar,
    transpuesta,
    multiplicar_matrices,
    combinacion_lineal
)


# =========================================================
# APP
# =========================================================

app = FastAPI(
    title="MatrixFlow Enterprise API",
    version="1.0.0"
)

app.include_router(biometria_router)


# =========================================================
# CORS
# =========================================================

cors_env = os.getenv("CORS_ORIGINS", "")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

if cors_env:
    origins.extend(
        [
            origen.strip()
            for origen in cors_env.split(",")
            if origen.strip()
        ]
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# BASE DE DATOS
# =========================================================

Base.metadata.create_all(bind=engine)


# =========================================================
# FUNCIÓN AUXILIAR DE AUDITORÍA
# =========================================================

def registrar_auditoria(
    db: Session,
    request: Request,
    accion: str,
    modulo: str,
    usuario_id: int | None = None,
    usuario: str | None = None,
    estado: str = "Exitoso",
    resultado: str | None = None
):
    nueva_auditoria = models.Auditoria(
        usuario_id=usuario_id,
        usuario=usuario,
        accion=accion,
        modulo=modulo,
        ip=(
            request.client.host
            if request.client
            else None
        ),
        estado=estado,
        resultado=resultado
    )

    db.add(nueva_auditoria)
    db.commit()

    return nueva_auditoria


# =========================================================
# INICIO / HEALTH
# =========================================================

@app.get("/")
def inicio():
    return {
        "mensaje": "MatrixFlow Enterprise API funcionando"
    }


@app.get("/health")
def health():
    return {
        "estado": "OK"
    }


# =========================================================
# USUARIOS
# =========================================================

@app.post(
    "/usuarios",
    response_model=schemas.UsuarioResponse
)
def crear_usuario(
    usuario: schemas.UsuarioCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    usuario_existente = db.query(models.Usuario).filter(
        models.Usuario.dni == usuario.dni
    ).first()

    if usuario_existente:
        raise HTTPException(
            status_code=400,
            detail="Ya existe un usuario con ese DNI"
        )

    nuevo_usuario = models.Usuario(
        dni=usuario.dni,
        nombre=usuario.nombre,
        rol=usuario.rol,
        estado=usuario.estado
    )

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    registrar_auditoria(
        db=db,
        request=request,
        usuario_id=nuevo_usuario.id,
        usuario=nuevo_usuario.nombre,
        accion="CREAR",
        modulo="Usuarios",
        estado="Exitoso",
        resultado=f"Usuario creado con DNI {nuevo_usuario.dni}"
    )

    return nuevo_usuario


@app.get(
    "/usuarios",
    response_model=list[schemas.UsuarioResponse]
)
def listar_usuarios(
    db: Session = Depends(get_db)
):
    usuarios = db.query(models.Usuario).all()

    return usuarios


# =========================================================
# EMPRESAS
# =========================================================

@app.post(
    "/empresas",
    response_model=schemas.EmpresaResponse
)
def crear_empresa(
    empresa: schemas.EmpresaCreate,
    db: Session = Depends(get_db)
):
    empresa_existente = db.query(models.Empresa).filter(
        models.Empresa.ruc == empresa.ruc
    ).first()

    if empresa_existente:
        raise HTTPException(
            status_code=400,
            detail="Ya existe una empresa con ese RUC"
        )

    nueva_empresa = models.Empresa(
        nombre=empresa.nombre,
        ruc=empresa.ruc,
        direccion=empresa.direccion,
        estado=empresa.estado
    )

    db.add(nueva_empresa)
    db.commit()
    db.refresh(nueva_empresa)

    return nueva_empresa


@app.get(
    "/empresas",
    response_model=list[schemas.EmpresaResponse]
)
def listar_empresas(
    db: Session = Depends(get_db)
):
    empresas = db.query(models.Empresa).all()

    return empresas


# =========================================================
# SUCURSALES
# =========================================================

@app.post(
    "/sucursales",
    response_model=schemas.SucursalResponse
)
def crear_sucursal(
    sucursal: schemas.SucursalCreate,
    db: Session = Depends(get_db)
):
    nueva_sucursal = models.Sucursal(
        nombre=sucursal.nombre,
        ciudad=sucursal.ciudad,
        direccion=sucursal.direccion,
        estado=sucursal.estado
    )

    db.add(nueva_sucursal)
    db.commit()
    db.refresh(nueva_sucursal)

    return nueva_sucursal


@app.get(
    "/sucursales",
    response_model=list[schemas.SucursalResponse]
)
def listar_sucursales(
    db: Session = Depends(get_db)
):
    sucursales = db.query(models.Sucursal).all()

    return sucursales


# =========================================================
# PRODUCTOS
# =========================================================

@app.post(
    "/productos",
    response_model=schemas.ProductoResponse
)
def crear_producto(
    producto: schemas.ProductoCreate,
    db: Session = Depends(get_db)
):
    nuevo_producto = models.Producto(
        nombre=producto.nombre,
        categoria=producto.categoria,
        precio=producto.precio,
        estado=producto.estado
    )

    db.add(nuevo_producto)
    db.commit()
    db.refresh(nuevo_producto)

    return nuevo_producto


@app.get(
    "/productos",
    response_model=list[schemas.ProductoResponse]
)
def listar_productos(
    db: Session = Depends(get_db)
):
    productos = db.query(models.Producto).all()

    return productos


@app.put(
    "/productos/{producto_id}",
    response_model=schemas.ProductoResponse
)
def actualizar_producto(
    producto_id: int,
    producto: schemas.ProductoCreate,
    db: Session = Depends(get_db)
):
    producto_existente = db.query(models.Producto).filter(
        models.Producto.id == producto_id
    ).first()

    if not producto_existente:
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado"
        )

    producto_existente.nombre = producto.nombre
    producto_existente.categoria = producto.categoria
    producto_existente.precio = producto.precio
    producto_existente.estado = producto.estado

    db.commit()
    db.refresh(producto_existente)

    return producto_existente


@app.patch(
    "/productos/{producto_id}/desactivar",
    response_model=schemas.ProductoResponse
)
def desactivar_producto(
    producto_id: int,
    db: Session = Depends(get_db)
):
    producto_existente = db.query(models.Producto).filter(
        models.Producto.id == producto_id
    ).first()

    if not producto_existente:
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado"
        )

    producto_existente.estado = "Inactivo"

    db.commit()
    db.refresh(producto_existente)

    return producto_existente


# =========================================================
# VENTAS
# =========================================================

@app.post(
    "/ventas",
    response_model=schemas.VentaResponse
)
def crear_venta(
    venta: schemas.VentaCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    sucursal_existente = db.query(models.Sucursal).filter(
        models.Sucursal.id == venta.sucursal_id
    ).first()

    if not sucursal_existente:
        raise HTTPException(
            status_code=404,
            detail="Sucursal no encontrada"
        )

    nueva_venta = models.Venta(
        sucursal_id=venta.sucursal_id,
        total=venta.total,
        estado=venta.estado
    )

    db.add(nueva_venta)
    db.commit()
    db.refresh(nueva_venta)

    return nueva_venta


@app.get(
    "/ventas",
    response_model=list[schemas.VentaResponse]
)
def listar_ventas(
    db: Session = Depends(get_db)
):
    ventas = db.query(models.Venta).all()

    return ventas


@app.post(
    "/detalle-ventas",
    response_model=schemas.DetalleVentaResponse
)
def crear_detalle_venta(
    detalle: schemas.DetalleVentaCreate,
    db: Session = Depends(get_db)
):
    venta_existente = db.query(models.Venta).filter(
        models.Venta.id == detalle.venta_id
    ).first()

    if not venta_existente:
        raise HTTPException(
            status_code=404,
            detail="Venta no encontrada"
        )

    producto_existente = db.query(models.Producto).filter(
        models.Producto.id == detalle.producto_id
    ).first()

    if not producto_existente:
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado"
        )

    nuevo_detalle = models.DetalleVenta(
        venta_id=detalle.venta_id,
        producto_id=detalle.producto_id,
        cantidad=detalle.cantidad,
        precio_unitario=detalle.precio_unitario,
        subtotal=detalle.subtotal
    )

    db.add(nuevo_detalle)
    db.commit()
    db.refresh(nuevo_detalle)

    return nuevo_detalle


# =========================================================
# INVENTARIO
# =========================================================

@app.post(
    "/inventario",
    response_model=schemas.InventarioResponse
)
def crear_inventario(
    inventario: schemas.InventarioCreate,
    db: Session = Depends(get_db)
):
    sucursal_existente = db.query(models.Sucursal).filter(
        models.Sucursal.id == inventario.sucursal_id
    ).first()

    if not sucursal_existente:
        raise HTTPException(
            status_code=404,
            detail="Sucursal no encontrada"
        )

    producto_existente = db.query(models.Producto).filter(
        models.Producto.id == inventario.producto_id
    ).first()

    if not producto_existente:
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado"
        )

    nuevo_inventario = models.Inventario(
        sucursal_id=inventario.sucursal_id,
        producto_id=inventario.producto_id,
        cantidad=inventario.cantidad,
        estado=inventario.estado
    )

    db.add(nuevo_inventario)
    db.commit()
    db.refresh(nuevo_inventario)

    return nuevo_inventario


@app.get(
    "/inventario",
    response_model=list[schemas.InventarioResponse]
)
def listar_inventario(
    db: Session = Depends(get_db)
):
    inventarios = db.query(models.Inventario).all()

    return inventarios


@app.delete(
    "/inventario/{inventario_id}"
)
def eliminar_inventario(
    inventario_id: int,
    db: Session = Depends(get_db)
):
    inventario = db.query(models.Inventario).filter(
        models.Inventario.id == inventario_id
    ).first()

    if not inventario:
        raise HTTPException(
            status_code=404,
            detail="Registro de inventario no encontrado"
        )

    db.delete(inventario)
    db.commit()

    return {
        "mensaje": "Registro de inventario eliminado correctamente",
        "id": inventario_id
    }


@app.post(
    "/movimientos-inventario",
    response_model=schemas.MovimientoInventarioResponse
)
def crear_movimiento_inventario(
    movimiento: schemas.MovimientoInventarioCreate,
    db: Session = Depends(get_db)
):
    inventario_existente = db.query(models.Inventario).filter(
        models.Inventario.id == movimiento.inventario_id
    ).first()

    if not inventario_existente:
        raise HTTPException(
            status_code=404,
            detail="Inventario no encontrado"
        )

    nuevo_movimiento = models.MovimientoInventario(
        inventario_id=movimiento.inventario_id,
        tipo=movimiento.tipo,
        cantidad=movimiento.cantidad,
        estado=movimiento.estado
    )

    db.add(nuevo_movimiento)
    db.commit()
    db.refresh(nuevo_movimiento)

    return nuevo_movimiento


@app.get(
    "/movimientos-inventario",
    response_model=list[schemas.MovimientoInventarioResponse]
)
def listar_movimientos_inventario(
    db: Session = Depends(get_db)
):
    movimientos = db.query(
        models.MovimientoInventario
    ).all()

    return movimientos


# =========================================================
# VECTORES
# =========================================================

@app.post(
    "/vectores",
    response_model=schemas.VectorResponse
)
def crear_vector(
    vector: schemas.VectorCreate,
    db: Session = Depends(get_db)
):
    if vector.dimension <= 0:
        raise HTTPException(
            status_code=400,
            detail="La dimensión debe ser mayor que 0"
        )

    nuevo_vector = models.Vector(
        nombre=vector.nombre,
        dimension=vector.dimension,
        estado=vector.estado
    )

    db.add(nuevo_vector)
    db.commit()
    db.refresh(nuevo_vector)

    return nuevo_vector


@app.post(
    "/valores-vectores",
    response_model=schemas.ValorVectorResponse
)
def crear_valor_vector(
    valor: schemas.ValorVectorCreate,
    db: Session = Depends(get_db)
):
    vector_existente = db.query(models.Vector).filter(
        models.Vector.id == valor.vector_id
    ).first()

    if not vector_existente:
        raise HTTPException(
            status_code=404,
            detail="Vector no encontrado"
        )

    if (
        valor.posicion <= 0
        or valor.posicion > vector_existente.dimension
    ):
        raise HTTPException(
            status_code=400,
            detail="La posición no corresponde a la dimensión del vector"
        )

    posicion_existente = db.query(models.ValorVector).filter(
        models.ValorVector.vector_id == valor.vector_id,
        models.ValorVector.posicion == valor.posicion
    ).first()

    if posicion_existente:
        raise HTTPException(
            status_code=400,
            detail="Ya existe un valor para esa posición del vector"
        )

    nuevo_valor = models.ValorVector(
        vector_id=valor.vector_id,
        posicion=valor.posicion,
        valor=valor.valor
    )

    db.add(nuevo_valor)
    db.commit()
    db.refresh(nuevo_valor)

    return nuevo_valor


@app.get(
    "/valores-vectores",
    response_model=list[schemas.ValorVectorResponse]
)
def listar_valores_vectores(
    db: Session = Depends(get_db)
):
    valores = db.query(models.ValorVector).all()

    return valores


# =========================================================
# ANÁLISIS MATEMÁTICO
# =========================================================

@app.post(
    "/matematicas/suma-vectores",
    response_model=schemas.ResultadoVectorResponse
)
def sumar_vectores_endpoint(
    datos: schemas.OperacionVectoresCreate
):
    try:
        resultado = sumar_vectores(
            datos.vector_a,
            datos.vector_b
        )

        return {
            "resultado": resultado
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@app.post(
    "/matematicas/resta-vectores",
    response_model=schemas.ResultadoVectorResponse
)
def restar_vectores_endpoint(
    datos: schemas.OperacionVectoresCreate
):
    try:
        resultado = restar_vectores(
            datos.vector_a,
            datos.vector_b
        )

        return {
            "resultado": resultado
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@app.post(
    "/matematicas/producto-punto"
)
def producto_punto_endpoint(
    datos: schemas.OperacionVectoresCreate
):
    try:
        resultado = producto_punto(
            datos.vector_a,
            datos.vector_b
        )

        return {
            "resultado": resultado
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@app.post(
    "/matematicas/escalar",
    response_model=schemas.ResultadoVectorResponse
)
def multiplicar_escalar_endpoint(
    datos: schemas.EscalarVectorCreate
):
    resultado = multiplicar_por_escalar(
        datos.vector,
        datos.escalar
    )

    return {
        "resultado": resultado
    }


@app.post(
    "/matematicas/transpuesta",
    response_model=schemas.ResultadoMatrizResponse
)
def transpuesta_endpoint(
    datos: schemas.MatrizCreate
):
    resultado = transpuesta(
        datos.matriz
    )

    return {
        "resultado": resultado
    }


@app.post(
    "/matematicas/multiplicacion-matrices",
    response_model=schemas.ResultadoMatrizResponse
)
def multiplicar_matrices_endpoint(
    datos: schemas.MatrizOperacionCreate
):
    try:
        resultado = multiplicar_matrices(
            datos.matriz_a,
            datos.matriz_b
        )

        return {
            "resultado": resultado
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@app.post(
    "/matematicas/combinacion-lineal",
    response_model=schemas.ResultadoVectorResponse
)
def combinacion_lineal_endpoint(
    datos: schemas.CombinacionLinealCreate
):
    try:
        resultado = combinacion_lineal(
            datos.vectores,
            datos.escalares
        )

        return {
            "resultado": resultado
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# =========================================================
# HISTORIAL DE OPERACIONES
# =========================================================

@app.post(
    "/operaciones",
    response_model=schemas.OperacionResponse
)
def crear_operacion(
    tipo: str,
    db: Session = Depends(get_db)
):
    nueva_operacion = models.Operacion(
        tipo=tipo,
        estado="Completada"
    )

    db.add(nueva_operacion)
    db.commit()
    db.refresh(nueva_operacion)

    return nueva_operacion


@app.get(
    "/operaciones",
    response_model=list[schemas.OperacionResponse]
)
def listar_operaciones(
    db: Session = Depends(get_db)
):
    operaciones = db.query(
        models.Operacion
    ).all()

    return operaciones


@app.post(
    "/resultados-operaciones",
    response_model=schemas.ResultadoOperacionResponse
)
def crear_resultado_operacion(
    resultado: schemas.ResultadoOperacionCreate,
    db: Session = Depends(get_db)
):
    operacion_existente = db.query(
        models.Operacion
    ).filter(
        models.Operacion.id == resultado.operacion_id
    ).first()

    if not operacion_existente:
        raise HTTPException(
            status_code=404,
            detail="Operación no encontrada"
        )

    nuevo_resultado = models.ResultadoOperacion(
        operacion_id=resultado.operacion_id,
        resultado=resultado.resultado
    )

    db.add(nuevo_resultado)
    db.commit()
    db.refresh(nuevo_resultado)

    return nuevo_resultado


@app.get(
    "/resultados-operaciones",
    response_model=list[schemas.ResultadoOperacionResponse]
)
def listar_resultados_operaciones(
    db: Session = Depends(get_db)
):
    resultados = db.query(
        models.ResultadoOperacion
    ).all()

    return resultados


# =========================================================
# METAS
# =========================================================

@app.post(
    "/metas",
    response_model=schemas.MetaResponse
)
def crear_meta(
    meta: schemas.MetaCreate,
    db: Session = Depends(get_db)
):
    nueva_meta = models.Meta(
        nombre=meta.nombre,
        tipo=meta.tipo,
        valor_objetivo=meta.valor_objetivo,
        periodo=meta.periodo,
        sucursal_id=meta.sucursal_id,
        estado=meta.estado
    )

    db.add(nueva_meta)
    db.commit()
    db.refresh(nueva_meta)

    return nueva_meta


@app.get(
    "/metas",
    response_model=list[schemas.MetaResponse]
)
def listar_metas(
    db: Session = Depends(get_db)
):
    return db.query(models.Meta).all()


# =========================================================
# AUDITORÍA
# =========================================================

@app.post(
    "/auditoria",
    response_model=schemas.AuditoriaResponse
)
def crear_auditoria(
    datos: schemas.AuditoriaCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    nueva_auditoria = models.Auditoria(
        usuario_id=datos.usuario_id,
        usuario=datos.usuario,
        accion=datos.accion,
        modulo=datos.modulo,
        ip=(
            datos.ip
            or (
                request.client.host
                if request.client
                else None
            )
        ),
        estado=datos.estado,
        resultado=datos.resultado
    )

    db.add(nueva_auditoria)
    db.commit()
    db.refresh(nueva_auditoria)

    return nueva_auditoria


@app.get(
    "/auditoria",
    response_model=list[schemas.AuditoriaResponse]
)
def listar_auditoria(
    db: Session = Depends(get_db)
):
    auditorias = (
        db.query(models.Auditoria)
        .order_by(models.Auditoria.id.desc())
        .all()
    )

    return auditorias