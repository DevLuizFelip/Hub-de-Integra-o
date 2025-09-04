const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// Armazena os pedidos recebidos em memória
const receivedOrders = [];

// A rota agora é '/orders' para corresponder ao que o Hub está chamando
app.post('/orders', (req, res) => {
    const order = req.body;
    
    // Simula uma pequena validação
    if (!order.id || !order.value) {
        console.log('[ERP-MOCK] Recebido pedido inválido:', order);
        return res.status(400).json({ message: 'Pedido inválido. "id" e "value" são obrigatórios.' });
    }

    console.log(`[ERP-MOCK] Pedido ${order.id} recebido com sucesso.`);
    receivedOrders.push(order);
    
    // Retorna status 201 (Created) para indicar sucesso
    res.status(201).json({ message: 'Pedido criado com sucesso', order });
});

app.get('/orders', (req, res) => {
    res.json(receivedOrders);
});

app.listen(PORT, () => {
    console.log(`[ERP-MOCK] Mock do ERP rodando na porta ${PORT}`);
});

