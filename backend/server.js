// Arquivo: /backend/server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

// --- 1. IMPORTAÇÃO DA LÓGICA DE DADOS ---
const Comanda = require('./data/ComandaModel');
const { ValidadorPedido, COLEGIOS_DB } = require('./data/RegrasDeNegocio'); 

// --- 2. CONFIGURAÇÃO BÁSICA DO SERVIDOR EXPRESS ---
const app = express();
const server = http.createServer(app);
const port = 3000;

app.use(express.json());

const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath)); 

// --- 3. CONFIGURAÇÃO DO WEBSOCKETS SERVER ---
const wss = new WebSocket.Server({ server });

const comandasAtivas = {};
const validador = new ValidadorPedido(COLEGIOS_DB);
let proximoIdComanda = 1001; 

function broadcastComandas() {
    const comandasParaBroadcast = Object.values(comandasAtivas).map(comanda => {
        
        // --- CÓDIGO CRÍTICO CORRIGIDO PARA O ALERTA A1 ---
        const resultadoTempo = comanda.calcularTempoNaFila(); 
        
        comanda.tempoNaFila = resultadoTempo.tempo; 
        comanda.alertaAtivo = resultadoTempo.alerta; 
        // ------------------------------------------

        return comanda; 
    });

    const dadosParaBroadcast = JSON.stringify({
        type: 'ATUALIZACAO_COMANDAS',
        comandas: comandasParaBroadcast
    });

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(dadosParaBroadcast);
        }
    });
}

// Uma única chamada ao setInterval é suficiente.
setInterval(broadcastComandas, 10000); 

// --- 4. GESTÃO DA CONEXÃO E COMANDAS ---
wss.on('connection', (ws) => {
    console.log('Novo cliente conectado.');
    broadcastComandas(); 

    ws.on('message', (message) => {
        const dados = JSON.parse(message);

        switch (dados.type) {
            case 'NOVA_COMANDA':
                const { inconsistencia, mensagem } = validador.validarInconsistencia(
                    dados.comanda.idColegio, dados.comanda.corProposta
                );

                // Se houver inconsistência E não houver justificativa, enviamos o alerta.
                if (inconsistencia && !dados.comanda.justificativa) {
                    ws.send(JSON.stringify({ type: 'ALERTA_INCONSISTENCIA', mensagem }));
                    return; 
                }

                // --- CORREÇÃO: Chamada correta do construtor com 5 argumentos ---
                const novaComanda = new Comanda(
                    proximoIdComanda++,
                    dados.comanda.idVendedor,
                    dados.comanda.idColegio,
                    dados.comanda.itens,
                    dados.comanda.justificativa || '' // O 5º e último argumento é a justificativa
                );
                // --- FIM CORREÇÃO ---
                
                comandasAtivas[novaComanda.id] = novaComanda;

                console.log(`Comanda #${novaComanda.id} criada.`);
                broadcastComandas(); 
                break;

            case 'MUDAR_STATUS':
                const comanda = comandasAtivas[dados.idComanda];
                if (comanda) {
                    comanda.mudarStatus(dados.novoStatus);
                    console.log(`Comanda #${dados.idComanda} -> Status: ${dados.novoStatus}`);
                    broadcastComandas();
                }
                break;
        }
    });

    ws.on('close', () => {
        console.log('Cliente desconectado.');
    });
});

// --- 5. INICIALIZAÇÃO DO SERVIDOR ---
server.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    console.log(`Acesse: http://localhost:${port}/index.html`); 
});