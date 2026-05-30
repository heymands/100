class DadosExtrator {
    constructor() {
        this.textoCola = document.getElementById('textoCola');
        this.btnProcessar = document.getElementById('btnProcessar');
        this.btnLimpar = document.getElementById('btnLimpar');
        this.btnCopiar = document.getElementById('btnCopiar');
        this.loading = document.getElementById('loading');
        this.resultBox = document.getElementById('resultBox');
        this.resultContent = document.getElementById('resultContent');
        this.alertError = document.getElementById('alertError');
        this.alertSuccess = document.getElementById('alertSuccess');

        this.bindEvents();
    }

    bindEvents() {
        this.btnProcessar.addEventListener('click', () => this.processar());
        this.btnLimpar.addEventListener('click', () => this.limpar());
        this.btnCopiar.addEventListener('click', () => this.copiar());

        // Auto-resize textarea
        this.textoCola.addEventListener('input', () => this.autoResizeTextarea());
        this.textoCola.addEventListener('paste', () => {
            setTimeout(() => this.autoResizeTextarea(), 10);
        });
    }

    autoResizeTextarea() {
        this.textoCola.style.height = 'auto';
        this.textoCola.style.height = Math.min(this.textoCola.scrollHeight, 600) + 'px';
    }

    // Extrai as 9 respostas (com : ou ? ou sem)
    extrairRespostas(texto) {
        const dados = {};
        const linhas = texto.split('\n');
        
        let numAtual = 0;
        let respostaAtual = '';
        
        for (let i = 0; i < linhas.length; i++) {
            let linha = linhas[i].trim();
            if (!linha) continue;
            
            // Detecta número no início
            const match = linha.match(/^(\d+)[\.\-:\s]*(.*)$/);
            
            if (match) {
                const numero = parseInt(match[1]);
                
                if (numero >= 1 && numero <= 9) {
                    // Salva resposta anterior
                    if (numAtual > 0 && respostaAtual.trim()) {
                        dados[numAtual] = respostaAtual.trim();
                    }
                    
                    numAtual = numero;
                    let resto = match[2];
                    
                    // Remove pergunta (tudo antes de : ou ?)
                    if (resto.includes('?')) {
                        resto = resto.substring(resto.indexOf('?') + 1);
                    } else if (resto.includes(':')) {
                        resto = resto.substring(resto.indexOf(':') + 1);
                    }
                    
                    respostaAtual = resto.trim();
                } else {
                    // Continua a resposta anterior
                    respostaAtual += ' ' + linha;
                }
            } else {
                // Linha sem número - continua resposta
                if (numAtual > 0) {
                    respostaAtual += ' ' + linha;
                }
            }
        }
        
        // Salva última resposta
        if (numAtual > 0 && respostaAtual.trim()) {
            dados[numAtual] = respostaAtual.trim();
        }
        
        return dados;
    }

    // Normaliza espaços
    normalizar(texto) {
        return texto.replace(/\s+/g, ' ').trim();
    }

    // Formata telefones: (DD) 9XXXX-XXXX ou (DD) XXXXX-XXXX
    detectarTelefones(texto) {
        // Remove "tel" ou "telefone" se existir
        texto = texto.replace(/\b(tel|telefone|phone)\s*[\:\-]?\s*/gi, '');
        
        // Padrão: (XX) 9XXXX-XXXX ou (XX) XXXXX-XXXX
        // Extrai DDD + 8 ou 9 dígitos
        return texto.replace(/\(?(\d{2})\)?[\s\-]?9?(\d{4})[\s\-]?(\d{4})/g, (match, ddd, parte1, parte2) => {
            return `(${ddd}) 9${parte1}-${parte2}`;
        });
    }

    // Formata CEP: XXXXX-XXX
    formatarCEP(texto) {
        return texto.replace(/(\d{5})(\d{3})/g, '$1-$2');
    }

    // Padroniza horários
    padronizarHorarios(texto) {
        const mapeamento = [
            [/\bseg\b/gi, 'Segunda'],
            [/\bter\b/gi, 'Terça'],
            [/\bqua\b/gi, 'Quarta'],
            [/\bqui\b/gi, 'Quinta'],
            [/\bsex\b/gi, 'Sexta'],
            [/\bsab\b/gi, 'Sábado'],
            [/\bdom\b/gi, 'Domingo'],
        ];
        
        let resultado = texto;
        mapeamento.forEach(([regex, repl]) => {
            resultado = resultado.replace(regex, repl);
        });
        
        // Padroniza: "Segunda à Sexta de 8h às 17h"
        resultado = resultado.replace(/\b(\d{1,2})\s*(?:a|as|às)\s*(\d{1,2})\b/gi, '$1h às $2h');
        resultado = resultado.replace(/\bde\s+(\d{1,2}h)/gi, 'de $1');
        
        return resultado;
    }

    // Corrige crase CORRETAMENTE (apenas quando há artigo)
    corrigirCrase(texto) {
        // Crase SÓ ocorre: preposição "a" + artigo definido feminino "a"/"as"
        
        // Evita: emails, URLs, números
        if (texto.includes('@') || texto.includes('://') || /\d/.test(texto)) {
            return texto;
        }
        
        let result = texto;
        
        // "a as" → "às" (preposição + artigo plural feminino)
        result = result.replace(/\ba\s+as\b/gi, (match) => {
            return match.toLowerCase() === 'a as' ? 'às' : 'Às';
        });
        
        // "a a" → "à" (preposição + artigo singular feminino)
        // MAS não em casos como "segunda a sexta" (sem artigo)
        result = result.replace(/\ba\s+a\s+([aeiou])/gi, (match, letra) => {
            // Verifica se é seguido de vogal (sinal de artigo + substantivo)
            return match.toLowerCase().startsWith('a a a') ? 'à a ' + letra : match;
        });
        
        // "para a" → "para à" (preposição + artigo)
        result = result.replace(/para\s+a\s+([aeiou])/gi, 'para à $1');
        
        // "em a" → "na" (contração comum)
        result = result.replace(/em\s+a\b/gi, 'na');
        
        // "de a" → "da" (contração comum)
        result = result.replace(/de\s+a\b/gi, 'da');
        
        return result;
    }

    // Corrige estados (converte siglas com case-insensitive) e CEP
    corrigirEstados(texto) {
        const estados = {
            'AC': 'Acre', 'AL': 'Alagoas', 'AP': 'Amapá', 'AM': 'Amazonas',
            'BA': 'Bahia', 'CE': 'Ceará', 'DF': 'Distrito Federal', 'ES': 'Espírito Santo',
            'GO': 'Goiás', 'MA': 'Maranhão', 'MT': 'Mato Grosso', 'MS': 'Mato Grosso do Sul',
            'MG': 'Minas Gerais', 'PA': 'Pará', 'PB': 'Paraíba', 'PR': 'Paraná',
            'PE': 'Pernambuco', 'PI': 'Piauí', 'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte',
            'RS': 'Rio Grande do Sul', 'RO': 'Rondônia', 'RR': 'Roraima', 'SC': 'Santa Catarina',
            'SP': 'São Paulo', 'SE': 'Sergipe', 'TO': 'Tocantins'
        };
        
        let result = texto;
        
        // Substitui siglas (case-insensitive mas preserva acentos)
        for (const [sigla, nome] of Object.entries(estados)) {
            // Procura sigla em maiúscula, minúscula ou mista
            result = result.replace(new RegExp(`\\b${sigla}\\b`, 'gi'), nome);
        }
        
        // Formata CEP
        result = this.formatarCEP(result);
        
        return result;
    }

    // Capitaliza corporativo - MINIMALISTA (respeta original tanto quanto possível)
    capitalizarCorporativo(texto) {
        // Palavras que DEVEM ficar minúsculas (preposições, artigos, etc)
        const minusculas = ['de', 'do', 'da', 'dos', 'das', 'e', 'ou', 'a', 'à', 'em', 'no', 'na', 'nos', 'nas', 'por', 'para', 'com', 'entre', 'sob', 'sobre', 'h', 'às', 'que', 'um', 'uma', 'uns', 'umas', 'as', 'o', 'os', 'la', 'le', 'les'];
        
        const palavras = texto.split(' ');
        const capitalizado = palavras.map((palavra, index) => {
            // NUNCA capitaliza:
            // 1. Emails
            if (palavra.includes('@')) return palavra;
            
            // 2. URLs/Websites
            if (palavra.includes('://') || palavra.includes('www.') || palavra.includes('.com') || palavra.includes('.gov') || palavra.includes('.org') || palavra.includes('.edu')) return palavra;
            
            // 3. Números, telefones, CEPs
            if (/^\d+/.test(palavra) || /[()0-9\-]/.test(palavra)) return palavra;
            
            const wordLower = palavra.toLowerCase();
            
            // Primeira palavra SEMPRE maiúscula (primeira letra)
            if (index === 0) {
                return palavra.charAt(0).toUpperCase() + palavra.slice(1);
            }
            
            // Se está na lista de minúsculas, deixa TOTALMENTE minúscula
            if (minusculas.includes(wordLower)) {
                return wordLower;
            }
            
            // RESTO: Apenas primeira letra maiúscula, mantém resto COMO ESTAVA (preserva acentos)
            return palavra.charAt(0).toUpperCase() + palavra.slice(1);
        });
        
        return capitalizado.join(' ');
    }

    // Dicionário de CIDADES brasileiras principais
    getCidadesBrasil() {
        return {
            'sao paulo': 'São Paulo',
            'rio de janeiro': 'Rio de Janeiro',
            'brasilia': 'Brasília',
            'salvador': 'Salvador',
            'fortaleza': 'Fortaleza',
            'belo horizonte': 'Belo Horizonte',
            'manaus': 'Manaus',
            'curitiba': 'Curitiba',
            'recife': 'Recife',
            'porto alegre': 'Porto Alegre',
            'goiania': 'Goiânia',
            'belem': 'Belém',
            'guarulhos': 'Guarulhos',
            'campinas': 'Campinas',
            'sao goncalo': 'São Gonçalo',
            'maceio': 'Maceió',
            'duque de caxias': 'Duque de Caxias',
            'natal': 'Natal',
            'osasco': 'Osasco',
            'sao bernardo do campo': 'São Bernardo do Campo',
            'teresina': 'Teresina',
            'santo andre': 'Santo André',
            'joao pessoa': 'João Pessoa',
            'jaboatao': 'Jaboatão',
            'ribeirao preto': 'Ribeirão Preto',
            'uberlandia': 'Uberlândia',
            'aracaju': 'Aracaju',
            'sao luis': 'São Luís',
            'sorocaba': 'Sorocaba',
            'cuiaba': 'Cuiabá',
            'palmas': 'Palmas',
            'campo grande': 'Campo Grande',
            'joao pessoa': 'João Pessoa',
            'maceio': 'Maceió',
            'niteroi': 'Niterói',
            'sao jose dos campos': 'São José dos Campos',
            'taboao da serra': 'Taboão da Serra',
        };
    }

    // Corrige cidades brasileiras
    corrigirCidades(texto) {
        const cidades = this.getCidadesBrasil();
        let result = texto;
        
        for (const [errada, correta] of Object.entries(cidades)) {
            const regex = new RegExp(`\\b${errada}\\b`, 'gi');
            result = result.replace(regex, correta);
        }
        
        return result;
    }

    // Dicionário de ACENTUAÇÃO básica local
    getDicionarioAcentuacao() {
        return {
            // Comum "a" → "á"
            'afasia': 'afasia',
            
            // Comum "o" → "ó"
            'onus': 'ônus',
            'ordos': 'órdos',
            
            // Comum "e" → "é"
            'cafe': 'café',
            'acesso': 'acesso',
            'defesa': 'defesa',
            
            // Comum "a" → "ã"
            'nao': 'não',
            'cao': 'cão',
            'sao': 'são',
            'mae': 'mãe',
            'pao': 'pão',
            'vao': 'vão',
            'maos': 'mãos',
            'irmaos': 'irmãos',
            'pais': 'país',
            'cais': 'cais',
            
            // Comum "a" → "á"
            'area': 'área',
            'asea': 'à sea',
            
            // Comum "o" → "õ"
            'acoes': 'ações',
            'acao': 'ação',
            'opcao': 'opção',
            'opcoes': 'opções',
            'situacao': 'situação',
            'situacoes': 'situações',
            'informacao': 'informação',
            'informacoes': 'informações',
            'comunicacao': 'comunicação',
            'jurisdicao': 'jurisdição',
            'geolocalizacao': 'geolocalização',
            'localizacao': 'localização',
            'atencao': 'atenção',
            'funcao': 'função',
            'funcoes': 'funções',
            'conclusao': 'conclusão',
            'percepcao': 'percepção',
            'protecao': 'proteção',
            'direcao': 'direção',
            
            // Comum "e" → "ê"
            'endereço': 'endereço',
            'endereco': 'endereço',
            'enderecos': 'endereços',
            'acesso': 'acesso',
            
            // Comum "u" → "ú"
            'modulo': 'módulo',
            'residuo': 'resíduo',
            
            // Cidadão/Cidadã
            'cidadao': 'cidadão',
            'cidadaos': 'cidadãos',
            'cidada': 'cidadã',
            'cidadas': 'cidadãs',
            
            // Outras
            'ninguem': 'ninguém',
            'tambem': 'também',
            'alem': 'além',
            'amanha': 'amanhã',
            'responsavel': 'responsável',
            'humanitario': 'humanitário',
            'importante': 'importante',
            'funcionamento': 'funcionamento',
        };
    }

    // Corrige acentuação SEM alterar palavras
    corrigirAcentuacaoLocal(texto) {
        const dicionario = this.getDicionarioAcentuacao();
        let result = texto;
        
        for (const [errada, correta] of Object.entries(dicionario)) {
            const regex = new RegExp(`\\b${errada}\\b`, 'gi');
            result = result.replace(regex, correta);
        }
        
        return result;
    }

    // Processa cada resposta com formatação SEGURA (sem alterar palavras)
    processarResposta(numero, resposta) {
        // 1. Normaliza espaços
        resposta = this.normalizar(resposta);
        
        // 2. Corrige acentuação local (SEM API)
        resposta = this.corrigirAcentuacaoLocal(resposta);
        
        // 3. Corrige cidades brasileiras
        resposta = this.corrigirCidades(resposta);
        
        // 4. Específico por pergunta
        if (numero === 3) {
            resposta = this.padronizarHorarios(resposta);
        }
        
        if (numero === 4 || numero === 5) {
            resposta = this.detectarTelefones(resposta);
        }
        
        if (numero === 8) {
            resposta = this.corrigirEstados(resposta);
        }
        
        // 5. Corrige crase (apenas formatação)
        resposta = this.corrigirCrase(resposta);
        
        // 6. Capitalização corporativa (ÚLTIMO PASSO - não altera palavras, apenas maiúscula)
        resposta = this.capitalizarCorporativo(resposta);
        
        return resposta;
    }

    async processar() {
        try {
            this.mostrarLoading(true);
            this.esconderAlerts();

            const textoRaw = this.textoCola.value.trim();
            if (!textoRaw) {
                this.mostrarErro('Cole o texto com as respostas!');
                this.mostrarLoading(false);
                return;
            }

            const dados = this.extrairRespostas(textoRaw);
            if (Object.keys(dados).length === 0) {
                this.mostrarErro('Nenhuma resposta encontrada. Verifique o formato!');
                this.mostrarLoading(false);
                return;
            }

            // Processa respostas
            const respostas = [];
            for (let num = 1; num <= 9; num++) {
                if (dados[num]) {
                    const processada = this.processarResposta(num, dados[num]);
                    respostas.push(processada);
                } else {
                    respostas.push('');
                }
            }

            // Exibe resultado
            const resultado = respostas.join('. ');
            this.resultContent.innerText = resultado;
            this.resultBox.style.display = 'block';
            this.btnCopiar.style.display = 'block';
            this.mostrarSucesso('Processado com sucesso!');
            
        } catch (erro) {
            console.error(erro);
            this.mostrarErro('Erro ao processar: ' + erro.message);
        } finally {
            this.mostrarLoading(false);
        }
    }

    limpar() {
        this.textoCola.value = '';
        this.textoCola.style.height = 'auto';
        this.textoCola.style.height = '140px';
        this.resultBox.style.display = 'none';
        this.resultContent.innerText = '';
        this.btnCopiar.style.display = 'none';
        this.esconderAlerts();
    }

    copiar() {
        const texto = this.resultContent.innerText;
        if (!texto) {
            this.mostrarErro('Nada para copiar!');
            return;
        }
        
        navigator.clipboard.writeText(texto).then(() => {
            this.mostrarSucesso('✓ Copiado para área de transferência!');
        }).catch(() => {
            this.mostrarErro('Erro ao copiar!');
        });
    }

    mostrarLoading(visible) {
        this.loading.style.display = visible ? 'block' : 'none';
    }

    mostrarErro(msg) {
        this.alertError.innerText = msg;
        this.alertError.style.display = 'block';
        setTimeout(() => {
            this.alertError.style.display = 'none';
        }, 5000);
    }

    mostrarSucesso(msg) {
        this.alertSuccess.innerText = msg;
        this.alertSuccess.style.display = 'block';
        setTimeout(() => {
            this.alertSuccess.style.display = 'none';
        }, 5000);
    }

    esconderAlerts() {
        this.alertError.style.display = 'none';
        this.alertSuccess.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DadosExtrator();
});
