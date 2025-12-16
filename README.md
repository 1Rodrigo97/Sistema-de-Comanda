# 🚀 Sistema de Gestão de Comandas em Tempo Real

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![WebSockets](https://img.shields.io/badge/WebSockets-10A183?style=for-the-badge&logo=websockets&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
[![JavaScript](https://img.shields.com/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

Este projeto implementa um **Sistema MVP de Gestão e Monitoramento de Comandas de Confecção em Tempo Real**.  
Utilizando comunicação assíncrona via **WebSockets**, conecta e monitora instantaneamente os setores de **Vendas**, **Corte** e o **Dashboard Gerencial**.

---

## 🎯 Objetivo do Projeto

Garantir o fluxo rápido de pedidos, aplicar regras de negócio em tempo real e alertar a gerência sobre:

- Gargalos de produção (**A2**)
- Exceções de regras (**A3**)

Visando maior conformidade, rastreabilidade e eficiência operacional.

---

## 💻 Tecnologias Utilizadas

| Categoria   | Tecnologia |
|------------|------------|
| **Backend** | Node.js, Express, `ws` (WebSockets) |
| **Frontend** | HTML5, CSS3, JavaScript puro |
| **Padrão** | Programação Assíncrona e Orientada a Eventos |

---

## 📁 Estrutura do Projeto

sistema-confeccao/
├── backend/
│   ├── data/
│   │   ├── ComandaModel.js        # Modelo central e lógica de tempo (A1, A2, Performance)
│   │   └── RegrasDeNegocio.js     # Regras de validação (Alerta A3 - Cor vs. Colégio)
│   └── server.js                 # Servidor Principal (Express + WebSocket)
├── frontend/
│   ├── vendedor/                 # Interface de Entrada de Pedidos (Vendas)
│   ├── corte/                    # Painel de Status de Produção (Corte)
│   └── gerencial/                # Dashboard de Monitoramento (KPIs)
└── package.json
---
📋 Como Instalar e Rodar
✅ Pré-requisitos
Node.js v18+
NPM (gerenciador de pacotes)
---
1️⃣ Clonagem e Instalação
# Clone o repositório
git clone https://github.com/1Rodrigo97/Sistema-de-Comanda.git

# Acesse o diretório
cd Sistema-de-Comanda

# Instale as dependências
npm install
---
2️⃣ Iniciando o Servidor

Inicie o servidor Node.js a partir da pasta raiz:
npm start
Saída esperada no console:
Servidor rodando em http://localhost:3000
---
3️⃣ Acessando as Interfaces

Com o servidor rodando, acesse as interfaces abaixo no navegador para simular o fluxo completo de produção:

Setor	URL de Acesso
Vendedor (Entrada)	http://localhost:3000/vendedor/index.html

Corte (Status)	http://localhost:3000/corte/index.html

Gerencial (Monitoramento)	http://localhost:3000/gerencial/index.html
---
🚨 Regras de Negócio e Alertas

O sistema monitora continuamente o fluxo das comandas e gera alertas instantâneos:

Alerta	Descrição	Limite / Regra	Monitorado em
A1	Parada na fila: comanda aguardando início do corte	> 15 minutos em Aguardando Corte	Painel do Corte
A2	Atraso no processamento: tempo de corte excedido	> 30 minutos em Em Corte	Dashboard Gerencial
A3	Exceção de regra: cor fora do padrão do colégio	Justificativa obrigatória do vendedor	Dashboard Gerencial
---
📌 Observação:
Este projeto foi desenvolvido como MVP, com foco em rastreabilidade, alertas em tempo real e visualização de gargalos produtivos.
