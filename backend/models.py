from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from datetime import datetime

from database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    dni = Column(String(20), unique=True, nullable=False)
    nombre = Column(String(100), nullable=False)
    rol = Column(String(50), nullable=False)
    estado = Column(String(20), default="Activo")


class Empresa(Base):
    __tablename__ = "empresas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), nullable=False)
    ruc = Column(String(20), unique=True, nullable=False)
    direccion = Column(String(200), nullable=True)
    estado = Column(String(20), default="Activo")


class Sucursal(Base):
    __tablename__ = "sucursales"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    ciudad = Column(String(100), nullable=False)
    direccion = Column(String(200), nullable=True)
    estado = Column(String(20), default="Activo")


class Producto(Base):
    __tablename__ = "productos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), nullable=False)
    categoria = Column(String(100), nullable=False)
    precio = Column(Integer, nullable=False)
    estado = Column(String(20), default="Activo")


# =========================
# VENTAS
# =========================

class Venta(Base):
    __tablename__ = "ventas"

    id = Column(Integer, primary_key=True, index=True)
    sucursal_id = Column(
        Integer,
        ForeignKey("sucursales.id"),
        nullable=False
    )
    fecha = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )
    total = Column(Integer, nullable=False)
    estado = Column(String(20), default="Activo")


class DetalleVenta(Base):
    __tablename__ = "detalle_ventas"

    id = Column(Integer, primary_key=True, index=True)
    venta_id = Column(
        Integer,
        ForeignKey("ventas.id"),
        nullable=False
    )
    producto_id = Column(
        Integer,
        ForeignKey("productos.id"),
        nullable=False
    )
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(Integer, nullable=False)
    subtotal = Column(Integer, nullable=False)

class Inventario(Base):
    __tablename__ = "inventario"

    id = Column(Integer, primary_key=True, index=True)
    sucursal_id = Column(
        Integer,
        ForeignKey("sucursales.id"),
        nullable=False
    )
    producto_id = Column(
        Integer,
        ForeignKey("productos.id"),
        nullable=False
    )
    cantidad = Column(Integer, nullable=False)
    estado = Column(String(20), default="Activo")

# =========================
# MOVIMIENTOS DE INVENTARIO
# =========================

class MovimientoInventario(Base):
    __tablename__ = "movimientos_inventario"

    id = Column(Integer, primary_key=True, index=True)

    inventario_id = Column(
        Integer,
        ForeignKey("inventario.id"),
        nullable=False
    )

    tipo = Column(
        String(20),
        nullable=False
    )

    cantidad = Column(
        Integer,
        nullable=False
    )

    fecha = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    estado = Column(
        String(20),
        default="Activo"
    )

# =========================
# VECTORES
# =========================

class Vector(Base):
    __tablename__ = "vectores"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    dimension = Column(Integer, nullable=False)
    estado = Column(String(20), default="Activo")


class ValorVector(Base):
    __tablename__ = "valores_vectores"

    id = Column(Integer, primary_key=True, index=True)

    vector_id = Column(
        Integer,
        ForeignKey("vectores.id"),
        nullable=False
    )

    posicion = Column(Integer, nullable=False)
    valor = Column(Integer, nullable=False)

# =========================
# OPERACIONES MATEMÁTICAS
# =========================

class Operacion(Base):
    __tablename__ = "operaciones"

    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(String(50), nullable=False)
    fecha = Column(DateTime, default=datetime.utcnow, nullable=False)
    estado = Column(String(20), default="Completada")


class ResultadoOperacion(Base):
    __tablename__ = "resultados_operaciones"

    id = Column(Integer, primary_key=True, index=True)

    operacion_id = Column(
        Integer,
        ForeignKey("operaciones.id"),
        nullable=False
    )

    resultado = Column(String(1000), nullable=False)

class Meta(Base):
    __tablename__ = "metas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), nullable=False)
    tipo = Column(String(50), nullable=False)
    valor_objetivo = Column(Integer, nullable=False)
    periodo = Column(String(50), nullable=False)
    sucursal_id = Column(
        Integer,
        ForeignKey("sucursales.id"),
        nullable=True
    )
    estado = Column(String(20), default="Activo")

# =========================
# AUDITORÍA
# =========================

class Auditoria(Base):
    __tablename__ = "auditoria"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, nullable=True)
    usuario = Column(String, nullable=True)
    accion = Column(String, nullable=False)
    modulo = Column(String, nullable=False)
    fecha = Column(DateTime, default=datetime.utcnow)
    ip = Column(String, nullable=True)
    estado = Column(String, nullable=False)
    resultado = Column(String, nullable=True)

# =========================
# BIOMETRÍA FACIAL
# =========================

class BiometriaFacial(Base):
    __tablename__ = "biometria_facial"

    id = Column(Integer, primary_key=True, index=True)

    usuario_id = Column(
        Integer,
        ForeignKey("usuarios.id"),
        nullable=False,
        unique=True
    )

    descriptor = Column(
        String(5000),
        nullable=False
    )

    fecha_registro = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )
