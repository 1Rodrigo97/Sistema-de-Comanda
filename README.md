# 🚀 Sistema de Gestão de Comandas em Tempo Real

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![WebSockets](https://img.shields.io/badge/WebSockets-10A183?style=for-the-badge&logo=websockets&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

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
```text
sistema-confeccao/
├── backend/
│   ├── data/
│   │   ├── ComandaModel.js     # Modelo central e lógica de tempo (A1, A2, Performance)
│   │   └── RegrasDeNegocio.js  # Regras de validação (Alerta A3 - Cor vs. Colégio)
│   └── server.js              # Servidor Principal (Express + WebSocket)
├── frontend/
│   ├── vendedor/              # Interface de Entrada de Pedidos (Vendas)
│   ├── corte/                 # Painel de Status de Produção (Corte)
│   └── gerencial/             # Dashboard de Monitoramento (KPIs)
└── package.json
```
---
## 📋 Como Instalar e Rodar

### ✅ Pré-requisitos

* Node.js v18+
* NPM (gerenciador de pacotes)

### 1️⃣ Clonagem e Instalação

```bash
# Clonar o repositório
git clone [https://github.com/1Rodrigo97/Sistema-de-Comanda.git](https://github.com/1Rodrigo97/Sistema-de-Comanda.git)

# Acesse o diretório
cd Sistema-de-Comanda

# Instale as dependências
npm install
```
---
2️⃣ Iniciando o Servidor

Inicie o servidor Node.js a partir da pasta raiz:
```bash
npm start
```
Saída esperada no console:
```bash
Servidor rodando em http://localhost:3000
```
---
3️⃣ Acessando as Interfaces

Com o servidor rodando, abra no navegador:
```
Setor	URL
Vendedor (Entrada)	http://localhost:3000/vendedor/index.html

Corte (Status)	http://localhost:3000/corte/index.html

Gerencial (Monitoramento)	http://localhost:3000/gerencial/index.html
```
---
🚨 Regras de Negócio e Alertas
Alerta	Descrição	Regra	Monitoramento
```bash
A1	Comanda parada aguardando corte	> 15 min em “Aguardando Corte”	Painel do Corte
A2	Atraso no processamento	> 30 min em “Em Corte”	Dashboard Gerencial
A3	Cor fora do padrão do colégio	Justificativa obrigatória	Dashboard Gerencial
```
---







