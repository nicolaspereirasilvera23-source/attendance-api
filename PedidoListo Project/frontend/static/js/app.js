document.addEventListener('DOMContentLoaded', function() {
    loadMenu();
    document.getElementById('add-item').addEventListener('click', addItem);
    document.getElementById('pedido-form').addEventListener('submit', createPedido);
});

async function loadMenu() {
    const response = await fetch('/productos');
    const productos = await response.json();
    const menuDiv = document.getElementById('menu');
    productos.forEach(prod => {
        const div = document.createElement('div');
        div.className = 'producto';
        div.innerHTML = `<h3>${prod.nombre}</h3><p>Precio: $${prod.precio}</p><p>Categoria: ${prod.categoria}</p>`;
        menuDiv.appendChild(div);
    });
}

function addItem() {
    const itemsDiv = document.getElementById('items');
    const div = document.createElement('div');
    div.innerHTML = `
        <select class="producto-select" required></select>
        <input type="number" class="cantidad" min="1" required>
        <button type="button" onclick="removeItem(this)">Remover</button>
    `;
    itemsDiv.appendChild(div);
    loadProductosForSelect(div.querySelector('.producto-select'));
}

async function loadProductosForSelect(select) {
    const response = await fetch('/productos');
    const productos = await response.json();
    productos.forEach(prod => {
        const option = document.createElement('option');
        option.value = prod.id;
        option.text = prod.nombre;
        select.appendChild(option);
    });
}

function removeItem(button) {
    button.parentElement.remove();
}

async function createPedido(event) {
    event.preventDefault();
    const cliente = document.getElementById('cliente').value;
    const itemElements = document.querySelectorAll('#items > div');
    const items = [];
    itemElements.forEach(div => {
        const prodId = div.querySelector('.producto-select').value;
        const cantidad = div.querySelector('.cantidad').value;
        items.push({producto_id: parseInt(prodId), cantidad: parseInt(cantidad)});
    });
    const response = await fetch('/pedidos', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({cliente_nombre: cliente, items: items})
    });
    const result = await response.json();
    document.getElementById('pedido-status').innerHTML = `<p>Pedido creado: ID ${result.id_pedido}, Total: $${result.total}, Estado: ${result.estado}</p>`;
}