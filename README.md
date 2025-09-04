Hub de Integração E-commerce (VTEX <> ERP)
Este projeto é uma simulação de um sistema de integração de backend projetado para sincronizar pedidos de uma plataforma de e-commerce (como a VTEX) com um sistema de gestão empresarial (ERP). O objetivo é demonstrar competências em desenvolvimento backend com Node.js, arquitetura de microsserviços, comunicação via API e monitoramento em tempo real com React, atendendo aos requisitos de uma vaga de Desenvolvedor Backend.

🚀 Funcionalidades
Sincronização Automática: O hub busca novos pedidos em um intervalo de tempo configurável.

Comunicação via API REST: Todos os serviços se comunicam através de endpoints RESTful.

Monitoramento em Tempo Real: Um painel de controle feito em React exibe os logs de sincronização, mostrando sucessos e falhas.

Simulação de Ambiente: Inclui um mock de API para simular o ERP, permitindo que o sistema funcione de forma independente.

Containerização: O projeto é totalmente containerizado com Docker, facilitando a configuração e o deploy.

🏛️ Arquitetura
O sistema é composto por três serviços independentes que se comunicam entre si:

Hub de Integração (integration-hub): O serviço central, escrito em Node.js/Express. Ele é responsável por orquestrar a comunicação, buscando pedidos na VTEX (simulado) e enviando-os para o ERP. Também fornece os logs para o painel.

Mock do ERP (erp-mock): Um servidor Node.js/Express que simula a API de um ERP. Ele recebe os pedidos do Hub e os armazena em memória.

Painel de Controle (dashboard-react): Uma aplicação frontend em React que consome a API de logs do Hub e exibe o status das integrações em tempo real para o usuário.

🛠️ Tecnologias Utilizadas
Backend: Node.js, Express.js, Axios

Frontend: React

Containerização: Docker, Docker Compose

Linguagens: JavaScript

⚙️ Como Executar o Projeto
Existem duas maneiras de executar este projeto: localmente, rodando cada serviço em um terminal diferente, ou de forma integrada com Docker Compose.

1. Executando Localmente (Desenvolvimento)
Pré-requisitos:

Node.js (v16 ou superior)

npm

Passos:

Clone o repositório:

git clone https://github.com/DevLuizFelip/Hub-de-Integra-o.git
cd Hub-de-Integra-o

Instale as dependências de cada serviço:

# Em um terminal, para o Hub de Integração
cd integration-hub
npm install

# Em um segundo terminal, para o Mock do ERP
cd ../erp-mock
npm install

# Em um terceiro terminal, para o Painel React
cd ../dashboard-react
npm install

Inicie os serviços (cada um em seu respectivo terminal):

# No terminal do Hub
node server.js
# O Hub estará rodando em http://localhost:3001

# No terminal do ERP Mock
node server.js
# O ERP Mock estará rodando em http://localhost:3002

# No terminal do Painel React
npm start
# O painel estará acessível em http://localhost:3000

Abra seu navegador em http://localhost:3000 para ver o painel de sincronização em ação.

2. Executando com Docker (Recomendado)
Pré-requisitos:

Docker

Docker Compose

Passos:

Clone o repositório.

Construa e inicie os containers:
Na raiz do projeto (onde o arquivo docker-compose.yml está localizado), execute o seguinte comando:

docker-compose up --build

Este comando irá construir as imagens Docker para cada serviço e iniciá-los de forma orquestrada.

Acesse os serviços:

Painel de Controle: http://localhost:3000

Hub de Integração (API de logs): http://localhost:3001/logs

Mock do ERP (API de pedidos): http://localhost:3002/orders

Para parar os containers:
Pressione Ctrl + C no terminal onde o docker-compose está rodando, ou execute em outro terminal:

docker-compose down
