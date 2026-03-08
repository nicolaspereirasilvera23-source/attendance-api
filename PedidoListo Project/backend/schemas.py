from pydantic import BaseModel, Field, field_validator
from typing import List

class ProductoBase(BaseModel):
    nombre: str
    precio: float
    categoria: str

class Producto(ProductoBase):
    id: int

    class Config:
        from_attributes = True

class ItemPedidoBase(BaseModel):
    producto_id: int
    cantidad: int = Field(gt=0)  # Validar cantidad > 0

class ItemPedido(ItemPedidoBase):
    id: int
    subtotal: float

    class Config:
        from_attributes = True

class PedidoBase(BaseModel):
    cliente_nombre: str = Field(min_length=1)  # No vacío
    items: List[ItemPedidoBase] = Field(min_items=1)  # Al menos un item

class PedidoCreate(PedidoBase):
    pass

class Pedido(PedidoBase):
    id: int
    estado: str
    total: float
    items: List[ItemPedido]

    class Config:
        from_attributes = True

class EstadoUpdate(BaseModel):
    estado: str

    @field_validator('estado')
    @classmethod
    def validar_estado(cls, v):
        estados_validos = ["nuevo", "en_preparacion", "listo", "entregado"]
        if v not in estados_validos:
            raise ValueError(f"Estado debe ser uno de: {estados_validos}")
        return v

class PedidoResponse(BaseModel):
    id_pedido: int
    estado: str
    total: float