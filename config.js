// scripts/config.js

// Arrays para armazenar os dados (simulando um banco de dados com localStorage)
let users = [];
let clients = [];
let products = []; // Produtos para gerenciamento de estoque na config.html

// Elementos DOM para Usuários
const userForm = document.getElementById('user-form');
const userIdInput = document.getElementById('user-id');
const userNameInput = document.getElementById('user-name');
const userRoleSelect = document.getElementById('user-role');
const userPasswordInput = document.getElementById('user-password');
const usersTableBody = document.querySelector('#users-table tbody');
const cancelUserEditBtn = document.getElementById('cancel-user-edit');

// Elementos DOM para Clientes
const clientForm = document.getElementById('client-form');
const clientIdInput = document.getElementById('client-id');
const clientNameInput = document.getElementById('client-name');
const clientCpfInput = document.getElementById('client-cpf');
const clientPhoneInput = document.getElementById('client-phone');
const clientAddressInput = document.getElementById('client-address');
const clientsTableBody = document.querySelector('#clients-table tbody');
const cancelClientEditBtn = document.getElementById('cancel-client-edit');

// Elementos DOM para Produtos (da página de configuração, não do PDV)
const productConfigForm = document.getElementById('product-config-form');
const productConfigIdInput = document.getElementById('product-config-id');
const productConfigNameInput = document.getElementById('product-config-name');
const productConfigCategoryInput = document.getElementById('product-config-category');
const productConfigPriceInput = document.getElementById('product-config-price');
const productConfigStockInput = document.getElementById('product-config-stock');
const productsConfigTableBody = document.querySelector('#products-config-table tbody');
const cancelProductConfigEditBtn = document.getElementById('cancel-product-config-edit');

// Elementos DOM para Configurações de Plano de Fundo (NOVO)
const backgroundOptions = document.querySelector('.background-options');


document.addEventListener('DOMContentLoaded', function() {
    loadData(); // Carrega todos os dados do localStorage
    renderUsers();
    renderClients();
    renderProductsConfig(); // Renderiza produtos na tabela de configuração
    setupEventListenersConfig();
    loadBackgroundSettings(); // Carrega e aplica as configurações de fundo
});

function setupEventListenersConfig() {
    // Formulário de Usuários
    userForm.addEventListener('submit', addUserOrUpdate);
    cancelUserEditBtn.addEventListener('click', () => resetForm(userForm, cancelUserEditBtn));

    // Formulário de Clientes
    clientForm.addEventListener('submit', addClientOrUpdate);
    cancelClientEditBtn.addEventListener('click', () => resetForm(clientForm, cancelClientEditBtn));

    // Formulário de Produtos (configuração)
    productConfigForm.addEventListener('submit', addProductConfigOrUpdate);
    cancelProductConfigEditBtn.addEventListener('click', () => resetForm(productConfigForm, cancelProductConfigEditBtn));

    // Listeners para as opções de plano de fundo (NOVO)
    if (backgroundOptions) {
        backgroundOptions.addEventListener('change', function(event) {
            if (event.target.name === 'background-image') {
                const selectedValue = event.target.value;
                saveBackgroundSettings(selectedValue);
                applyBackground(selectedValue);
            }
        });
    }
}

// --- Funções de Carregamento e Salvamento de Dados ---
function loadData() {
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
        users = JSON.parse(savedUsers);
    }
    const savedClients = localStorage.getItem('clients');
    if (savedClients) {
        clients = JSON.parse(savedClients);
    }
    // Sempre carregue os produtos do localStorage para garantir que 'products' esteja atualizado
    const savedProducts = localStorage.getItem('productsInventory'); 
    if (savedProducts) {
        products = JSON.parse(savedProducts);
    } else {
        // Se não houver produtos, inicialize com uma lista vazia ou padrão
        products = []; 
    }
}

function saveData() {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('clients', JSON.stringify(clients));
    localStorage.setItem('productsInventory', JSON.stringify(products)); // Salva produtos também
}

// --- Funções para Usuários/Vendedores ---
function renderUsers() {
    usersTableBody.innerHTML = '';
    if (users.length === 0) {
        usersTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Nenhum usuário cadastrado.</td></tr>';
        return;
    }
    users.forEach(user => {
        const row = usersTableBody.insertRow();
        // Adiciona o atributo data-label para responsividade da tabela
        row.innerHTML = `
            <td data-label="ID">${user.id}</td>
            <td data-label="Nome">${user.name}</td>
            <td data-label="Cargo">${user.role}</td>
            <td data-label="Ações" class="table-actions">
                <button class="btn btn-primary btn-sm" onclick="editUser(${user.id})">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="deleteUser(${user.id})">Deletar</button>
            </td>
        `;
    });
}

function addUserOrUpdate(event) {
    event.preventDefault();
    const id = userIdInput.value;
    const name = userNameInput.value.trim();
    const role = userRoleSelect.value;
    const password = userPasswordInput.value;

    if (!name || !role) {
        alert('Nome e Cargo são obrigatórios!');
        return;
    }

    if (id) {
        // Atualizar usuário existente
        const userIndex = users.findIndex(u => u.id == id);
        if (userIndex > -1) {
            users[userIndex].name = name;
            users[userIndex].role = role;
            if (password) { // Só atualiza a senha se um novo valor for digitado
                users[userIndex].password = password; // Em um sistema real, aqui você usaria hash da senha
            }
            alert('Usuário atualizado com sucesso!');
        }
    } else {
        // Adicionar novo usuário
        const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
        users.push({ id: newId, name, role, password }); // Em um sistema real, hash da senha seria feito aqui
        alert('Usuário adicionado com sucesso!');
    }

    saveData();
    renderUsers();
    resetForm(userForm, cancelUserEditBtn);
}

function editUser(id) {
    const user = users.find(u => u.id === id);
    if (user) {
        userIdInput.value = user.id;
        userNameInput.value = user.name;
        userRoleSelect.value = user.role;
        userPasswordInput.value = ''; // Limpa o campo de senha por segurança, para não exibir a senha antiga
        cancelUserEditBtn.style.display = 'inline-block';
        userForm.querySelector('button[type="submit"]').textContent = 'Atualizar Usuário';
    }
}

function deleteUser(id) {
    if (confirm('Tem certeza que deseja deletar este usuário?')) {
        users = users.filter(u => u.id !== id);
        saveData();
        renderUsers();
        alert('Usuário deletado com sucesso!');
    }
}

// --- Funções para Clientes ---
function renderClients() {
    clientsTableBody.innerHTML = '';
    if (clients.length === 0) {
        clientsTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Nenhum cliente cadastrado.</td></tr>';
        return;
    }
    clients.forEach(client => {
        const row = clientsTableBody.insertRow();
        // Adiciona o atributo data-label para responsividade da tabela
        row.innerHTML = `
            <td data-label="ID">${client.id}</td>
            <td data-label="Nome">${client.name}</td>
            <td data-label="CPF/CNPJ">${client.cpf || 'N/A'}</td>
            <td data-label="Telefone">${client.phone || 'N/A'}</td>
            <td data-label="Ações" class="table-actions">
                <button class="btn btn-primary btn-sm" onclick="editClient(${client.id})">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="deleteClient(${client.id})">Deletar</button>
            </td>
        `;
    });
}

function addClientOrUpdate(event) {
    event.preventDefault();
    const id = clientIdInput.value;
    const name = clientNameInput.value.trim();
    const cpf = clientCpfInput.value.trim();
    const phone = clientPhoneInput.value.trim();
    const address = clientAddressInput.value.trim();

    if (!name) {
        alert('Nome do Cliente é obrigatório!');
        return;
    }

    if (id) {
        // Atualizar cliente existente
        const clientIndex = clients.findIndex(c => c.id == id);
        if (clientIndex > -1) {
            clients[clientIndex].name = name;
            clients[clientIndex].cpf = cpf;
            clients[clientIndex].phone = phone;
            clients[clientIndex].address = address;
            alert('Cliente atualizado com sucesso!');
        }
    } else {
        // Adicionar novo cliente
        const newId = clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1;
        clients.push({ id: newId, name, cpf, phone, address });
        alert('Cliente adicionado com sucesso!');
    }

    saveData();
    renderClients();
    resetForm(clientForm, cancelClientEditBtn);
}

function editClient(id) {
    const client = clients.find(c => c.id === id);
    if (client) {
        clientIdInput.value = client.id;
        clientNameInput.value = client.name;
        clientCpfInput.value = client.cpf;
        clientPhoneInput.value = client.phone;
        clientAddressInput.value = client.address;
        cancelClientEditBtn.style.display = 'inline-block';
        clientForm.querySelector('button[type="submit"]').textContent = 'Atualizar Cliente';
    }
}

function deleteClient(id) {
    if (confirm('Tem certeza que deseja deletar este cliente?')) {
        clients = clients.filter(c => c.id !== id);
        saveData();
        renderClients();
        alert('Cliente deletado com sucesso!');
    }
}

// --- Funções para Produtos (na página de configuração) ---
function renderProductsConfig() {
    productsConfigTableBody.innerHTML = '';
    if (products.length === 0) {
        productsConfigTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhum produto cadastrado.</td></tr>';
        return;
    }
    products.forEach(product => {
        const row = productsConfigTableBody.insertRow();
        // Adiciona o atributo data-label para responsividade da tabela
        row.innerHTML = `
            <td data-label="ID">${product.id}</td>
            <td data-label="Nome">${product.name}</td>
            <td data-label="Categoria">${product.category}</td>
            <td data-label="Preço">R$ ${product.price.toFixed(2)}</td>
            <td data-label="Estoque">${product.stock}</td>
            <td data-label="Ações" class="table-actions">
                <button class="btn btn-primary btn-sm" onclick="editProductConfig(${product.id})">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="deleteProductConfig(${product.id})">Deletar</button>
            </td>
        `;
    });
}

function addProductConfigOrUpdate(event) {
    event.preventDefault();
    const id = productConfigIdInput.value;
    const name = productConfigNameInput.value.trim();
    const category = productConfigCategoryInput.value.trim();
    const price = parseFloat(productConfigPriceInput.value);
    const stock = parseInt(productConfigStockInput.value);

    if (!name || !category || isNaN(price) || price <= 0 || isNaN(stock) || stock < 0) {
        alert('Por favor, preencha todos os campos corretamente!');
        return;
    }

    if (id) {
        // Atualizar produto existente
        const productIndex = products.findIndex(p => p.id == id);
        if (productIndex > -1) {
            products[productIndex].name = name;
            products[productIndex].category = category;
            products[productIndex].price = price;
            products[productIndex].stock = stock;
            alert('Produto atualizado com sucesso!');
        }
    } else {
        // Adicionar novo produto
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        products.push({ id: newId, name, category, price, stock });
        alert('Produto adicionado com sucesso!');
    }

    saveData(); // <--- CHAVE PARA SINCRONIZAÇÃO: Salva os produtos
    renderProductsConfig();
    resetForm(productConfigForm, cancelProductConfigEditBtn);
    // As alterações nos produtos agora serão automaticamente refletidas no index.html
    // graças ao listener 'storage' no script.js
}

function editProductConfig(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        productConfigIdInput.value = product.id;
        productConfigNameInput.value = product.name;
        productConfigCategoryInput.value = product.category;
        productConfigPriceInput.value = product.price;
        productConfigStockInput.value = product.stock;
        cancelProductConfigEditBtn.style.display = 'inline-block';
        productConfigForm.querySelector('button[type="submit"]').textContent = 'Atualizar Produto';
    }
}

function deleteProductConfig(id) {
    if (confirm('Tem certeza que deseja deletar este produto?')) {
        products = products.filter(p => p.id !== id);
        saveData(); // <--- CHAVE PARA SINCRONIZAÇÃO: Salva os produtos
        renderProductsConfig();
        alert('Produto deletado com sucesso!');
    }
}

// --- Funções de Configuração de Plano de Fundo (NOVO) ---
function loadBackgroundSettings() {
    const savedBackground = localStorage.getItem('selectedBackground');
    if (savedBackground) {
        const radio = document.getElementById(`bg-${savedBackground.replace('images/', '').replace('.jpg', '')}`);
        if (radio) {
            radio.checked = true;
        } else if (savedBackground === 'none') {
            document.getElementById('bg-none').checked = true;
        }
    }
    // Aplica o background na página atual também para visualização, se desejar
    // No entanto, a intenção é que o background seja para o PDV (index.html)
    // Se quiser ver aqui, adicione: applyBackground(savedBackground);
}

function saveBackgroundSettings(backgroundUrl) {
    localStorage.setItem('selectedBackground', backgroundUrl);
}

function applyBackground(backgroundUrl) {
    const body = document.body;
    if (backgroundUrl && backgroundUrl !== 'none') {
        body.style.backgroundImage = `url(${backgroundUrl})`;
        body.style.backgroundSize = 'cover';
        body.style.backgroundPosition = 'center';
        body.style.backgroundAttachment = 'fixed';
    } else {
        body.style.backgroundImage = 'none';
    }
}


// --- Função Auxiliar para Resetar Formulários ---
function resetForm(formElement, cancelButton) {
    formElement.reset(); // Limpa todos os campos do formulário
    // Limpa campos hidden de ID
    formElement.querySelector('input[type="hidden"]').value = ''; 
    cancelButton.style.display = 'none'; // Esconde o botão de cancelar
    // Reseta o texto do botão de submit
    let submitButtonText = 'Salvar ';
    if (formElement.id.includes('user')) {
        submitButtonText += 'Usuário';
    } else if (formElement.id.includes('client')) {
        submitButtonText += 'Cliente';
    } else if (formElement.id.includes('product-config')) {
        submitButtonText += 'Produto';
    }
    formElement.querySelector('button[type="submit"]').textContent = submitButtonText;
}