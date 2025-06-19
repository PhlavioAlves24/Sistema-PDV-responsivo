// Banco de dados de produtos (simulado)
let products = [
    { id: 1, name: "Arroz 5kg", price: 22.90, stock: 50, category: "Alimentos" },
    { id: 2, name: "Feijão 1kg", price: 8.50, stock: 60, category: "Alimentos" },
    { id: 3, name: "Óleo de Soja", price: 7.20, stock: 40, category: "Alimentos" },
    { id: 4, name: "Açúcar 1kg", price: 4.30, stock: 70, category: "Alimentos" },
    { id: 5, name: "Café 500g", price: 12.90, stock: 30, category: "Alimentos" },
    { id: 6, name: "Sabão em Pó", price: 15.80, stock: 25, category: "Limpeza" },
    { id: 7, name: "Detergente", price: 2.50, stock: 80, category: "Limpeza" },
    { id: 8, name: "Desinfetante", price: 6.90, stock: 35, category: "Limpeza" },
    { id: 9, name: "Shampoo", price: 14.50, stock: 20, category: "Higiene" },
    { id: 10, name: "Sabonete", price: 1.80, stock: 100, category: "Higiene" }
];

// Carrinho de compras
let cart = [];

// Histórico de vendas
let salesHistory = []; // Será carregado/salvo no localStorage em um sistema real

// Elementos DOM
const productList = document.getElementById('product-list');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const productSearch = document.getElementById('product-search');
const cancelSaleBtn = document.getElementById('cancel-sale');
const holdSaleBtn = document.getElementById('hold-sale');
const finishSaleBtn = document.getElementById('finish-sale');
const receipt = document.getElementById('receipt');
const receiptContent = document.getElementById('receipt-content');
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const paymentMethods = document.querySelectorAll('input[name="payment"]');
const cashChangeContainer = document.getElementById('cash-change-container');
const cashChangeInput = document.getElementById('cash-change');
const customerNameInput = document.getElementById('customer-name');
const customerCpfInput = document.getElementById('customer-cpf');

// Novos elementos DOM para configurações
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeButton = document.querySelector('.close-button');
const backgroundOptions = document.querySelectorAll('input[name="background-image"]');

// Elementos para Adição de Produto
const newProductNameInput = document.getElementById('new-product-name');
const newProductCategoryInput = document.getElementById('new-product-category');
const newProductPriceInput = document.getElementById('new-product-price');
const newProductStockInput = document.getElementById('new-product-stock');
const addProductBtn = document.getElementById('add-product-btn');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    renderProducts();
    setupEventListeners();
    cashChangeContainer.style.display = 'none';
    loadSavedSettings(); // Carrega as configurações salvas
    loadSalesHistory(); // Carrega o histórico de vendas ao iniciar
    loadInventory(); // Carrega o estoque ao iniciar
    renderSalesHistory(); // Renderiza o histórico de vendas na inicialização
    renderInventoryManagement(); // Renderiza o gerenciamento de estoque na inicialização
});

// Renderiza a lista de produtos
function renderProducts(filter = '') {
    productList.innerHTML = '';

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(filter.toLowerCase()) ||
        product.category.toLowerCase().includes(filter.toLowerCase())
    );

    if (filteredProducts.length === 0) {
        productList.innerHTML = '<div class="empty-cart">Nenhum produto encontrado.</div>';
        return;
    }

    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        // Adiciona uma classe para indicar se está fora de estoque
        if (product.stock <= 0) {
            productCard.classList.add('out-of-stock');
            productCard.style.opacity = '0.6'; // Visualmente indica fora de estoque
            productCard.style.cursor = 'not-allowed';
        }
        
        productCard.innerHTML = `
            <h3>${product.name}</h3>
            <p>${product.category}</p>
            <p class="price">R$ ${product.price.toFixed(2)}</p>
            <p>Estoque: ${product.stock}</p>
        `;
        
        // Adiciona ao carrinho apenas se houver estoque
        if (product.stock > 0) {
            productCard.addEventListener('click', () => addToCart(product));
        }
        
        productList.appendChild(productCard);
    });
}

// Adiciona produto ao carrinho
function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity++;
        } else {
            alert('Quantidade em estoque insuficiente!');
            return;
        }
    } else {
        if (product.stock > 0) {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1
            });
        } else {
            alert('Produto sem estoque!'); // Deveria ser impedido pelo renderProducts
            return;
        }
    }

    updateCart();
}

// Atualiza o carrinho na tela
function updateCart() {
    cartItems.innerHTML = '';

    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Carrinho vazio</div>';
        cartTotal.textContent = 'Total: R$ 0,00';
        return;
    }

    let total = 0;

    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <p>R$ ${item.price.toFixed(2)}</p>
            </div>
            <div class="cart-item-actions">
                <div class="quantity-control">
                    <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn increase" data-id="${item.id}">+</button>
                </div>
                <button class="remove-btn" data-id="${item.id}">Remover</button>
            </div>
        `;

        cartItems.appendChild(itemElement);
        total += item.price * item.quantity;
    });

    cartTotal.textContent = `Total: R$ ${total.toFixed(2)}`;

    // Adiciona event listeners para os botões de quantidade e remoção
    document.querySelectorAll('.decrease').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            decreaseQuantity(id);
        });
    });

    document.querySelectorAll('.increase').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            increaseQuantity(id);
        });
    });

    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            removeFromCart(id);
        });
    });
}

// Diminui a quantidade de um item no carrinho
function decreaseQuantity(id) {
    const item = cart.find(item => item.id === id);

    if (item.quantity > 1) {
        item.quantity--;
    } else {
        removeFromCart(id);
        return;
    }

    updateCart();
}

// Aumenta a quantidade de um item no carrinho
function increaseQuantity(id) {
    const item = cart.find(item => item.id === id);
    const product = products.find(p => p.id === id);

    if (item.quantity < product.stock) {
        item.quantity++;
    } else {
        alert('Quantidade em estoque insuficiente!');
        return;
    }

    updateCart();
}

// Remove um item do carrinho
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCart();
}

// Configura os event listeners
function setupEventListeners() {
    // Pesquisa de produtos
    productSearch.addEventListener('input', (e) => {
        renderProducts(e.target.value);
    });

    // Botões de ação
    cancelSaleBtn.addEventListener('click', cancelSale);
    holdSaleBtn.addEventListener('click', holdSale);
    finishSaleBtn.addEventListener('click', finishSale);

    // Tabs
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const targetTabId = `${tab.getAttribute('data-tab')}-tab`;
            document.getElementById(targetTabId).classList.add('active');

            // Renderiza o conteúdo da aba quando ela é ativada
            if (tab.getAttribute('data-tab') === 'sales') {
                renderSalesHistory();
            } else if (tab.getAttribute('data-tab') === 'inventory') {
                renderInventoryManagement();
            } else if (tab.getAttribute('data-tab') === 'products') {
                renderProducts(); // Re-renderiza produtos para atualizar estoque
            }
        });
    });

    // Métodos de pagamento
    paymentMethods.forEach(method => {
        method.addEventListener('change', (e) => {
            if (e.target.value === 'Dinheiro') {
                cashChangeContainer.style.display = 'block';
            } else {
                cashChangeContainer.style.display = 'none';
            }
        });
    });

    // Event listeners para o modal de configurações
    settingsBtn.addEventListener('click', () => {
        settingsModal.style.display = 'flex'; // Exibe o modal
    });

    closeButton.addEventListener('click', () => {
        settingsModal.style.display = 'none'; // Esconde o modal
    });

    // Fecha o modal se clicar fora dele
    window.addEventListener('click', (e) => {
        if (e.target == settingsModal) {
            settingsModal.style.display = 'none';
        }
    });

    // Event listeners para as opções de plano de fundo
    backgroundOptions.forEach(option => {
        option.addEventListener('change', (e) => {
            applyBackground(e.target.value);
            saveSetting('backgroundImage', e.target.value); // Salva a preferência
        });
    });

    // Event listener para adicionar novo produto
    addProductBtn.addEventListener('click', addNewProduct);
}

// Cancela a venda atual
function cancelSale() {
    if (confirm('Tem certeza que deseja cancelar a venda atual?')) {
        cart = [];
        updateCart();
        customerNameInput.value = '';
        customerCpfInput.value = '';
        document.getElementById('cash').checked = true;
        cashChangeContainer.style.display = 'none';
        cashChangeInput.value = '';
        receipt.style.display = 'none';
    }
}

// Segura a venda atual (simulação)
function holdSale() {
    if (cart.length === 0) {
        alert('Carrinho vazio!');
        return;
    }

    alert('Venda segura temporariamente. Você pode retomar mais tarde.');
    // Em um sistema real, isso salvaria a venda em um estado "pendente" no localStorage ou servidor
}

// Finaliza a venda
function finishSale() {
    if (cart.length === 0) {
        alert('Carrinho vazio para finalizar!');
        return;
    }

    const customerName = customerNameInput.value || 'Consumidor Final';
    const customerCpf = customerCpfInput.value || 'Não informado';
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

    let total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let change = 0;

    if (paymentMethod === 'Dinheiro') {
        const cashReceived = parseFloat(cashChangeInput.value);

        if (isNaN(cashReceived) || cashReceived <= 0) {
            alert('Informe um valor recebido válido para pagamento em dinheiro!');
            return;
        }

        if (cashReceived < total) {
            alert(`Valor recebido (R$ ${cashReceived.toFixed(2)}) é menor que o total da compra (R$ ${total.toFixed(2)})!`);
            return;
        }

        change = cashReceived - total;
    }

    // Atualiza o estoque e salva
    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product) {
            product.stock -= item.quantity;
        }
    });
    saveInventory(); // Salva o estoque atualizado

    // Cria o recibo
    generateReceipt(customerName, customerCpf, paymentMethod, change);

    // Adiciona ao histórico de vendas e salva
    const sale = {
        id: Date.now(), // ID único para a venda
        date: new Date().toISOString(), // Salva como string ISO para fácil serialização
        items: JSON.parse(JSON.stringify(cart)), // Copia os itens do carrinho
        total,
        customerName,
        customerCpf,
        paymentMethod,
        change
    };

    salesHistory.unshift(sale); // Adiciona a venda mais recente no início
    saveSalesHistory(); // Salva o histórico de vendas

    // Limpa o carrinho
    cart = [];
    updateCart();
    customerNameInput.value = '';
    customerCpfInput.value = '';
    document.getElementById('cash').checked = true;
    cashChangeContainer.style.display = 'none';
    cashChangeInput.value = '';

    // Mostra o recibo
    receipt.style.display = 'block';

    // Re-renderiza as abas de produtos, histórico e estoque para refletir as mudanças
    renderProducts();
    renderSalesHistory();
    renderInventoryManagement();
}

// Gera o recibo da venda
function generateReceipt(customerName, customerCpf, paymentMethod, change = 0) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR');
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    let total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    let receiptHTML = `
        <div class="receipt-line">Data: ${dateStr} ${timeStr}</div>
        <div class="receipt-line">Cliente: ${customerName}</div>
        <div class="receipt-line">CPF: ${customerCpf}</div>
        <div class="receipt-line">--------------------------------</div>
    `;

    cart.forEach(item => {
        receiptHTML += `
            <div class="receipt-line">
                <span>${item.name} x${item.quantity}</span>
                <span>R$ ${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `;
    });

    receiptHTML += `
        <div class="receipt-line">--------------------------------</div>
        <div class="receipt-line receipt-total">
            <span>TOTAL:</span>
            <span>R$ ${total.toFixed(2)}</span>
        </div>
        <div class="receipt-line">Forma de pagamento: ${paymentMethod}</div>
    `;

    if (paymentMethod === 'Dinheiro') {
        receiptHTML += `
            <div class="receipt-line">Valor Recebido: R$ ${(total + change).toFixed(2)}</div>
            <div class="receipt-line">Troco: R$ ${change.toFixed(2)}</div>
        `;
    }

    receiptHTML += `
        <div class="receipt-line">--------------------------------</div>
        <div class="receipt-line" style="text-align: center;">Obrigado pela preferência!</div>
        <div class="receipt-line" style="text-align: center;">Volte sempre!</div>
    `;

    receiptContent.innerHTML = receiptHTML;
}

// Função para imprimir o recibo
function printReceipt() {
    window.print();
}

// Função para salvar o recibo como PDF
function saveReceiptAsPdf() {
    // Verifica se a biblioteca jsPDF está disponível
    if (typeof window.jspdf === 'undefined') {
        alert('A biblioteca jsPDF não está carregada. Certifique-se de incluí-la no seu HTML.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Captura o conteúdo do recibo
    const receiptHtml = receiptContent.innerHTML;

    // Use html2canvas ou similar para converter HTML em imagem para o PDF
    // Para simplificar, vou adicionar o texto diretamente. Para HTML complexo,
    // considere usar um plugin como html2canvas com jsPDF.
    
    // Convertendo o HTML do recibo em texto para adicionar ao PDF
    const parser = new DOMParser();
    const docElement = parser.parseFromString(receiptHtml, 'text/html');
    const lines = docElement.body.innerText.split('\n').filter(line => line.trim() !== '');

    let y = 10;
    doc.setFontSize(10);
    lines.forEach(line => {
        if (y > 280) { // Nova página se o conteúdo exceder a altura
            doc.addPage();
            y = 10;
        }
        doc.text(line, 10, y);
        y += 7; // Espaçamento entre as linhas
    });

    doc.save('recibo_venda.pdf');
}

// --- Funções para Abas e Gerenciamento de Dados (Local Storage) ---

// Renderiza o histórico de vendas
function renderSalesHistory() {
    const salesHistoryDiv = document.getElementById('sales-history');
    salesHistoryDiv.innerHTML = ''; // Limpa o conteúdo anterior

    if (salesHistory.length === 0) {
        salesHistoryDiv.innerHTML = '<div class="empty-cart">Nenhuma venda registrada ainda.</div>';
        return;
    }

    salesHistory.forEach((sale, index) => {
        const saleDate = new Date(sale.date); // Converte de volta para objeto Date
        const saleElement = document.createElement('div');
        saleElement.className = 'sale-item';
        saleElement.style.marginBottom = '1rem';
        saleElement.style.padding = '1rem';
        saleElement.style.border = '1px solid var(--medium-gray)';
        saleElement.style.borderRadius = 'var(--border-radius)';
        saleElement.style.backgroundColor = 'var(--white)';

        saleElement.innerHTML = `
            <h4>Venda #${salesHistory.length - index} - ${saleDate.toLocaleString('pt-BR')}</h4>
            <p><strong>Cliente:</strong> ${sale.customerName} ${sale.customerCpf !== 'Não informado' ? `(${sale.customerCpf})` : ''}</p>
            <p><strong>Total:</strong> R$ ${sale.total.toFixed(2)}</p>
            <p><strong>Pagamento:</strong> ${sale.paymentMethod} ${sale.paymentMethod === 'Dinheiro' ? ` (Troco: R$ ${sale.change.toFixed(2)})` : ''}</p>
            <p><strong>Itens:</strong></p>
            <ul>
                ${sale.items.map(item => `<li>${item.name} x${item.quantity} - R$ ${(item.price * item.quantity).toFixed(2)}</li>`).join('')}
            </ul>
        `;
        salesHistoryDiv.appendChild(saleElement);
    });
}

// Renderiza o gerenciamento de estoque
function renderInventoryManagement() {
    const inventoryManagementDiv = document.getElementById('inventory-management');
    inventoryManagementDiv.innerHTML = ''; // Limpa o conteúdo anterior

    if (products.length === 0) {
        inventoryManagementDiv.innerHTML = '<div class="empty-cart">Nenhum produto no estoque. Adicione um novo produto acima.</div>';
        return;
    }

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.innerHTML = `
        <thead>
            <tr style="background-color: var(--primary-color); color: var(--white);">
                <th style="padding: 0.8rem; text-align: left;">ID</th>
                <th style="padding: 0.8rem; text-align: left;">Nome</th>
                <th style="padding: 0.8rem; text-align: left;">Categoria</th>
                <th style="padding: 0.8rem; text-align: right;">Preço</th>
                <th style="padding: 0.8rem; text-align: right;">Estoque</th>
                <th style="padding: 0.8rem; text-align: center;">Ações</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;
    const tbody = table.querySelector('tbody');

    products.forEach(product => {
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid var(--medium-gray)';
        row.innerHTML = `
            <td style="padding: 0.8rem;">${product.id}</td>
            <td style="padding: 0.8rem;">${product.name}</td>
            <td style="padding: 0.8rem;">${product.category}</td>
            <td style="padding: 0.8rem; text-align: right;">R$ ${product.price.toFixed(2)}</td>
            <td style="padding: 0.8rem; text-align: right;">
                <input type="number" data-id="${product.id}" value="${product.stock}" min="0" style="width: 60px; text-align: right; border: 1px solid var(--medium-gray); border-radius: 4px; padding: 4px;">
            </td>
            <td style="padding: 0.8rem; text-align: center;">
                <button class="btn btn-primary btn-sm update-stock-btn" data-id="${product.id}" style="padding: 0.4rem 0.8rem; font-size: 0.8em; margin-right: 5px;">Atualizar</button>
                <button class="btn btn-danger btn-sm delete-product-btn" data-id="${product.id}" style="padding: 0.4rem 0.8rem; font-size: 0.8em;">Deletar</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    inventoryManagementDiv.appendChild(table);

    // Adiciona event listeners para os botões de atualização de estoque
    document.querySelectorAll('.update-stock-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.getAttribute('data-id'));
            const stockInput = e.target.closest('tr').querySelector('input[type="number"]');
            const newStock = parseInt(stockInput.value);

            if (!isNaN(newStock) && newStock >= 0) {
                const productToUpdate = products.find(p => p.id === productId);
                if (productToUpdate) {
                    productToUpdate.stock = newStock;
                    saveInventory(); // Salva o estoque após a atualização
                    renderProducts(); // Atualiza a aba de produtos
                    alert(`Estoque de "${productToUpdate.name}" atualizado para ${newStock}.`);
                }
            } else {
                alert('Por favor, insira um valor de estoque válido.');
            }
        });
    });

    // Adiciona event listeners para os botões de deletar produto
    document.querySelectorAll('.delete-product-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.getAttribute('data-id'));
            deleteProduct(productId);
        });
    });
}

// Adiciona um novo produto ao estoque
function addNewProduct() {
    const name = newProductNameInput.value.trim();
    const category = newProductCategoryInput.value.trim();
    const price = parseFloat(newProductPriceInput.value);
    const stock = parseInt(newProductStockInput.value);

    if (!name || !category || isNaN(price) || price <= 0 || isNaN(stock) || stock < 0) {
        alert('Por favor, preencha todos os campos corretamente para adicionar um novo produto.');
        return;
    }

    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;

    const newProduct = {
        id: newId,
        name,
        price,
        stock,
        category
    };

    products.push(newProduct);
    saveInventory(); // Salva o novo produto no Local Storage
    renderInventoryManagement(); // Atualiza a tabela de estoque
    renderProducts(); // Atualiza a lista de produtos na aba principal
    
    // Limpa os campos do formulário
    newProductNameInput.value = '';
    newProductCategoryInput.value = '';
    newProductPriceInput.value = '';
    newProductStockInput.value = '';

    alert(`Produto "${name}" adicionado com sucesso!`);
}

// Deleta um produto do estoque
function deleteProduct(id) {
    if (confirm('Tem certeza que deseja deletar este produto? Esta ação é irreversível.')) {
        products = products.filter(p => p.id !== id);
        saveInventory(); // Salva o estoque após a exclusão
        renderInventoryManagement(); // Atualiza a tabela de estoque
        renderProducts(); // Atualiza a lista de produtos na aba principal
        alert('Produto deletado com sucesso!');
    }
}

// Aplica a imagem de fundo ao corpo do documento
function applyBackground(imagePath) {
    const body = document.body;
    if (imagePath === 'none') {
        body.style.backgroundImage = 'none';
        body.style.backgroundSize = 'auto';
        body.style.backgroundRepeat = 'unset';
        body.style.backgroundAttachment = 'scroll';
        body.style.backgroundColor = 'var(--light-gray)'; // Volta para a cor padrão
    } else {
        body.style.backgroundImage = `url(${imagePath})`;
        body.style.backgroundSize = 'cover';
        body.style.backgroundRepeat = 'no-repeat';
        body.style.backgroundAttachment = 'fixed'; // Para fixar a imagem ao fundo
    }
}

// Salva uma configuração no Local Storage
function saveSetting(key, value) {
    localStorage.setItem(key, value);
}

// Carrega as configurações salvas do Local Storage
function loadSavedSettings() {
    const savedBackgroundImage = localStorage.getItem('backgroundImage');
    if (savedBackgroundImage) {
        applyBackground(savedBackgroundImage);
        // Marca o radio button correto
        const radioToSelect = document.querySelector(`input[name="background-image"][value="${savedBackgroundImage}"]`);
        if (radioToSelect) {
            radioToSelect.checked = true;
        }
    }
}

// Salva o histórico de vendas no Local Storage
function saveSalesHistory() {
    localStorage.setItem('salesHistory', JSON.stringify(salesHistory));
}

// Carrega o histórico de vendas do Local Storage
function loadSalesHistory() {
    const savedSales = localStorage.getItem('salesHistory');
    if (savedSales) {
        salesHistory = JSON.parse(savedSales);
    }
}

// Salva o estado atual do estoque no Local Storage
function saveInventory() {
    localStorage.setItem('productsInventory', JSON.stringify(products));
}

// Carrega o estado do estoque do Local Storage
function loadInventory() {
    const savedProducts = localStorage.getItem('productsInventory');
    if (savedProducts) {
        // Assegura que o ID e outros atributos sejam mantidos corretamente
        // Certifique-se de que a estrutura do objeto 'product' seja consistente
        products = JSON.parse(savedProducts).map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            stock: p.stock,
            category: p.category
        }));
    }
}