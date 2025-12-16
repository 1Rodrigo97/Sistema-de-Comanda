// Arquivo: /frontend/corte/corte.js (VERSÃO FINAL E LIMPA)

const URL_WEBSOCKET = 'ws://localhost:3000';
let ws;
const listaComandasDiv = document.getElementById('lista-comandas');

function conectarWS() {
    ws = new WebSocket(URL_WEBSOCKET);

    ws.onopen = () => {
        document.getElementById('status-conexao').textContent = 'Conexão: OK';
        document.getElementById('status-conexao').className = 'status-ok';
        console.log('Corte: Conexão WebSocket estabelecida.');
    };

    ws.onerror = (error) => {
        console.error('Corte: Erro na conexão WS:', error);
        document.getElementById('status-conexao').textContent = 'Conexão: ERRO';
        document.getElementById('status-conexao').className = 'status-erro';
    };

    ws.onclose = () => {
        document.getElementById('status-conexao').textContent = 'Conexão: DESCONECTADA. Tentando reconectar...';
        document.getElementById('status-conexao').className = 'status-alerta';
        console.warn('Corte: Conexão WS fechada. Tentando reconectar em 3s...');
        setTimeout(conectarWS, 3000); 
    };

    ws.onmessage = (event) => {
        const dados = JSON.parse(event.data);
        
        if (dados.type === 'ATUALIZACAO_COMANDAS') {
            renderizarComandas(dados.comandas);
        }
    };
}

// Arquivo: /frontend/corte/corte.js (TRECHO DENTRO DE renderizarComandas)

function renderizarComandas(comandas) {
    listaComandasDiv.innerHTML = ''; 

    const comandasAguardandoCorte = comandas.filter(c => c.status === "Aguardando Corte" || c.status === "Em Corte");

    if (comandasAguardandoCorte.length === 0) {
        listaComandasDiv.innerHTML = '<p>Nenhuma comanda na fila de Corte ou em processamento.</p>';
        return;
    }

    comandasAguardandoCorte.forEach(comanda => {
        const card = document.createElement('div');
        card.className = 'comanda-card';
        card.dataset.id = comanda.id;
        
        // Aplica o estilo de alerta A1 (Parada na Fila)
        if (comanda.alertaAtivo) {
            card.classList.add('alerta-ativo');
        }

        // 1. GERAÇÃO DA LISTA DE ITENS (INCLUI DETALHE DE TAMANHOS)
        let listaItensHTML = '<ul>';
        comanda.itens.forEach(item => {
            
            // Monta o detalhe dos tamanhos (Ex: P:5, M:10, G:10)
            const tamanhosDetalhe = Object.keys(item.tamanhos)
                .filter(t => item.tamanhos[t] > 0) // Filtra apenas tamanhos com quantidade > 0
                .map(t => `${t}: ${item.tamanhos[t]}`)
                .join(', ');

            listaItensHTML += `
                <li>
                    ${item.idVariacao} (${item.cor}) - Total: ${item.quantidade} un
                    <br><span style="font-size: 0.9em; font-weight: bold;">Tamanhos: ${tamanhosDetalhe}</span>
                </li>
            `;
        });
        listaItensHTML += '</ul>';
        // --- FIM MÚLTIPLOS ITENS + TAMANHOS ---
        
        // 2. GERAÇÃO DA JUSTIFICATIVA (Alerta A3)
        const justificativaHTML = comanda.justificativa ? 
            `<p style="color: darkred; font-weight: bold; margin-top: 10px;">🚨 EXCEÇÃO (A3): ${comanda.justificativa}</p>` : 
            '';
            
        // 3. Determina a mensagem de tempo (A1)
        let tempoMensagem = `Criada em: ${new Date(comanda.logTempo.criacao).toLocaleTimeString()}`;
        
        if (comanda.status === "Aguardando Corte" && comanda.alertaAtivo) {
            const tempoMinutos = comanda.tempoNaFila ? comanda.tempoNaFila.toFixed(1) : '0';
            tempoMensagem = `<span style="color: red;">⚠️ PARADA NA FILA: ${tempoMinutos} min</span>`;
        } else if (comanda.status === "Em Corte") {
            tempoMensagem = `Início do Corte: ${new Date(comanda.logTempo.inicioCorte).toLocaleTimeString()}`;
        }
        
        // 4. Renderiza as informações no card (AGORA INCLUINDO TUDO)
        card.innerHTML = `
            <h3>Comanda #${comanda.id} - ${comanda.idColegio}</h3>
            <p><strong>Status:</strong> <span class="status-fila">${comanda.status}</span></p>
            <p>${tempoMensagem}</p>
            <p><strong>Vendedor:</strong> ${comanda.idVendedor}</p>
            <h4>Itens:</h4>
            ${listaItensHTML} 
            ${justificativaHTML} `;

        // Adiciona botões de ação (Mudar Status)
        if (comanda.status === "Aguardando Corte") {
            const btnIniciar = criarBotao('Iniciar Corte', 'iniciar', comanda.id);
            card.appendChild(btnIniciar);
        } else if (comanda.status === "Em Corte") {
            const btnFinalizar = criarBotao('Finalizar Corte', 'finalizar', comanda.id);
            card.appendChild(btnFinalizar);
        }

        listaComandasDiv.appendChild(card);
    });
}

function criarBotao(texto, acao, idComanda) {
    const btn = document.createElement('button');
    btn.textContent = texto;
    btn.onclick = () => mudarStatus(idComanda, acao);
    return btn;
}

// 3. FUNÇÃO PARA ENVIAR A MUDANÇA DE STATUS DE VOLTA AO BACKEND
function mudarStatus(idComanda, acao) {
    let novoStatus;
    
    if (acao === 'iniciar') {
        novoStatus = 'Em Corte';
    } else if (acao === 'finalizar') {
        novoStatus = 'Pronto para Produção'; 
        if (!confirm(`Confirmar finalização do Corte da Comanda #${idComanda} e envio para Produção?`)) {
            return;
        }
    } else {
        return;
    }
    
    ws.send(JSON.stringify({
        type: 'MUDAR_STATUS',
        idComanda: idComanda,
        novoStatus: novoStatus
    }));
    
    console.log(`Solicitação enviada: Comanda #${idComanda} -> ${novoStatus}`);
}


document.addEventListener('DOMContentLoaded', () => {
    conectarWS();
});