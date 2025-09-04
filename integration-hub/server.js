const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Array para armazenar os logs em memória
let logs = [];

// URL do Mock ERP para ambiente de desenvolvimento local
const ERP_API_URL = 'http://localhost:3002';

// Função para adicionar logs com timestamp
const addLog = (type, message) => {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, type, message };
    console.log(`[${type}] ${message}`);
    logs.unshift(logEntry); // Adiciona no início para os mais recentes aparecerem primeiro
    if (logs.length > 100) {
        logs.pop(); // Limita o número de logs em memória
    }
};

// Função que simula a busca de pedidos na Vtex
const fetchVtexOrders = async () => {
    addLog('INFO', 'Buscando novos pedidos na Vtex...');
    // Simulação: Retorna 3 pedidos novos
    await new Promise(resolve => setTimeout(resolve, 500)); // Simula latência de rede
    const orders = [
        { id: `vtex-${Math.floor(100 + Math.random() * 900)}`, value: 150.00 },
        { id: `vtex-${Math.floor(100 + Math.random() * 900)}`, value: 250.50 },
        { id: `vtex-${Math.floor(100 + Math.random() * 900)}`, value: 99.90 },
    ];
    addLog('INFO', `Encontrados ${orders.length} pedidos.`);
    return orders;
};

// Função que envia o pedido para o ERP
const sendOrderToErp = async (order) => {
    try {
        addLog('INFO', `Enviando pedido ${order.id} para o ERP...`);
        // O POST é feito para a URL correta do ERP
        const response = await axios.post(`${ERP_API_URL}/orders`, order);
        if (response.status === 201) {
            addLog('SUCCESS', `Pedido ${order.id} integrado com sucesso no ERP.`);
        } else {
            addLog('ERROR', `Erro inesperado ao integrar pedido ${order.id}. Status: ${response.status}`);
        }
    } catch (error) {
        addLog('ERROR', `Falha ao conectar com o ERP para o pedido ${order.id}. Detalhes: ${error.message}`);
    }
};

// Rotina principal de sincronização
const syncOrders = async () => {
    addLog('INFO', 'Iniciando rotina de sincronização de pedidos...');
    try {
        const orders = await fetchVtexOrders();
        for (const order of orders) {
            await sendOrderToErp(order);
        }
    } catch (error) {
        addLog('ERROR', `Falha na sincronização de pedidos: ${error.message}`);
    } finally {
        addLog('INFO', 'Fim da rotina de sincronização.');
    }
};

// Endpoint para o painel de controle buscar os logs
app.get('/logs', (req, res) => {
    res.json(logs);
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`[HUB] Hub de Integração rodando na porta ${PORT}`);
    // Inicia a rotina de sincronização 10 segundos após o início e repete a cada 30 segundos
    setTimeout(() => {
        syncOrders(); // Roda a primeira vez
        setInterval(syncOrders, 30000); // Roda a cada 30 segundos
    }, 10000);
});

