// Arquivo: /data/RegrasDeNegocio.js

/**
 * Classe que representa a entidade Colégio, incluindo regras de cores.
 */
class Colegio {
    constructor(id, nome, coresPermitidas) {
        this.id = id;
        this.nome = nome;
        // Armazena as cores permitidas em um Set para buscas rápidas
        this.coresPermitidas = new Set(coresPermitidas.map(c => c.toUpperCase()));
    }
}

// ----------------------------------------------------
// CADASTRO DE COLÉGIOS (Simulação da Tabela Colégios)
// ----------------------------------------------------

const COLEGIOS_DB = {
    "A": new Colegio("A", "Colégio Alfa", ["Azul Marinho", "Cinza Mescla", "Branco"]),
    "B": new Colegio("B", "Escola Beta", ["Vermelho", "Preto", "Amarelo"]),
    "C": new Colegio("C", "Academia Gama", ["Verde", "Branco"]),
};

// ----------------------------------------------------
// LÓGICA DE VALIDAÇÃO (Alerta de Inconsistência)
// ----------------------------------------------------

class ValidadorPedido {
    constructor(colegiosDB) {
        this.colegiosDB = colegiosDB;
    }

    validarInconsistencia(idColegio, corProposta) {
        const colegio = this.colegiosDB[idColegio];
        const corUpper = corProposta ? corProposta.toUpperCase() : null;

        if (!colegio) {
            return { inconsistencia: true, mensagem: `ERRO: Colégio com ID '${idColegio}' não encontrado.` };
        }

        if (colegio.coresPermitidas.has(corUpper)) {
            return { inconsistencia: false, mensagem: "Cor válida." };
        } else {
            const regras = Array.from(colegio.coresPermitidas).join(', ');
            const mensagem = 
                `AVISO: A cor '${corProposta}' não é padrão (Regras: ${regras}) ` +
                `para o ${colegio.nome}. Requer justificativa.`;
            
            return { inconsistencia: true, mensagem: mensagem };
        }
    }
}

// Exporta as classes e o DB para uso no server.js
module.exports = { ValidadorPedido, COLEGIOS_DB };