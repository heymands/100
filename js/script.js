console.log('Script carregado!');

class DadosExtrator {
    constructor() {
        console.log('Iniciando DadosExtrator...');
        this.textoCola = document.getElementById('textoCola');
        this.btnProcessar = document.getElementById('btnProcessar');
        this.btnLimpar = document.getElementById('btnLimpar');
        this.btnCopiar = document.getElementById('btnCopiar');
        this.loading = document.getElementById('loading');
        this.resultBox = document.getElementById('resultBox');
        this.resultContent = document.getElementById('resultContent');
        this.alertError = document.getElementById('alertError');
        this.alertSuccess = document.getElementById('alertSuccess');

        console.log('Elementos encontrados:', {
            btnProcessar: !!this.btnProcessar,
            btnLimpar: !!this.btnLimpar,
            btnCopiar: !!this.btnCopiar,
            textoCola: !!this.textoCola
        });

        this.inicializarEventos();
    }

    inicializarEventos() {
        if (this.btnProcessar) {
            this.btnProcessar.addEventListener('click', (e) => {
                console.log('Clique no botão Processar!');
                e.preventDefault();
                e.stopPropagation();
                this.processar();
            });
        }

        if (this.btnLimpar) {
            this.btnLimpar.addEventListener('click', (e) => {
                console.log('Clique no botão Limpar!');
                e.preventDefault();
                e.stopPropagation();
                this.limpar();
            });
        }

        if (this.btnCopiar) {
            this.btnCopiar.addEventListener('click', (e) => {
                console.log('Clique no botão Copiar!');
                e.preventDefault();
                e.stopPropagation();
                this.copiar();
            });
        }
    }

    normalizar(texto) {
        return texto.replace(/\s+/g, ' ').trim();
    }

    extrairRespostas(texto) {
        const dados = {};
        const linhas = texto.split('\n');
        let numAtual = 0;
        let respostaAtual = '';
        
        for (let i = 0; i < linhas.length; i++) {
            let linha = linhas[i].trim();
            if (!linha) continue;
            
            const match = linha.match(/^(\d+)[\.\-:\s]*(.*)$/);
            
            if (match) {
                const numero = parseInt(match[1]);
                
                if (numero >= 1 && numero <= 9) {
                    if (numAtual > 0 && respostaAtual.trim()) {
                        dados[numAtual] = respostaAtual.trim();
                    }
                    
                    numAtual = numero;
                    let resto = match[2];
                    
                    if (resto.includes('?')) {
                        resto = resto.substring(resto.indexOf('?') + 1);
                    } else if (resto.includes(':')) {
                        resto = resto.substring(resto.indexOf(':') + 1);
                    }
                    
                    respostaAtual = resto.trim();
                } else {
                    respostaAtual += ' ' + linha;
                }
            } else {
                if (numAtual > 0) {
                    respostaAtual += ' ' + linha;
                }
            }
        }
        
        if (numAtual > 0 && respostaAtual.trim()) {
            dados[numAtual] = respostaAtual.trim();
        }
        
        return dados;
    }

    removerDuplicatasLetras(texto) {
        return texto
            .replace(/a{2,}/g, 'a')
            .replace(/e{2,}/g, 'e')
            .replace(/i{2,}/g, 'i')
            .replace(/o{2,}/g, 'o')
            .replace(/u{2,}/g, 'u')
            .replace(/á{2,}/g, 'á')
            .replace(/é{2,}/g, 'é')
            .replace(/í{2,}/g, 'í')
            .replace(/ó{2,}/g, 'ó')
            .replace(/ú{2,}/g, 'ú')
            .replace(/ã{2,}/g, 'ã')
            .replace(/õ{2,}/g, 'õ')
            .replace(/â{2,}/g, 'â')
            .replace(/ê{2,}/g, 'ê')
            .replace(/ô{2,}/g, 'ô');
    }

    corrigirAcentuacaoLocal(texto) {
        const correcoes = {
            'nao': 'não', 'cao': 'cão', 'mae': 'mãe', 'pao': 'pão', 'vao': 'vão',
            'maos': 'mãos', 'irmaos': 'irmãos', 'area': 'área', 'acoes': 'ações',
            'acao': 'ação', 'opcao': 'opção', 'opcoes': 'opções', 'situacao': 'situação',
            'situacoes': 'situações', 'informacao': 'informação', 'informacoes': 'informações',
            'comunicacao': 'comunicação', 'jurisdicao': 'jurisdição', 'atencao': 'atenção',
            'funcao': 'função', 'funcoes': 'funções', 'protecao': 'proteção',
            'seguranca': 'segurança', 'saude': 'saúde', 'publico': 'público',
            'publica': 'pública', 'orgao': 'órgão', 'cidadao': 'cidadão',
            'cidadaos': 'cidadãos', 'endereco': 'endereço', 'enderecos': 'endereços',
            'agencia': 'agência', 'agencias': 'agências', 'necessario': 'necessário',
            'necessaria': 'necessária', 'servico': 'serviço', 'servicos': 'serviços',
            'ministerio': 'ministério', 'responsavel': 'responsável', 'assistencia': 'assistência',
            'municipio': 'município', 'municipios': 'municípios', 'policia': 'polícia',
            'tecnica': 'técnica', 'tecnicas': 'técnicas', 'educacao': 'educação',
            'previdencia': 'previdência', 'habitacao': 'habitação', 'construcao': 'construção',
            'comercio': 'comércio', 'industria': 'indústria', 'historia': 'história',
            'historico': 'histórico', 'patrimonio': 'patrimônio', 'artistico': 'artístico',
            'preservacao': 'preservação', 'crianca': 'criança', 'criancas': 'crianças',
        };

        let result = texto;
        for (const [errada, correta] of Object.entries(correcoes)) {
            const regex = new RegExp(`\\b${errada}\\b`, 'gi');
            result = result.replace(regex, correta);
        }
        return result;
    }

    corrigirCidades(texto) {
        const cidades = {
            'sao paulo': 'São Paulo',
            'rio de janeiro': 'Rio de Janeiro',
            'brasilia': 'Brasília',
            'belo horizonte': 'Belo Horizonte',
            'goiania': 'Goiânia',
            'belem': 'Belém',
            'niteroi': 'Niterói',
            'sao luis': 'São Luís',
            'cuiaba': 'Cuiabá',
            'macapa': 'Macapá',
        };

        let result = texto;
        for (const [errada, correta] of Object.entries(cidades)) {
            const regex = new RegExp(`\\b${errada}\\b`, 'gi');
            result = result.replace(regex, correta);
        }
        return result;
    }

    detectarTelefones(texto) {
        texto = texto.replace(/\btelephone\b/gi, '');
        texto = texto.replace(/\btel\b/gi, '');
        texto = texto.replace(/\bwhatsapp\b/gi, '');
        texto = texto.replace(/\+55\s*/g, '');

        let result = texto;
        
        result = result.replace(/\(?(\d{2})\)?[\s\.\-]*9[\s\.\-]?(\d{4})[\s\.\-]?(\d{4})/g, (match, ddd, parte1, parte2) => {
            return `(${ddd}) ${parte1}-${parte2}`;
        });
        
        result = result.replace(/\(?(\d{2})\)?[\s\.\-]?(\d{4})[\s\.\-]?(\d{4})(?![0-9])/g, (match, ddd, parte1, parte2) => {
            return `(${ddd}) ${parte1}-${parte2}`;
        });
        
        return result;
    }

    formatarCEP(texto) {
        return texto.replace(/(\d{5})[\s\-]?(\d{3})/g, '$1-$2');
    }

    corrigirEstados(texto) {
        const estados = {
            'SP': 'São Paulo', 'RJ': 'Rio de Janeiro', 'MG': 'Minas Gerais',
            'BA': 'Bahia', 'PR': 'Paraná', 'SC': 'Santa Catarina', 'RS': 'Rio Grande do Sul',
            'PE': 'Pernambuco', 'CE': 'Ceará', 'PA': 'Pará', 'GO': 'Goiás',
            'PB': 'Paraíba', 'MA': 'Maranhão', 'ES': 'Espírito Santo', 'PI': 'Piauí',
            'RN': 'Rio Grande do Norte', 'AL': 'Alagoas', 'MT': 'Mato Grosso',
            'MS': 'Mato Grosso do Sul', 'DF': 'Distrito Federal', 'AC': 'Acre',
            'AM': 'Amazonas', 'AP': 'Amapá', 'RO': 'Rondônia', 'RR': 'Roraima',
            'SE': 'Sergipe', 'TO': 'Tocantins',
        };

        let result = texto;
        for (const [sigla, nome] of Object.entries(estados)) {
            const regex = new RegExp(`\\b${sigla}\\b`, 'gi');
            result = result.replace(regex, nome);
        }

        result = this.formatarCEP(result);
        return result;
    }

    capitalizarCorporativo(texto) {
        const minusculas = ['de', 'do', 'da', 'dos', 'das', 'e', 'ou', 'a', 'à', 'em', 'no', 'na', 'nos', 'nas', 'por', 'para', 'com', 'entre', 'sob', 'sobre', 'h', 'às', 'que', 'um', 'uma', 'uns', 'umas'];
        
        const palavras = texto.split(' ');
        const capitalizado = palavras.map((palavra, index) => {
            if (!palavra) return palavra;
            
            if (palavra.includes('@') || palavra.includes('://') || /[()0-9\-]/.test(palavra)) {
                return palavra;
            }
            
            const wordLower = palavra.toLowerCase();
            
            if (index === 0) {
                return palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase();
            }
            
            if (minusculas.includes(wordLower)) {
                return wordLower;
            }
            
            return palavra;
        });
        
        return capitalizado.join(' ');
    }

    processarResposta(numero, resposta) {
        resposta = this.normalizar(resposta);
        resposta = this.removerDuplicatasLetras(resposta);
        resposta = this.corrigirCidades(resposta);
        resposta = this.corrigirAcentuacaoLocal(resposta);
        resposta = this.detectarTelefones(resposta);
        resposta = this.corrigirEstados(resposta);
        resposta = this.capitalizarCorporativo(resposta);
        
        return resposta;
    }

    processar() {
        console.log('=== INICIANDO PROCESSAMENTO ===');
        
        try {
            const textoRaw = this.textoCola.value.trim();
            console.log('Texto recebido:', textoRaw);
            
            if (!textoRaw) {
                alert('Cole o texto com as respostas!');
                return;
            }

            const dados = this.extrairRespostas(textoRaw);
            console.log('Dados extraídos:', dados);
            
            if (Object.keys(dados).length === 0) {
                alert('Nenhuma resposta encontrada. Verifique o formato!');
                return;
            }

            const respostas = [];
            for (let num = 1; num <= 9; num++) {
                if (dados[num]) {
                    const processada = this.processarResposta(num, dados[num]);
                    console.log(`Q${num}: ${processada}`);
                    respostas.push(processada);
                } else {
                    respostas.push('');
                }
            }

            const resultado = this.formatarOutputAgrupado(respostas);
            console.log('Resultado final:', resultado);
            
            if (this.resultContent) {
                this.resultContent.innerText = resultado;
            }
            if (this.resultBox) {
                this.resultBox.style.display = 'block';
            }
            if (this.btnCopiar) {
                this.btnCopiar.style.display = 'block';
            }
            
            alert('Processado com sucesso!');
            
        } catch (erro) {
            console.error('ERRO:', erro);
            alert('Erro ao processar: ' + erro.message);
        }
    }

    formatarOutputAgrupado(respostas) {
        const secoes = [];
         
        if (respostas[8]) {
            secoes.push(`Jurisdição/Atribuição: ${respostas[8]}`);
        }
        
        if (respostas[6]) {
            secoes.push(`Responsável: ${respostas[6]}`);
        }
        
        if (respostas[2]) {
            secoes.push(`Informações: ${respostas[2]}`);
        }
        
        const telefones = [respostas[3], respostas[4]].filter(r => r).join(', ');
        if (telefones) {
            secoes.push(`Telefones: ${telefones}`);
        }
        
        return secoes.join('. ') + '.';
    }

    limpar() {
        console.log('Limpando formulário...');
        if (this.textoCola) this.textoCola.value = '';
        if (this.resultBox) this.resultBox.style.display = 'none';
        if (this.resultContent) this.resultContent.innerText = '';
        if (this.btnCopiar) this.btnCopiar.style.display = 'none';
    }

    copiar() {
        console.log('Copiando resultado...');
        const texto = this.resultContent.innerText;
        if (!texto) {
            alert('Nada para copiar!');
            return;
        }
        
        navigator.clipboard.writeText(texto).then(() => {
            alert('✓ Copiado!');
        }).catch(() => {
            alert('Erro ao copiar!');
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded acionado');
    new DadosExtrator();
});

console.log('Script finalizado (arquivo carregado)');
