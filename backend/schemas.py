from pydantic import BaseModel
from datetime import datetime


class UsuarioCreate(BaseModel):
    dni: str
    nombre: str
    rol: str
    estado: str = "Activo"


class UsuarioResponse(BaseModel):
    id: int
    dni: str
    nombre: str
    rol: str
    estado: str

    class Config:
        from_attributes = True


class EmpresaCreate(BaseModel):
    nombre: str
    ruc: str
    direccion: str | None = None
    estado: str = "Activo"


class EmpresaResponse(BaseModel):
    id: int
    nombre: str
    ruc: str
    direccion: str | None
    estado: str

    class Config:
        from_attributes = True


class SucursalCreate(BaseModel):
    nombre: str
    ciudad: str
    direccion: str | None = None
    estado: str = "Activo"


class SucursalResponse(BaseModel):
    id: int
    nombre: str
    ciudad: str
    direccion: str | None
    estado: str

    class Config:
        from_attributes = True


class ProductoCreate(BaseModel):
    nombre: str
    categoria: str
    precio: int
    estado: str = "Activo"


class ProductoResponse(BaseModel):
    id: int
    nombre: str
    categoria: str
    precio: int
    estado: str

    class Config:
        from_attributes = True

# =========================
# VENTAS
# =========================

class VentaCreate(BaseModel):
    sucursal_id: int
    total: int
    estado: str = "Activo"


class VentaResponse(BaseModel):
    id: int
    sucursal_id: int
    fecha: datetime
    total: int
    estado: str

    class Config:
        from_attributes = True


class DetalleVentaCreate(BaseModel):
    venta_id: int
    producto_id: int
    cantidad: int
    precio_unitario: int
    subtotal: int


class DetalleVentaResponse(BaseModel):
    id: int
    venta_id: int
    producto_id: int
    cantidad: int
    precio_unitario: int
    subtotal: int

    class Config:
        from_attributes = True

class InventarioCreate(BaseModel):
    sucursal_id: int
    producto_id: int
    cantidad: int
    estado: str = "Activo"


class InventarioResponse(BaseModel):
    id: int
    sucursal_id: int
    producto_id: int
    cantidad: int
    estado: str

    class Config:
        from_attributes = True
    
class MovimientoInventarioCreate(BaseModel):
    inventario_id: int
    tipo: str
    cantidad: int
    estado: str = "Activo"


class MovimientoInventarioResponse(BaseModel):
    id: int
    inventario_id: int
    tipo: str
    cantidad: int
    fecha: datetime
    estado: str

    class Config:
        from_attributes = True

class VectorCreate(BaseModel):
    nombre: str
    dimension: int
    estado: str = "Activo"


class VectorResponse(BaseModel):
    id: int
    nombre: str
    dimension: int
    estado: str

    class Config:
        from_attributes = True


class ValorVectorCreate(BaseModel):
    vector_id: int
    posicion: int
    valor: int


class ValorVectorResponse(BaseModel):
    id: int
    vector_id: int
    posicion: int
    valor: int

    class Config:
        from_attributes = True

class OperacionVectoresCreate(BaseModel):
    vector_a: list[int]
    vector_b: list[int]


class ResultadoVectorResponse(BaseModel):
    resultado: list[int]

class EscalarVectorCreate(BaseModel):
    vector: list[int]
    escalar: int

class MatrizOperacionCreate(BaseModel):
    matriz_a: list[list[int]]
    matriz_b: list[list[int]]


class MatrizCreate(BaseModel):
    matriz: list[list[int]]


class ResultadoMatrizResponse(BaseModel):
    resultado: list[list[int]]

class OperacionResponse(BaseModel):
    id: int
    tipo: str
    fecha: datetime
    estado: str

    class Config:
        from_attributes = True


class ResultadoOperacionCreate(BaseModel):
    operacion_id: int
    resultado: str


class ResultadoOperacionResponse(BaseModel):
    id: int
    operacion_id: int
    resultado: str

    class Config:
        from_attributes = True

class CombinacionLinealCreate(BaseModel):
    vectores: list[list[int]]
    escalares: list[int]

class MetaCreate(BaseModel):
    nombre: str
    tipo: str
    valor_objetivo: int
    periodo: str
    sucursal_id: int | None = None
    estado: str = "Activo"


class MetaResponse(BaseModel):
    id: int
    nombre: str
    tipo: str
    valor_objetivo: int
    periodo: str
    sucursal_id: int | None
    estado: str

    class Config:
        from_attributes = True


# =========================
# AUDITORÍA
# =========================

class AuditoriaCreate(BaseModel):
    usuario_id: int | None = None
    usuario: str | None = None
    accion: str
    modulo: str
    ip: str | None = None
    estado: str = "Exitoso"
    resultado: str | None = None


class AuditoriaResponse(BaseModel):
    id: int
    usuario_id: int | None = None
    usuario: str | None = None
    accion: str
    modulo: str
    fecha: datetime
    ip: str | None = None
    estado: str
    resultado: str | None = None

    class Config:
        from_attributes = True