from .database import SessionLocal, engine, Base
from .models import Producto

def populate_db():
    # Crear tablas
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    # Agregar productos de ejemplo
    productos = [
        Producto(nombre="Hamburguesa", precio=10.0, categoria="Comida"),
        Producto(nombre="Pizza", precio=15.0, categoria="Comida"),
        Producto(nombre="Refresco", precio=3.0, categoria="Bebida"),
    ]
    for prod in productos:
        db.add(prod)
    db.commit()
    db.close()

if __name__ == "__main__":
    populate_db()