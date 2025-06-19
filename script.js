// scripts/script.js

// Arrays para armazenar os dados (simulando um banco de dados com localStorage)
let products = [];
let cart = [];
let salesHistory = [];
let heldSales = [];

// Elementos DOM principais
const productList = document.getElementById('product-list');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const finishSaleBtn = document.getElementById('finish-sale');
const cancelSaleBtn = document.getElementById('cancel-sale');
const holdSaleBtn = document.getElementById('hold-sale');
const receiptElement = document.getElementById('receipt');
const receiptContentElement = document.getElementById('receipt-content');
const productSearchInput = document.getElementById('product-search');
const salesHistoryDiv = document.getElementById('sales-history');
const inventoryManagementDiv = document.getElementById('inventory-management');
const newProductNameInput = document.getElementById('new-product-name');
const newProductCategoryInput = document.getElementById('new-product-category');
const newProductPriceInput = document.getElementById('new-product-price');
const newProductStockInput = document.getElementById('new-product-stock');
const addProductBtn = document.getElementById('add-product-btn');
const customerNameInput = document.getElementById('customer-name');
const customerCpfInput = document.getElementById('customer-cpf');
const cashRadio = document.getElementById('cash');
const cashChangeContainer = document.getElementById('cash-change-container');
const cashChangeInput = document.getElementById('cash-change');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    loadInitialData(); // Carrega produtos, vendas, etc.
    renderProducts(products); // Renderiza os produtos inicialmente
    renderCart(); // Renderiza o carrinho
    renderSalesHistory(); // Renderiza o histórico de vendas
    renderInventoryManagement(); // Renderiza o gerenciamento de estoque
    setupEventListeners(); // Configura os listeners de evento
    applySavedBackground(); // Aplica o plano de fundo salvo
});

// Listener para o evento 'storage' para sincronização entre abas/janelas
window.addEventListener('storage', (event) => {
    if (event.key === 'productsInventory') {
        console.log('Detectada alteração em productsInventory. Recarregando produtos...');
        loadProductsFromLocalStorage(); // Recarrega os produtos
        renderProducts(products); // Re-renderiza a lista de produtos do PDV
        renderInventoryManagement(); // Re-renderiza a tabela de estoque na aba de estoque
    }
});


// --- Funções de Carregamento e Salvamento de Dados ---
function loadInitialData() {
    loadProductsFromLocalStorage(); // Garante que products[] seja preenchido
    
    const savedCart = localStorage.getItem('currentCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }

    const savedSalesHistory = localStorage.getItem('salesHistory');
    if (savedSalesHistory) {
        salesHistory = JSON.parse(savedSalesHistory);
    }

    const savedHeldSales = localStorage.getItem('heldSales');
    if (savedHeldSales) {
        heldSales = JSON.parse(savedHeldSales);
    }
}

function loadProductsFromLocalStorage() {
    const savedProducts = localStorage.getItem('productsInventory');
    if (savedProducts) {
        products = JSON.parse(savedProducts);
    } else {
        // Produtos de exemplo se não houver nada no localStorage
        products = [
            { id: 1, name: 'Coca-Cola 2L', category: 'Bebidas', price: 9.50, stock: 50 },
            { id: 2, name: 'Pão de Forma', category: 'Padaria', price: 7.00, stock: 30 },
            { id: 3, name: 'Leite Integral 1L', category: 'Laticínios', price: 5.20, stock: 40 },
            { id: 4, name: 'Arroz 5kg', category: 'Mercearia', price: 25.00, stock: 20 },
            { id: 5, name: 'Feijão Carioca 1kg', category: 'Mercearia', price: 8.90, stock: 25 },
            { id: 6, name: 'Bolacha Recheada', category: 'Doces', price: 3.50, stock: 60 },
            { id: 7, name: 'Detergente Líquido', category: 'Limpeza', price: 2.80, stock: 35 },
            { id: 8, name: 'Sabonete Glicerinado', category: 'Higiene', price: 2.00, stock: 70 },
            { id: 9, name: 'Maçã (kg)', category: 'Hortifruti', price: 7.50, stock: 15 },
            { id: 10, name: 'Frango Congelado (kg)', category: 'Congelados', price: 12.00, stock: 10 }
        ];
        saveProducts(); // Salva os produtos iniciais
    }
}

function saveProducts() {
    localStorage.setItem('productsInventory', JSON.stringify(products));
}

function saveCart() {
    localStorage.setItem('currentCart', JSON.stringify(cart));
}

function saveSalesHistory() {
    localStorage.setItem('salesHistory', JSON.stringify(salesHistory));
}

function saveHeldSales() {
    localStorage.setItem('heldSales', JSON.stringify(heldSales));
}

// --- Funções de Renderização ---
function renderProducts(productsToRender) {
    productList.innerHTML = '';
    if (productsToRender.length === 0) {
        productList.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--secondary-text);">Nenhum produto encontrado.</p>';
        return;
    }
    productsToRender.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');
        productCard.dataset.productId = product.id;
        productCard.innerHTML = `
            <h3>${product.name}</h3>
            <p>${product.category}</p>
            <p class="price">R$ ${product.price.toFixed(2)}</p>
            <p>Estoque: <span class="${product.stock <= 5 ? 'danger-color' : ''}">${product.stock}</span></p>
        `;
        productCard.addEventListener('click', () => addProductToCart(product.id));
        productList.appendChild(productCard);
    });
}

function renderCart() {
    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart">Carrinho vazio</div>';
        cartTotalElement.textContent = 'Total: R$ 0,00';
        return;
    }

    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.classList.add('cart-item');
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <p>R$ ${item.price.toFixed(2)} x ${item.quantity}</p>
            </div>
            <div class="cart-item-actions">
                <div class="quantity-control">
                    <button class="quantity-btn" data-action="decrease" data-id="${item.id}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" data-action="increase" data-id="${item.id}">+</button>
                </div>
                <button class="remove-btn" data-id="${item.id}">Remover</button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);
        total += item.price * item.quantity;
    });

    cartTotalElement.textContent = `Total: R$ ${total.toFixed(2)}`;
    saveCart();
}

function renderSalesHistory() {
    salesHistoryDiv.innerHTML = '';
    if (salesHistory.length === 0) {
        salesHistoryDiv.innerHTML = '<p style="text-align: center; color: var(--secondary-text);">Nenhuma venda registrada ainda.</p>';
        return;
    }

    // Ordena as vendas da mais recente para a mais antiga
    const sortedSales = [...salesHistory].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedSales.forEach(sale => {
        const saleCard = document.createElement('div');
        saleCard.classList.add('receipt'); // Reutiliza estilo de recibo
        saleCard.style.display = 'block'; // Garante que seja visível
        saleCard.style.marginBottom = '1.5rem';

        let itemsHtml = sale.items.map(item => `
            <div class="receipt-line">
                <span>${item.name} (${item.quantity}x)</span>
                <span>R$ ${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');

        saleCard.innerHTML = `
            <h3>VENDA #${sale.id}</h3>
            <p>Data: ${new Date(sale.date).toLocaleString()}</p>
            <p>Cliente: ${sale.customerName || 'Não Informado'}</p>
            <p>CPF: ${sale.customerCpf || 'Não Informado'}</p>
            <hr>
            <h4>Itens:</h4>
            ${itemsHtml}
            <div class="receipt-line receipt-total">
                <span>TOTAL:</span>
                <span>R$ ${sale.total.toFixed(2)}</span>
            </div>
            <p>Pagamento: ${sale.paymentMethod}</p>
            ${sale.change ? `<p>Troco: R$ ${sale.change.toFixed(2)}</p>` : ''}
            <button class="btn btn-primary btn-sm" style="margin-top: 1rem;" onclick="reprintReceipt(${sale.id})">Reimprimir</button>
        `;
        salesHistoryDiv.appendChild(saleCard);
    });
}

function renderInventoryManagement() {
    inventoryManagementDiv.innerHTML = '';
    if (products.length === 0) {
        inventoryManagementDiv.innerHTML = '<p style="text-align: center; color: var(--secondary-text);">Nenhum produto em estoque.</p>';
        return;
    }

    const table = document.createElement('table');
    table.classList.add('data-table'); // Reutiliza estilo de tabela
    table.innerHTML = `
        <thead>
            <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Preço</th>
                <th>Estoque</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody>
            ${products.map(product => `
                <tr>
                    <td>${product.id}</td>
                    <td>${product.name}</td>
                    <td>${product.category}</td>
                    <td>R$ ${product.price.toFixed(2)}</td>
                    <td><span class="${product.stock <= 5 ? 'danger-color' : ''}">${product.stock}</span></td>
                    <td class="table-actions">
                        <button class="btn btn-primary btn-sm" onclick="editProduct(${product.id})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})">Deletar</button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;
    inventoryManagementDiv.appendChild(table);
}

// --- Funções de Manipulação do Carrinho ---
function addProductToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        alert('Produto não encontrado!');
        return;
    }
    if (product.stock <= 0) {
        alert('Produto fora de estoque!');
        return;
    }

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        if (product.stock > existingItem.quantity) {
            existingItem.quantity++;
        } else {
            alert('Estoque insuficiente para adicionar mais!');
            return;
        }
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }
    product.stock--; // Decrementa o estoque do produto
    saveProducts(); // Salva o estoque atualizado
    renderCart();
    renderProducts(products); // Atualiza exibição do estoque na lista de produtos
    renderInventoryManagement(); // Atualiza exibição do estoque na gestão
}

function updateCartItemQuantity(productId, action) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex === -1) return;

    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (action === 'increase') {
        if (product.stock > 0) {
            cart[itemIndex].quantity++;
            product.stock--;
        } else {
            alert('Estoque insuficiente!');
        }
    } else if (action === 'decrease') {
        if (cart[itemIndex].quantity > 1) {
            cart[itemIndex].quantity--;
            product.stock++;
        } else {
            removeProductFromCart(productId); // Remove se a quantidade for 1 e for decrementada
            return; // Sai da função para evitar renderizar duas vezes
        }
    }
    saveProducts();
    renderCart();
    renderProducts(products);
    renderInventoryManagement();
}

function removeProductFromCart(productId) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex === -1) return;

    const product = products.find(p => p.id === productId);
    if (product) {
        product.stock += cart[itemIndex].quantity; // Devolve ao estoque
    }
    cart.splice(itemIndex, 1);
    saveProducts();
    renderCart();
    renderProducts(products);
    renderInventoryManagement();
}

function clearCart() {
    // Devolve todos os itens do carrinho para o estoque antes de limpar
    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product) {
            product.stock += item.quantity;
        }
    });
    cart = [];
    saveProducts();
    saveCart();
    renderCart();
    renderProducts(products);
    renderInventoryManagement();
}

// --- Funções de Venda ---
function calculateTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function finishSale() {
    if (cart.length === 0) {
        alert('Carrinho vazio! Adicione produtos para finalizar a venda.');
        return;
    }

    const total = calculateTotal();
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    let customerName = customerNameInput.value.trim();
    let customerCpf = customerCpfInput.value.trim();
    let change = 0;

    if (paymentMethod === 'Dinheiro') {
        const receivedAmount = parseFloat(cashChangeInput.value);
        if (isNaN(receivedAmount) || receivedAmount < total) {
            alert('Valor recebido inválido ou insuficiente para o pagamento em dinheiro!');
            return;
        }
        change = receivedAmount - total;
    }

    const newSaleId = salesHistory.length > 0 ? Math.max(...salesHistory.map(s => s.id)) + 1 : 1;
    const newSale = {
        id: newSaleId,
        date: new Date().toISOString(),
        items: [...cart], // Copia os itens do carrinho
        total: total,
        paymentMethod: paymentMethod,
        customerName: customerName,
        customerCpf: customerCpf,
        change: change > 0 ? change : null // Só registra troco se houver
    };

    salesHistory.push(newSale);
    saveSalesHistory();
    displayReceipt(newSale);
    clearCart();
    customerNameInput.value = '';
    customerCpfInput.value = '';
    cashChangeInput.value = '';
    cashChangeContainer.style.display = 'none';
    cashRadio.checked = true; // Volta para dinheiro
    renderSalesHistory();
}

function displayReceipt(sale) {
    receiptElement.style.display = 'block';
    receiptContentElement.innerHTML = `
        <div class="receipt-line"><span>VENDA ID:</span><span>#${sale.id}</span></div>
        <div class="receipt-line"><span>DATA:</span><span>${new Date(sale.date).toLocaleString()}</span></div>
        <div class="receipt-line"><span>CLIENTE:</span><span>${sale.customerName || 'Não Informado'}</span></div>
        <div class="receipt-line"><span>CPF:</span><span>${sale.customerCpf || 'Não Informado'}</span></div>
        <hr>
        <h4>ITENS:</h4>
        ${sale.items.map(item => `
            <div class="receipt-line">
                <span>${item.name} (${item.quantity}x)</span>
                <span>R$ ${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('')}
        <div class="receipt-line receipt-total">
            <span>TOTAL:</span>
            <span>R$ ${sale.total.toFixed(2)}</span>
        </div>
        <div class="receipt-line"><span>PAGAMENTO:</span><span>${sale.paymentMethod}</span></div>
        ${sale.change ? `<div class="receipt-line"><span>TROCO:</span><span>R$ ${sale.change.toFixed(2)}</span></div>` : ''}
        <hr>
        <p style="text-align: center; font-size: 0.85rem;">Obrigado e volte sempre!</p>
    `;
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); // Rola para o final da página
}

function printReceipt() {
    window.print();
}

function saveReceiptAsPdf() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const receiptHtml = receiptContentElement.innerHTML;

    doc.html(receiptHtml, {
        callback: function (doc) {
            doc.save(`recibo_venda_${new Date().getTime()}.pdf`);
        },
        x: 10,
        y: 10,
        width: 190 // Largura do conteúdo no PDF
    });
}

function reprintReceipt(saleId) {
    const sale = salesHistory.find(s => s.id === saleId);
    if (sale) {
        displayReceipt(sale);
    } else {
        alert('Venda não encontrada!');
    }
}

function cancelSale() {
    if (confirm('Tem certeza que deseja cancelar esta venda? Todos os itens no carrinho serão perdidos.')) {
        clearCart();
        customerNameInput.value = '';
        customerCpfInput.value = '';
        cashChangeInput.value = '';
        cashChangeContainer.style.display = 'none';
        cashRadio.checked = true;
        receiptElement.style.display = 'none'; // Esconde o recibo se estiver visível
    }
}

function holdSale() {
    if (cart.length === 0) {
        alert('Carrinho vazio! Não há venda para segurar.');
        return;
    }

    const saleName = prompt('Nome para identificar a venda segura (ex: "Cliente 1", "Mesa 5"):');
    if (!saleName) {
        alert('Nome da venda segura é obrigatório para segurá-la.');
        return;
    }

    const heldSale = {
        id: heldSales.length > 0 ? Math.max(...heldSales.map(s => s.id)) + 1 : 1,
        name: saleName,
        items: [...cart], // Copia os itens
        customerName: customerNameInput.value.trim(),
        customerCpf: customerCpfInput.value.trim(),
        date: new Date().toISOString()
    };
    heldSales.push(heldSale);
    saveHeldSales();
    alert(`Venda "${saleName}" foi segurada.`);
    clearCart();
    customerNameInput.value = '';
    customerCpfInput.value = '';
    cashChangeInput.value = '';
    cashChangeContainer.style.display = 'none';
    cashRadio.checked = true;
    renderHeldSales(); // Renderiza a lista de vendas seguras
}

function renderHeldSales() {
    // Isso precisaria de um lugar no HTML para ser exibido.
    // Para simplificar, vamos apenas logar no console por enquanto.
    // console.log('Vendas Seguras:', heldSales);
    // Se quiser exibir na interface, você precisaria de um modal ou uma nova aba para "Vendas Seguras"
}

// --- Funções de Gerenciamento de Estoque (aqui como CRUD básico) ---
function addProductToInventory(event) {
    event.preventDefault();
    const name = newProductNameInput.value.trim();
    const category = newProductCategoryInput.value.trim();
    const price = parseFloat(newProductPriceInput.value);
    const stock = parseInt(newProductStockInput.value);

    if (!name || !category || isNaN(price) || price <= 0 || isNaN(stock) || stock < 0) {
        alert('Por favor, preencha todos os campos do produto corretamente!');
        return;
    }

    const newProductId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    products.push({ id: newProductId, name, category, price, stock });
    saveProducts();
    renderProducts(products);
    renderInventoryManagement();
    newProductNameInput.value = '';
    newProductCategoryInput.value = '';
    newProductPriceInput.value = '';
    newProductStockInput.value = '';
    alert('Produto adicionado ao estoque!');
}

function editProduct(productId) {
    // Esta função deveria levar para a página de configuração de produtos,
    // ou abrir um modal de edição. Por enquanto, apenas um alerta.
    alert(`Funcionalidade de edição para o produto ID: ${productId} está disponível na página de Configurações.`);
    // Em um sistema real, você redirecionaria para config.html?editProduct=${productId}
    // ou usaria um modal aqui mesmo.
}

function deleteProduct(productId) {
    if (confirm('Tem certeza que deseja deletar este produto do estoque?')) {
        products = products.filter(p => p.id !== productId);
        saveProducts();
        renderProducts(products);
        renderInventoryManagement();
        alert('Produto deletado do estoque!');
    }
}

// --- Configuração de Event Listeners ---
function setupEventListeners() {
    // Listener para o carrinho (delegation)
    cartItemsContainer.addEventListener('click', function(event) {
        const target = event.target;
        const productId = parseInt(target.dataset.id);

        if (target.classList.contains('quantity-btn')) {
            updateCartItemQuantity(productId, target.dataset.action);
        } else if (target.classList.contains('remove-btn')) {
            removeProductFromCart(productId);
        }
    });

    finishSaleBtn.addEventListener('click', finishSale);
    cancelSaleBtn.addEventListener('click', cancelSale);
    holdSaleBtn.addEventListener('click', holdSale);
    addProductBtn.addEventListener('click', addProductToInventory);
    productSearchInput.addEventListener('input', function(event) {
        const searchTerm = event.target.value.toLowerCase();
        const filteredProducts = products.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );
        renderProducts(filteredProducts);
    });

    // Abas
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));

            this.classList.add('active');
            document.getElementById(this.dataset.tab + '-tab').classList.add('active');
            
            // Recarregar renderização para garantir que estão atualizadas
            if (this.dataset.tab === 'sales') {
                renderSalesHistory();
            } else if (this.dataset.tab === 'inventory') {
                renderInventoryManagement();
            }
        });
    });

    // Mostrar/Esconder campo de troco
    document.querySelectorAll('input[name="payment"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'Dinheiro') {
                cashChangeContainer.style.display = 'block';
                cashChangeInput.focus();
            } else {
                cashChangeContainer.style.display = 'none';
            }
        });
    });
}

// --- Funções de Plano de Fundo (MANTIDAS AQUI, mas o controle está no config.js) ---
function applySavedBackground() {
    const savedBackground = localStorage.getItem('selectedBackground');
    if (savedBackground && savedBackground !== 'none') {
        document.body.style.backgroundImage = `url(${savedBackground})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
    } else {
        document.body.style.backgroundImage = 'none';
    }
}