// Arquivo: /backend/data/ComandaModel.js (COM A PERFORMANCE DO CORTE ADICIONADA)

/**
 * Classe que representa uma Comanda, incluindo logs de tempo e status.
 */
class Comanda {
    constructor(id, idVendedor, idColegio, itens, justificativa = '') { 
        this.id = id;
        this.idVendedor = idVendedor;
        this.idColegio = idColegio;
        this.status = 'Aguardando Corte';
        this.itens = itens;
        
        this.justificativa = justificativa; 
        this.alertaAtivo = false;
        
        // Novo: Propriedade para registrar o resultado da performance de corte
        this.performanceCorte = null;
        
        // --- 1. Inicializa o Log de Tempo (CRUCIAL para evitar o TypeError anterior) ---
        const agora = new Date();
        this.logTempo = {
            criacao: agora,
            // Outros logs de tempo (inicioCorte, fimCorte) são adicionados em mudarStatus
        };
        // -------------------------------------------------------------------------------
        
        // --- 2. Inicializa o Array de Observações ---
        this.observacoes = [];
        this.observacoes.push({
            timestamp: agora,
            acao: 'Comanda criada.'
        });
        // --------------------------------------------
    }

    mudarStatus(novoStatus, justificativa = '') {
        this.status = novoStatus;
        const agora = new Date();
        
        // Atualiza o log de tempo
        if (novoStatus === "Em Corte") {
            this.logTempo.inicioCorte = agora;
        } else if (novoStatus === "Pronto para Produção") {
            this.logTempo.fimCorte = agora;
            
            // --- CÁLCULO DE PERFORMANCE (NOVO) ---
            if (this.logTempo.inicioCorte) {
                const duracaoMs = agora.getTime() - this.logTempo.inicioCorte.getTime();
                const duracaoMin = duracaoMs / 60000;
                
                // Limite A2 é 30 minutos
                const LIMITE_A2_MINUTOS = 30;
                
                // Define se a performance foi conforme (dentro de 30 minutos)
                this.performanceCorte = {
                    tempoTotalMin: duracaoMin.toFixed(1),
                    conforme: duracaoMin <= LIMITE_A2_MINUTOS
                };
            }
            // -------------------------------------
        } 
        
        this.observacoes.push({
            timestamp: agora,
            acao: `Status alterado para: ${novoStatus}${justificativa ? ' - ' + justificativa : ''}`
        });
        
        // Zera o alerta, pois o status mudou (válido para A1)
        this.alertaAtivo = false; 

        return this;
    }
    
    calcularTempoNaFila() {
        const agora = new Date();
        
        // --- LÓGICA DO ALERTA A1 (Aguardando Corte) ---
        if (this.status === "Aguardando Corte") {
            if (!this.logTempo.criacao) return { tempo: 0, alerta: false, mensagem: "Erro de log." };

            const tempoDecorridoMs = agora.getTime() - this.logTempo.criacao.getTime();
            const tempoDecorridoMin = tempoDecorridoMs / 60000; 
            
            const LIMITE_A1_MINUTOS = 15;
            
            if (tempoDecorridoMin > LIMITE_A1_MINUTOS) {
                this.alertaAtivo = true; 
                return { 
                    tempo: tempoDecorridoMin.toFixed(1), 
                    alerta: true, 
                    mensagem: `Alerta A1: Parada na fila há ${tempoDecorridoMin.toFixed(1)} minutos.` 
                };
            }
            return { tempo: tempoDecorridoMin.toFixed(1), alerta: false, mensagem: "Tempo OK." };
        }
        
        // --- LÓGICA DO ALERTA A2 (Em Corte / Atraso no Processamento) ---
        if (this.status === "Em Corte" && this.logTempo.inicioCorte) {
            const tempoEmCorteMs = agora.getTime() - this.logTempo.inicioCorte.getTime();
            const tempoEmCorteMin = tempoEmCorteMs / 60000;
            
            const LIMITE_A2_MINUTOS = 30; 
            
            if (tempoEmCorteMin > LIMITE_A2_MINUTOS) {
                return { 
                    tempo: tempoEmCorteMin.toFixed(1), 
                    alerta: true, 
                    alertaTipo: 'A2', 
                    mensagem: `Alerta A2: Em Corte há ${tempoEmCorteMin.toFixed(1)} minutos (Limite: ${LIMITE_A2_MINUTOS} min).`
                };
            }
            return { tempo: tempoEmCorteMin.toFixed(1), alerta: false, mensagem: "Em processamento." };
        }

        return { tempo: 0, alerta: false, mensagem: "Não aplicável." };
    }
}

module.exports = Comanda;