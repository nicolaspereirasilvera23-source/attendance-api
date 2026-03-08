from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Producto
from ..schemas import Producto as ProductoSchema

router = APIRouter()

@router.get("/productos", response_model=list[ProductoSchema])
def get_productos(db: Session = Depends(get_db)):
    productos = db.query(Producto).all()
    return productos