// --- HUB DE INTEGRAÇÃO E-COMMERCE (VTEX <-> ERP) ---
// Este é o servidor principal do projeto.

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 3001;
const ERP_API_URL = 'http://erp-mock:3002'; // Nome do serviço no docker-compose

// --- BANCO DE DADOS SIMULADO ---
const pedidosIntegrados = new Set();
const logEventos = []; // Array para guardar os logs para o frontend

// Função para adicionar logs com timestamp
const addLog = (message) => {
  const timestamp = new Date().toISOString();
  console.log(message);
  logEventos.unshift({ timestamp, message }); // Adiciona no início para o mais recente aparecer primeiro
  if (logEventos.length > 100) logEventos.pop(); // Limita o tamanho do log
};

/**
 * Função principal que busca novos pedidos na "VTEX" e os envia para o ERP.
 */
async function sincronizarPedidosVtexParaErp() {
    addLog('------------------------------------');
    addLog('[HUB] Iniciando rotina de sincronização de pedidos...');

    try {
        const mockVtexResponse = {
            data: [
                { id: `vtex-${100 + Math.floor(Math.random() * 10)}`, total: 150.50, cliente: 'João Silva', itens: [{ nome: 'Livro', qtd: 1 }] },
                { id: 'vtex-102', total: 99.99, cliente: 'Maria Souza', itens: [{ nome: 'Fone de ouvido', qtd: 1 }] },
                { id: `vtex-${103 + Math.floor(Math.random() * 10)}`, total: 45.00, cliente: 'Carlos Pereira', itens: [{ nome: 'Caneca', qtd: 2 }] },
            ]
        };
        const novosPedidos = mockVtexResponse.data;
        addLog(`[VTEX] Encontrados ${novosPedidos.length} pedidos.`);

        for (const pedido of novosPedidos) {
            if (pedidosIntegrados.has(pedido.id)) {
                addLog(`[HUB] Pedido ${pedido.id} já integrado. Pulando.`);
                continue;
            }

            const pedidoParaErp = {
                origem: 'VTEX',
                codigoPedido: pedido.id,
                valorTotal: pedido.total,
                nomeCliente: pedido.cliente,
                produtos: pedido.itens
            };

            addLog(`[HUB] Enviando pedido ${pedido.id} para o ERP...`);
            await axios.post(`${ERP_API_URL}/pedidos`, pedidoParaErp);

            pedidosIntegrados.add(pedido.id);
            addLog(`[ERP] Pedido ${pedido.id} recebido com sucesso!`);
        }

    } catch (error) {
        addLog(`[ERRO] Falha na sincronização de pedidos: ${error.message}`);
    } finally {
        addLog('[HUB] Fim da rotina de sincronização.');
    }
}

// --- ENDPOINTS DA API DO HUB ---

app.get('/logs', (req, res) => {
    res.status(200).json(logEventos);
});

app.post('/actions/sincronizar-pedidos', async (req, res) => {
    addLog('[HUB] Sincronização manual de pedidos acionada via API.');
    await sincronizarPedidosVtexParaErp();
    res.status(200).json({ message: 'Rotina de sincronização de pedidos executada.' });
});

app.post('/webhooks/erp/estoque-atualizado', (req, res) => {
    const { idProduto, novoEstoque } = req.body;
    if (!idProduto || novoEstoque === undefined) {
        return res.status(400).json({ error: 'Faltando idProduto ou novoEstoque.' });
    }
    addLog(`[HUB] Recebido webhook do ERP: Atualizar estoque do produto ${idProduto} para ${novoEstoque} unidades.`);
    addLog(`[HUB] -> Chamando API da VTEX para realizar a atualização... (Simulado)`);
    res.status(200).json({ message: `Webhook de estoque para o produto ${idProduto} processado.` });
});

app.listen(PORT, () => {
    console.log(`🚀 Hub de Integração rodando na porta ${PORT}`);
    setInterval(sincronizarPedidosVtexParaErp, 60000); // Roda a cada 60 segundos
});
