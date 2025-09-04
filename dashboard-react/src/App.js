import React, { useState, useEffect } from 'react';

// Os estilos foram movidos para dentro do componente para evitar erros de importação.
const styles = `
    body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
          'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
          sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        background-color: #f0f2f5;
        color: #333;
    }

    .container {
        max-width: 900px;
        margin: 0 auto;
        padding: 20px;
    }

    .header {
        background-color: #ffffff;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 20px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        border-left: 5px solid #007bff;
    }

    .header h1 {
        margin: 0;
        font-size: 1.8em;
        color: #333;
    }

    .header p {
        margin: 5px 0 0;
        color: #666;
    }

    .status-connected {
        color: #28a745;
        font-weight: bold;
    }

    .status-error {
        color: #dc3545;
        font-weight: bold;
    }

    .logs-container {
        background-color: #ffffff;
        border-radius: 8px;
        padding: 15px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        min-height: 400px;
    }

    .no-logs {
        color: #888;
        text-align: center;
        padding-top: 50px;
        font-style: italic;
    }

    .log-item {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 12px;
        border-bottom: 1px solid #eee;
        font-size: 0.95em;
    }

    .log-item:last-child {
        border-bottom: none;
    }

    .log-timestamp {
        font-family: 'Courier New', Courier, monospace;
        color: #888;
        font-size: 0.9em;
    }

    .log-type {
        padding: 4px 8px;
        border-radius: 4px;
        color: #fff;
        font-weight: bold;
        font-size: 0.8em;
        flex-shrink: 0;
    }

    .log-info { background-color: #17a2b8; }
    .log-success { background-color: #28a745; }
    .log-error { background-color: #dc3545; }

    .log-message {
        margin: 0;
        flex-grow: 1;
        word-break: break-word;
    }
`;

function App() {
    const [logs, setLogs] = useState([]);
    const [status, setStatus] = useState('Conectando...');

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await fetch('http://localhost:3001/logs');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setLogs(data);
                setStatus('Conectado');
            } catch (error) {
                console.error("Falha ao buscar logs:", error);
                setStatus('Erro de Conexão');
            }
        };

        const intervalId = setInterval(fetchLogs, 2000);
        return () => clearInterval(intervalId);
    }, []);

    const getLogTypeClass = (type) => {
        switch (type) {
            case 'SUCCESS':
                return 'log-success';
            case 'ERROR':
                return 'log-error';
            case 'INFO':
            default:
                return 'log-info';
        }
    };

    return (
        <>
            <style>{styles}</style>
            <div className="container">
                <header className="header">
                    <h1>Painel de Sincronização</h1>
                    <p>Status: <span className={status === 'Conectado' ? 'status-connected' : 'status-error'}>{status}</span></p>
                </header>
                
                <main className="logs-container">
                    {logs.length === 0 ? (
                        <p className="no-logs">Aguardando logs de sincronização...</p>
                    ) : (
                        logs.map((log, index) => (
                            <div key={index} className="log-item">
                                <span className="log-timestamp">{log.timestamp}</span>
                                <span className={`log-type ${getLogTypeClass(log.type)}`}>{log.type}</span>
                                <p className="log-message">{log.message}</p>
                            </div>
                        ))
                    )}
                </main>
            </div>
        </>
    );
}

export default App;
