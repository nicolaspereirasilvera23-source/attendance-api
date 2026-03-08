import asyncio
from playwright.async_api import async_playwright

async def test_menu_and_pedido():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto("http://localhost:8000")

        # Verificar que se muestra el menú
        await page.wait_for_selector("#menu")
        await page.wait_for_selector(".producto")
        productos = await page.query_selector_all(".producto")
        assert len(productos) > 0, "No se muestran productos en el menú"

        # Crear pedido de prueba
        await page.fill("#cliente", "Cliente Prueba")
        await page.click("#add-item")
        await page.select_option(".producto-select", "1")  # Asumiendo ID 1
        await page.fill(".cantidad", "2")
        await page.click("button[type='submit']")

        # Verificar que se crea el pedido
        await page.wait_for_selector("#pedido-status")
        status_text = await page.text_content("#pedido-status")
        assert "Pedido creado" in status_text, "Pedido no creado correctamente"

        await browser.close()

if __name__ == "__main__":
    asyncio.run(test_menu_and_pedido())