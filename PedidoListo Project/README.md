# Pedido Listo Project

Sistema de pedidos para comida rápida.

## Instalación

1. Instalar dependencias:
   pip install -r requirements.txt

2. Instalar Playwright browsers:
   playwright install

3. Poblar base de datos:
   python backend/populate_db.py

## Ejecutar

1. Iniciar servidor:
   uvicorn main:app --reload

2. Abrir en navegador: http://localhost:8000

## Tests

Ejecutar tests con Playwright:
python tests/test_playwright.py