// Arquivo: /frontend/vendedor/vendedor.js (VERSÃO FINAL E CORRIGIDA)

const URL_WEBSOCKET = 'ws://localhost:3000';
let ws;
let ultimaComandaEnviada = null; 
let esperandoConfirmacao = false; 


function conectarWS() {
    ws = new WebSocket(URL_WEBSOCKET);

    ws.onopen = () => {
        document.getElementById('status-conexao').textContent = 'Conexão: OK';
        document.getElementById('status-conexao').className = 'status-ok';
        console.log('Vendedor: Conexão WebSocket estabelecida.');
    };

    ws.onerror = (error) => {
        console.error('Vendedor: Erro na conexão WS:', error);
        document.getElementById('status-conexao').textContent = 'Conexão: ERRO';
        document.getElementById('status-conexao').className = 'status-erro';
    };

    ws.onclose = () => {
        document.getElementById('status-conexao').textContent = 'Conexão: DESCONECTADA. Tentando reconectar...';
        document.getElementById('status-conexao').className = 'status-alerta';
        console.warn('Vendedor: Conexão WS fechada. Tentando reconectar em 3s...');
        setTimeout(conectarWS, 3000); 
    };

    ws.onmessage = (event) => {
        const dados = JSON.parse(event.data);
        
        if (dados.type === 'ALERTA_INCONSISTENCIA') {
            handleAlertaInconsistencia(dados.mensagem);
            esperandoConfirmacao = false; 
            
        } else if (dados.type === 'ATUALIZACAO_COMANDAS') {
            
            if (esperandoConfirmacao) { 
                console.log("Comanda confirmada pelo broadcast.");
                document.getElementById('modal-alerta').style.display = 'none';
                
                ultimaComandaEnviada = null; 
                esperandoConfirmacao = false;
                
                alert('Comanda enviada com sucesso!');

            } else {
                 console.log("Broadcast de status de comandas recebido (Ignorado na interface Vendedor).");
            }
        }
    };
}


// Arquivo: /frontend/vendedor/vendedor.js (FUNÇÃO enviarComanda CORRIGIDA PARA VALIDAÇÃO DE QUANTIDADE)

function enviarComanda(justificativa = '') {
    const vendedor = document.getElementById('vendedor').value;
    const colegio = document.getElementById('colegio').value;
    const prazo = document.getElementById('prazo').value;

    // 1. Validação de campos obrigatórios (mantida)
    if (!vendedor || vendedor === "" || !colegio || colegio === "" || !prazo) {
        alert('Por favor, selecione o Vendedor, Colégio e preencha o Prazo de Entrega.');
        return;
    }

    // 2. Lógica para ler múltiplos itens E TAMANHOS
    const itens = [];
    let primeiroItemCor = '';
    let erroQuantidade = false; // NOVA FLAG DE ERRO

    document.querySelectorAll('.item-pedido').forEach((itemDiv, index) => {
        const itemId = itemDiv.querySelector('[id^="item-"]').value;
        const cor = itemDiv.querySelector('[id^="cor-"]').value;
        const tabelaTamanhos = itemDiv.querySelector('.tabela-tamanhos');
        
        let quantidadeTotal = 0;
        const tamanhos = {}; 
        
        tabelaTamanhos.querySelectorAll('input[type="number"]').forEach(input => {
            const tamanho = input.dataset.tamanho;
            const quantidade = parseInt(input.value) || 0;
            
            tamanhos[tamanho] = quantidade;
            quantidadeTotal += quantidade;
        });

        // Verificação: Se o item tem nome/cor, ele PRECISA ter quantidade > 0
        if (itemId.trim() && cor.trim()) {
            if (quantidadeTotal === 0) {
                 erroQuantidade = true; // Define a flag de erro
            } else {
                 itens.push({
                    idVariacao: itemId,
                    cor: cor,
                    quantidade: quantidadeTotal, 
                    tamanhos: tamanhos 
                });
                
                if (index === 0) {
                     primeiroItemCor = cor;
                }
            }
        }
    });
    
    // NOVO BLOCO DE VALIDAÇÃO: 
    if (erroQuantidade) {
        alert('ERRO: Você adicionou um item (nome/cor) mas não especificou nenhuma quantidade por tamanho.');
        return;
    }
    
    if (itens.length === 0) {
        alert('Por favor, adicione pelo menos um item com quantidade maior que zero.');
        return;
    }
    // FIM NOVO BLOCO DE VALIDAÇÃO

    // 3. Montagem da comanda (Restante da função permanece igual)
    const comanda = {
        idVendedor: vendedor,
        idColegio: colegio,
        prazo: prazo,
        corProposta: primeiroItemCor, 
        justificativa: justificativa, 
        itens: itens
    };
    
    ultimaComandaEnviada = comanda; 
    esperandoConfirmacao = true; 

    if (ws.readyState !== ws.OPEN) {
        alert('Erro de conexão: O sistema está tentando reconectar ao servidor. Tente novamente em instantes.');
        console.error('Tentativa de envio falhou. WebSocket não está aberto.');
        esperandoConfirmacao = false; 
        return;
    }

    ws.send(JSON.stringify({
        type: 'NOVA_COMANDA',
        comanda: comanda
    }));
}


function handleAlertaInconsistencia(mensagem) {
    document.getElementById('alerta-mensagem').textContent = mensagem;
    document.getElementById('modal-alerta').style.display = 'flex'; 
    document.getElementById('justificativa').value = ''; 
    esperandoConfirmacao = false; 
}


function adicionarNovoItem() {
    const container = document.getElementById('itens-pedido');
    const novoId = container.children.length + 1;
    
    // --- NOVO HTML COM A TABELA DE TAMANHOS ---
    const novoItemHTML = `
        <div class="item-pedido" data-item-id="${novoId}" style="border: 1px dashed #ccc; padding: 10px; margin-bottom: 10px;">
            <button type="button" onclick="this.parentNode.remove(); return false;" style="float: right; color: darkred; background: none; border: none; font-size: 1.1em;">X Remover</button>
            <h3>Item ${novoId}</h3>
            <label for="item-${novoId}">Item Vendido:</label>
            <input type="text" id="item-${novoId}" value="" required>

            <label for="cor-${novoId}">Cor Proposta:</label>
            <input type="text" id="cor-${novoId}" value="" required>
            
            <h4>3. Quantidades por Tamanho</h4>
            <table class="tabela-tamanhos" data-tamanho-id="${novoId}">
                <thead>
                    <tr>
                        <th>Tamanho</th>
                        <th>P</th>
                        <th>M</th>
                        <th>G</th>
                        <th>GG</th>
                        <th>EGG</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Quantidade:</td>
                        <td><input type="number" data-tamanho="P" value="0" min="0"></td>
                        <td><input type="number" data-tamanho="M" value="0" min="0"></td>
                        <td><input type="number" data-tamanho="G" value="0" min="0"></td>
                        <td><input type="number" data-tamanho="GG" value="0" min="0"></td>
                        <td><input type="number" data-tamanho="EGG" value="0" min="0"></td>
                    </tr>
                </tbody>
            </table>
            
            <hr>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', novoItemHTML);
}


document.addEventListener('DOMContentLoaded', () => {
    
    // Inicia a conexão
    conectarWS(); 

    // --- LISTENER PRINCIPAL: ENVIAR COMANDA (CORRIGIDO) ---
    const btnEnviar = document.getElementById('btn-enviar-comanda');
    
    if (btnEnviar) {
        console.log("DEBUG: Botão de envio encontrado.");
        btnEnviar.addEventListener('click', (e) => {
            e.preventDefault(); 
            console.log("-> EVENTO: Botão Enviar Comanda CLICADO!"); 
            enviarComanda(); 
        });
    } else {
        console.error("ERRO CRÍTICO: Botão 'btn-enviar-comanda' não encontrado. Verifique o ID no HTML.");
    }
    // ------------------------------------------

    // Botão REENVIAR COM JUSTIFICATIVA (Dentro do Modal)
    const btnReenviar = document.getElementById('btn-reenviar-justificar');
    if (btnReenviar) {
        btnReenviar.addEventListener('click', () => {
            const justificativaTexto = document.getElementById('justificativa').value.trim();
            
            if (justificativaTexto.length < 5) {
                alert('Por favor, insira uma justificativa detalhada (mínimo 5 caracteres).');
                return;
            }
            
            esperandoConfirmacao = true; 
            ultimaComandaEnviada.justificativa = justificativaTexto;
            
            ws.send(JSON.stringify({
                type: 'NOVA_COMANDA',
                comanda: ultimaComandaEnviada
            }));
        });
    }

    // Botão CORRIGIR E CANCELAR
    const btnCancelar = document.getElementById('btn-cancelar-alerta');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            document.getElementById('modal-alerta').style.display = 'none';
            ultimaComandaEnviada = null; 
            esperandoConfirmacao = false; 
            alert('Corrija a cor no formulário principal e tente novamente.');
        });
    }
    
    // LISTENER PARA ADICIONAR ITENS
    const btnAdicionar = document.getElementById('btn-adicionar-item');
    if (btnAdicionar) {
         btnAdicionar.addEventListener('click', adicionarNovoItem);
    }
});