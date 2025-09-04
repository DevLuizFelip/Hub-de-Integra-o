const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = 3001;

// --- ALTERAÇÃO PRINCIPAL ---
// Lê a URL da API do ERP a partir de uma variável de ambiente.
// Se a variável não for definida, usa 'localhost' como padrão para desenvolvimento local.
const ERP_API_URL = process.env.ERP_API_URL || 'http://localhost:3002/pedido';

app.use(cors());
app.use(express.json());

// Armazena os logs de sincronização em memória
let logs = [];

// Endpoint para o dashboard React buscar os logs
app.get('/logs', (req, res) => {
    res.json(logs);
});

// --- SIMULAÇÃO DA API DA VTEX ---
// Esta função simula a busca de pedidos na API da Vtex
const fetchVtexOrders = () => {
    console.log('[VTEX] Buscando novos pedidos...');
    // Simula a descoberta de 1 a 3 novos pedidos
    const numberOfOrders = Math.floor(Math.random() * 3) + 1;
    const orders = [];
    for (let i = 0; i < numberOfOrders; i++) {
        orders.push({
            orderId: `vtex-${Date.now() + i}`,
            total: (Math.random() * 500).toFixed(2),
            customer: `Cliente ${(Math.random() * 1000).toFixed(0)}`,
        });
    }
    console.log(`[VTEX] Encontrados ${orders.length} pedidos.`);
    addLog('INFO', `[VTEX] Encontrados ${orders.length} pedidos.`);
    return orders;
};

// --- ROTINA DE SINCRONIZAÇÃO ---
// Função principal que orquestra a integração
const syncOrders = async () => {
    console.log('\n[HUB] Iniciando rotina de sincronização de pedidos...');
    addLog('INFO', '[HUB] Iniciando rotina de sincronização de pedidos...');

    const vtexOrders = fetchVtexOrders();

    if (vtexOrders.length === 0) {
        console.log('[HUB] Nenhum novo pedido para sincronizar.');
        addLog('INFO', '[HUB] Nenhum novo pedido para sincronizar.');
        console.log('[HUB] Fim da rotina de sincronização.');
        addLog('INFO', '[HUB] Fim da rotina de sincronização.');
        return;
    }

    for (const vtexOrder of vtexOrders) {
        console.log(`[HUB] Enviando pedido ${vtexOrder.orderId} para o ERP...`);
        addLog('INFO', `[HUB] Enviando pedido ${vtexOrder.orderId} para o ERP...`);

        const erpPayload = {
            id: vtexOrder.orderId,
            valorTotal: parseFloat(vtexOrder.total),
            clienteNome: vtexOrder.customer,
            status: 'Pendente',
        };

        try {
            // Envia a requisição para a API Mock do ERP
            const response = await axios.post(ERP_API_URL, erpPayload);
            if (response.status === 201) {
                console.log(`[ERP] Pedido ${vtexOrder.orderId} recebido com sucesso!`);
                addLog('SUCCESS', `[ERP] Pedido ${vtexOrder.orderId} recebido com sucesso!`);
            }
        } catch (error) {
            console.error(`[ERRO] Falha na sincronização de pedidos: ${error.message}`);
            addLog('ERROR', `[HUB] Falha ao enviar pedido ${vtexOrder.orderId}: ${error.message}`);
        }
    }

    console.log('[HUB] Fim da rotina de sincronização.');
    addLog('INFO', '[HUB] Fim da rotina de sincronização.');
};

// Função para adicionar logs com timestamp e tipo
const addLog = (type, message) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    logs.unshift({ timestamp, type, message }); // Adiciona no início do array
    if (logs.length > 100) {
        logs.pop(); // Limita o tamanho do array de logs
    }
};

app.listen(port, () => {
    console.log(`[HUB] Hub de Integração rodando na porta ${port}`);
    console.log(`[HUB] Conectando ao ERP em: ${ERP_API_URL}`);
    // Inicia a rotina de sincronização 5 segundos após o servidor iniciar
    // e a repete a cada 15 segundos
    setTimeout(() => {
        syncOrders();
        setInterval(syncOrders, 15000); // 15 segundos
    }, 5000);
});

