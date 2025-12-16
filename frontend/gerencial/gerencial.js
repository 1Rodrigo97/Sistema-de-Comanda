// Arquivo: /frontend/gerencial/gerencial.js (COM KPI DE PERFORMANCE)

const URL_WEBSOCKET = 'ws://localhost:3000';
let ws;
const alertasContainer = document.getElementById('alertas-container');
const totalA2Div = document.getElementById('total-a2');
const totalA3Div = document.getElementById('total-a3');
// REFERÊNCIA DO NOVO KPI (Assumindo que você adicionou a div no HTML)
const taxaConformidadeDiv = document.getElementById('taxa-conformidade'); 


function conectarWS() {
    ws = new WebSocket(URL_WEBSOCKET);
    
    ws.onopen = () => {
        document.getElementById('status-conexao').textContent = 'Conexão: OK';
        document.getElementById('status-conexao').className = 'status-ok';
        console.log('Gerencial: Conexão WebSocket estabelecida.');
    };

    ws.onerror = (error) => {
        document.getElementById('status-conexao').textContent = 'Conexão: ERRO';
        document.getElementById('status-conexao').className = 'status-erro';
        console.error('Gerencial: Erro na conexão WS:', error);
    };

    ws.onclose = () => {
        document.getElementById('status-conexao').textContent = 'Conexão: DESCONECTADA. Tentando reconectar...';
        document.getElementById('status-conexao').className = 'status-alerta';
        console.warn('Gerencial: Conexão WS fechada. Tentando reconectar em 3s...');
        setTimeout(conectarWS, 3000); 
    };

    ws.onmessage = (event) => {
        const dados = JSON.parse(event.data);
        
        if (dados.type === 'ATUALIZACAO_COMANDAS') {
            processarAlertas(dados.comandas);
        }
    };
}

function processarAlertas(comandas) {
    let countA2 = 0;
    let countA3 = 0;
    
    // Variáveis para o KPI de Conformidade do Corte
    let totalComandasFinalizadas = 0;
    let totalConformes = 0;

    alertasContainer.innerHTML = '';
    
    comandas.forEach(comanda => {
        
        // --- 1. CÁLCULO DO KPI DE PERFORMANCE (Conformidade do Corte) ---
        // Contamos apenas as comandas que atingiram o status "Pronto para Produção" e têm o log de performance
        if (comanda.status === "Pronto para Produção" && comanda.performanceCorte) {
            totalComandasFinalizadas++;
            if (comanda.performanceCorte.conforme) {
                totalConformes++;
            }
        }
        // ---------------------------------------------------------------
        
        // --- 2. LÓGICA DE ALERTAS (A2 e A3) ---

        let isAlert = false;
        let alertaMensagem = '';
        
        // Alerta A3
        if (comanda.justificativa) {
            countA3++;
            isAlert = true;
            alertaMensagem += `<p><strong>🚨 A3 (Exceção):</strong> ${comanda.justificativa}</p>`;
        }
        
        // Alerta A2
        if (comanda.alertaTipo === 'A2' && comanda.alerta) {
            countA2++;
            isAlert = true;
            alertaMensagem += `<p><strong>🔴 A2 (Atraso no Corte):</strong> Em processamento há ${comanda.tempoNaFila} min.</p>`;
        }
        
        // 3. Renderizar Detalhes do Alerta (Apenas se a comanda estiver EM FLUXO)
        if (isAlert && comanda.status !== "Pronto para Produção") { 
            const card = document.createElement('div');
            // A2 tem prioridade visual sobre A3
            const borderClass = comanda.alertaTipo === 'A2' ? 'alerta-A2' : 'alerta-A3'; 
            
            card.className = `comanda-alerta ${borderClass}`;
            card.innerHTML = `
                <h4>Comanda #${comanda.id} - ${comanda.idColegio}</h4>
                <p>Status Atual: <strong>${comanda.status}</strong></p>
                <p>Vendedor: ${comanda.idVendedor}</p>
                ${alertaMensagem}
            `;
            alertasContainer.appendChild(card);
        }
    });

    // --- 4. ATUALIZAÇÃO DOS KPIs ---
    const taxaConformidade = totalComandasFinalizadas > 0 
        ? ((totalConformes / totalComandasFinalizadas) * 100).toFixed(1)
        : 'N/A';
        
    totalA2Div.textContent = countA2;
    totalA3Div.textContent = countA3;
    
    // Garante que o elemento existe antes de tentar definir o texto
    if (taxaConformidadeDiv) {
        taxaConformidadeDiv.textContent = `${taxaConformidade}%`;
    }
    
    if (countA2 === 0 && countA3 === 0 && totalComandasFinalizadas === 0) {
        alertasContainer.innerHTML = '<p>Nenhum alerta ativo no momento.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    conectarWS();
});