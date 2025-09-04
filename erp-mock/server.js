// --- MOCK API DO ERP ---
// Este servidor simula um sistema de ERP.

const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 3002;

// Simulação de um banco de dados em memória
const db = {
    produtos: [
        { id: 'prod-001', nome: 'Livro de Node.js', estoque: 10 },
        { id: 'prod-002', nome: 'Fone de ouvido Bluetooth', estoque: 25 },
        { id: 'prod-003', nome: 'Caneca Dev', estoque: 50 },
    ],
    pedidos: [],
};

// --- ENDPOINTS DO ERP ---

// Endpoint para listar os produtos
app.get('/produtos', (req, res) => {
    console.log('[ERP] Requisição para GET /produtos recebida.');
    res.status(200).json(db.produtos);
});

// Endpoint para receber um novo pedido
app.post('/pedidos', (req, res) => {
    const novoPedido = req.body;
    console.log(`[ERP] Recebendo novo pedido: ${novoPedido.codigoPedido}`);
    
    if (!novoPedido.codigoPedido || !novoPedido.valorTotal) {
        return res.status(400).json({ error: 'Dados do pedido incompletos.' });
    }

    db.pedidos.push(novoPedido);
    console.log(`[ERP] Pedido ${novoPedido.codigoPedido} salvo com sucesso.`);
    res.status(201).json({ message: 'Pedido criado com sucesso!', pedido: novoPedido });
});

// Endpoint para atualizar o estoque de um produto
app.put('/produtos/:id/estoque', (req, res) => {
    const { id } = req.params;
    const { novoEstoque } = req.body;

    console.log(`[ERP] Recebida atualização de estoque para produto ${id}: ${novoEstoque} unidades.`);
    
    const produto = db.produtos.find(p => p.id === id);
    if (produto) {
        produto.estoque = novoEstoque;
        res.status(200).json(produto);
    } else {
        res.status(404).json({ error: 'Produto não encontrado.' });
    }
});


app.listen(PORT, () => {
    console.log(`✅ Mock API do ERP rodando na porta ${PORT}`);
});
