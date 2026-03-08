from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Pedido, ItemPedido, Producto
from ..schemas import PedidoCreate, Pedido as PedidoSchema, EstadoUpdate, PedidoResponse

router = APIRouter()

@router.post("/pedidos", response_model=PedidoResponse)
def create_pedido(pedido: PedidoCreate, db: Session = Depends(get_db)):
    """
    Crear un nuevo pedido con validación de productos y cálculo de totales en backend.
    """
    # Obtener todos los productos necesarios en una sola consulta
    producto_ids = [item.producto_id for item in pedido.items]
    productos = db.query(Producto).filter(Producto.id.in_(producto_ids)).all()
    productos_dict = {prod.id: prod for prod in productos}

    # Validar que todos los productos existan
    for item in pedido.items:
        if item.producto_id not in productos_dict:
            raise HTTPException(status_code=400, detail=f"Producto {item.producto_id} no encontrado")

    # Calcular totales
    total = 0
    items_db = []
    for item in pedido.items:
        producto = productos_dict[item.producto_id]
        subtotal = producto.precio * item.cantidad
        total += subtotal
        items_db.append(ItemPedido(producto_id=item.producto_id, cantidad=item.cantidad, subtotal=subtotal))

    # Usar transacción para asegurar consistencia
    try:
        with db.begin():
            # Crear pedido
            pedido_db = Pedido(cliente_nombre=pedido.cliente_nombre, total=total)
            db.add(pedido_db)
            db.flush()  # Obtener ID sin commit

            # Agregar items
            for item in items_db:
                item.pedido_id = pedido_db.id
                db.add(item)

        return PedidoResponse(id_pedido=pedido_db.id, estado="nuevo", total=total)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error al crear el pedido")

@router.get("/pedidos/{pedido_id}", response_model=PedidoSchema)
def get_pedido(pedido_id: int, db: Session = Depends(get_db)):
    """
    Obtener detalles de un pedido específico.
    """
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return pedido

@router.put("/pedidos/{pedido_id}/estado")
def update_estado(pedido_id: int, estado: EstadoUpdate, db: Session = Depends(get_db)):
    """
    Actualizar el estado de un pedido.
    """
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    pedido.estado = estado.estado
    db.commit()
    return {"message": "Estado actualizado"}