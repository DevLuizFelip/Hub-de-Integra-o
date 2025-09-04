import React, { useState, useEffect, useCallback } from 'react';

// URL da API do nosso Hub de Integração
const API_URL = 'http://localhost:3001';

function App() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Função para buscar os logs do servidor
  const fetchLogs = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/logs`);
      if (!response.ok) {
        throw new Error('Não foi possível conectar ao servidor do Hub.');
      }
      const data = await response.json();
      setLogs(data);
    } catch (err) {
      setError(err.message);
      setLogs([]); // Limpa os logs em caso de erro
    }
  }, []);

  // useEffect para buscar os logs periodicamente
  useEffect(() => {
    fetchLogs(); // Busca inicial
    const intervalId = setInterval(fetchLogs, 5000); // Busca a cada 5 segundos
    return () => clearInterval(intervalId); // Limpa o intervalo ao desmontar o componente
  }, [fetchLogs]);

  // Função para acionar a sincronização manual
  const handleSync = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await fetch(`${API_URL}/actions/sincronizar-pedidos`, { method: 'POST' });
      // Após acionar, busca os logs imediatamente para refletir a ação
      setTimeout(fetchLogs, 1000); 
    } catch (err) {
      setError('Falha ao acionar a sincronização.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <div className="container mx-auto p-4 md:p-8">
        
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-cyan-400">Painel de Integração</h1>
          <p className="text-gray-400 mt-2">Monitoramento em tempo real da sincronização VTEX ↔ ERP</p>
        </header>

        <div className="bg-gray-800 shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Controles</h2>
          <button
            onClick={handleSync}
            disabled={isLoading}
            className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sincronizando...' : 'Forçar Sincronização de Pedidos'}
          </button>
          {error && <p className="text-red-400 mt-4 animate-pulse">{error}</p>}
        </div>

        <div className="bg-gray-800 shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Logs de Eventos</h2>
          <div className="bg-black rounded-md p-4 h-96 overflow-y-auto font-mono text-sm">
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <div key={index} className="flex">
                  <span className="text-gray-500 mr-4">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className={log.message.includes('[ERRO]') ? 'text-red-400' : 'text-green-400'}>
                    {log.message}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Aguardando logs do servidor...</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
