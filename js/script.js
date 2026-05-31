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

    // Remove letras duplicadas consecutivas (como "paaulo" → "paulo", "saaúde" → "saúde", "saaão" → "são")
    removerDuplicatasLetras(texto) {
        // Remove duplicatas de cada vogal
        return texto
            .replace(/a{2,}/g, 'a')         // aa+ → a
            .replace(/aã/g, 'ã')           // aã → ã
            .replace(/aá/g, 'á')           // aá → á
            .replace(/aâ/g, 'â')           // aâ → â
            .replace(/e{2,}/g, 'e')         // ee+ → e
            .replace(/eé/g, 'é')           // eé → é
            .replace(/eê/g, 'ê')           // eê → ê
            .replace(/i{2,}/g, 'i')         // ii+ → i
            .replace(/í{2,}/g, 'í')         // íí+ → í
            .replace(/o{2,}/g, 'o')         // oo+ → o
            .replace(/oó/g, 'ó')           // oó → ó
            .replace(/oõ/g, 'õ')           // oõ → õ
            .replace(/oô/g, 'ô')           // oô → ô
            .replace(/u{2,}/g, 'u')         // uu+ → u
            .replace(/uú/g, 'ú')           // uú → ú
            .replace(/ã{2,}/g, 'ã')        // ãã+ → ã
            .replace(/õ{2,}/g, 'õ')        // õõ+ → õ
            .replace(/á{2,}/g, 'á')        // áá+ → á
            .replace(/é{2,}/g, 'é')        // éé+ → é
            .replace(/í{2,}/g, 'í')        // íí+ → í
            .replace(/ó{2,}/g, 'ó')        // óó+ → ó
            .replace(/ú{2,}/g, 'ú')        // úú+ → ú
            .replace(/â{2,}/g, 'â')        // ââ+ → â
            .replace(/ê{2,}/g, 'ê')        // êê+ → ê
            .replace(/ô{2,}/g, 'ô');       // ôô+ → ô
    }

    // Expande abreviações de órgãos públicos
    expandirAbreviacoes(texto) {
        const abreviacoes = {
            // Polícia
            '\\bDP\\b': 'Delegacia de Polícia',
            '\\bPC\\b': 'Polícia Civil',
            '\\bPM\\b': 'Polícia Militar',
            '\\bPRF\\b': 'Polícia Rodoviária Federal',
            '\\bPE\\b': 'Polícia Estadual',
            
            // Ministério e Órgãos
            '\\bMP\\b': 'Ministério Público',
            '\\bMPF\\b': 'Ministério Público Federal',
            '\\bMPE\\b': 'Ministério Público Estadual',
            
            // Patrimônio e Ambiente
            '\\bIPHAN\\b': 'Instituto do Patrimônio Histórico e Artístico Nacional',
            '\\bIBAMA\\b': 'Instituto Brasileiro do Meio Ambiente',
            '\\bICMBio\\b': 'Instituto Chico Mendes de Conservação da Biodiversidade',
            
            // Justiça e Direito
            '\\bOAB\\b': 'Ordem dos Advogados do Brasil',
            '\\bSTF\\b': 'Supremo Tribunal Federal',
            '\\bSTJ\\b': 'Superior Tribunal de Justiça',
            
            // Internacional
            '\\bONU\\b': 'Organização das Nações Unidas',
            '\\bCNDH\\b': 'Conselho Nacional de Direitos Humanos',
            
            // Corrige "disque 100" para "Disque 100"
            '\\bdisque\\s*100\\b': 'Disque 100',
            '\\bDisque\\s*100\\b': 'Disque 100',
        };
        
        let result = texto;
        for (const [padrao, expansao] of Object.entries(abreviacoes)) {
            result = result.replace(new RegExp(padrao, 'gi'), expansao);
        }
        
        return result;
    }

    // Expande números ordinais (1ª → Primeira, 20ª → Vigésima, etc)
    expandirNumericosOrdinais(texto) {
        const ordinais = {
            '1ª': 'Primeira', '2ª': 'Segunda', '3ª': 'Terceira', '4ª': 'Quarta', '5ª': 'Quinta',
            '6ª': 'Sexta', '7ª': 'Sétima', '8ª': 'Oitava', '9ª': 'Nona', '10ª': 'Décima',
            '11ª': 'Décima Primeira', '12ª': 'Décima Segunda', '13ª': 'Décima Terceira', 
            '14ª': 'Décima Quarta', '15ª': 'Décima Quinta', '16ª': 'Décima Sexta', 
            '17ª': 'Décima Sétima', '18ª': 'Décima Oitava', '19ª': 'Décima Nona', 
            '20ª': 'Vigésima', '21ª': 'Vigésima Primeira', '22ª': 'Vigésima Segunda', 
            '30ª': 'Trigésima', '40ª': 'Quadragésima', '50ª': 'Quinquagésima'
        };
        
        let result = texto;
        for (const [ordinal, nome] of Object.entries(ordinais)) {
            result = result.replace(new RegExp('\\b' + ordinal.replace(/[ª]/g, '[ªª]?'), 'gi'), nome);
        }
        
        return result;
    }

    // Corrige erros ortográficos comuns em contexto governamental
    corrigirGramatica(texto) {
        const correcoes = {
            'delegácia': 'delegacia',
            'atendere': 'atender',
            'comunicacão': 'comunicação',
            'jurisdição': 'jurisdição',
            'proteçao': 'proteção',
            'necessáro': 'necessário',
            'responsavel': 'responsável',
            'informacoes': 'informações',
            'situacoes': 'situações',
            'funcoes': 'funções',
            'acoes': 'ações',
            'defesa': 'defesa',
            'previdencia': 'previdência',
            'assistencia': 'assistência',
            'referencia': 'referência',
            'horario': 'horário',
            'endereço': 'endereço',
        };
        
        let result = texto;
        for (const [errado, correto] of Object.entries(correcoes)) {
            result = result.replace(new RegExp('\\b' + errado + '\\b', 'gi'), correto);
        }
        
        return result;
    }

    // Formata telefones: (DD) 9XXXX-XXXX ou (DD) XXXXX-XXXX
    detectarTelefones(texto) {
        // Remove "telefone" / "tel" / "phone" como palavra isolada (evita remover do meio de palavras)
        texto = texto.replace(/^\s*(telefone|tel|phone)\s*[\:\-]?\s*/gi, '');
        texto = texto.replace(/\s+(telefone|tel|phone)\s*[\:\-]?\s*/gi, ' ');
        
        // Remove +55 se existir
        texto = texto.replace(/\+55\s*/, '');
        
        // Limpa caracteres especiais que não sejam dígitos, parênteses e hífens
        // Mantém apenas: digits, ( ) e -
        // Remove: # * / @ $ & etc
        let result = texto;
        
        // Padrão 1: Com 9 explícito (XX) 9 XXXX XXXX ou (XX)9XXXX-XXXX
        result = result.replace(/\(?(\d{2})\)?[\s\.\-]*9[\s\.\-]?(\d{4})[\s\.\-]?(\d{4})/g, (match, ddd, parte1, parte2) => {
            if ((parte1 + parte2).length === 8) {
                return `(${ddd}) ${parte1}-${parte2}`;
            }
            return match;
        });
        
        // Padrão 2: Sem 9 (XX) XXXX-XXXX
        result = result.replace(/\(?(\d{2})\)?[\s\.\-]?(\d{4})[\s\.\-]?(\d{4})(?![0-9])/g, (match, ddd, parte1, parte2) => {
            if ((parte1 + parte2).length === 8) {
                return `(${ddd}) ${parte1}-${parte2}`;
            }
            return match;
        });
        
        return result;
    }

    // Formata CEP: XXXXX-XXX (apenas se tiver 8 dígitos)
    formatarCEP(texto) {
        // Tira espaços e hífens do CEP antes de formatar
        let result = texto;
        
        // Procura por números e formata se tiver exatamente 8 dígitos
        result = result.replace(/(\d{5})[-\s]?(\d{3})/g, '$1-$2');
        
        return result;
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
            [/\blunes\b/gi, 'Segunda'],
            [/\bmartes\b/gi, 'Terça'],
            [/\bmiercoles\b/gi, 'Quarta'],
            [/\bjueves\b/gi, 'Quinta'],
            [/\bviernes\b/gi, 'Sexta'],
            [/\bsabado\b/gi, 'Sábado'],
            [/\bdomingo\b/gi, 'Domingo'],
        ];
        
        let resultado = texto;
        mapeamento.forEach(([regex, repl]) => {
            resultado = resultado.replace(regex, repl);
        });
        
        // Padroniza: "Segunda à Sexta de 8h às 17h"
        resultado = resultado.replace(/\b(\d{1,2})\s*(?:a|as|às)\s*(\d{1,2})\b/gi, '$1h às $2h');
        resultado = resultado.replace(/\bde\s+(\d{1,2}h)/gi, 'de $1');
        resultado = resultado.replace(/\b(\d{1,2})h?\s*(?:\-|a|as)\s*(\d{1,2})h?\b/gi, '$1h às $2h');
        
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
            'maceio': 'Maceió',
            'niteroi': 'Niterói',
            'sao jose dos campos': 'São José dos Campos',
            'taboao da serra': 'Taboão da Serra',
            // NOVAS CIDADES COMPOSTAS
            'santa barbara': 'Santa Bárbara',
            'sete lagoas': 'Sete Lagoas',
            'divinopolis': 'Divinópolis',
            'igarassu': 'Igarassu',
            'ilheus': 'Ilhéus',
            'ilhabela': 'Ilhabela',
            'boa vista': 'Boa Vista',
            'rio branco': 'Rio Branco',
            'florianopolis': 'Florianópolis',
            'sao caetano do sul': 'São Caetano do Sul',
            'diadema': 'Diadema',
            'maua': 'Mauá',
            'rio grande': 'Rio Grande',
            'passo fundo': 'Passo Fundo',
            'caxias do sul': 'Caxias do Sul',
            'novo hamburgo': 'Novo Hamburgo',
            'santarem': 'Santarém',
            'macapa': 'Macapá',
            'santo antonio': 'Santo Antônio',
            'sao miguel dos campos': 'São Miguel dos Campos',
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
            'seguranca': 'segurança',
            'saude': 'saúde',
            'publico': 'público',
            'publica': 'pública',
            'orgao': 'órgão',
            'cidadao': 'cidadão',
            'cidadaos': 'cidadãos',
            'endereco': 'endereço',
            'enderecos': 'endereços',
            'atendimento': 'atendimento',
            'agencia': 'agência',
            'agencias': 'agências',
            'necessario': 'necessário',
            'necessaria': 'necessária',
            'servico': 'serviço',
            'servicos': 'serviços',
            'acesso': 'acesso',
            'acessos': 'acessos',
            'pessoa': 'pessoa',
            'departamento': 'departamento',
            'ministerio': 'ministério',
            'ministrios': 'ministérios',
            'responsavel': 'responsável',
            'responsaveis': 'responsáveis',
            'assistencia': 'assistência',
            'assistencias': 'assistências',
            'municipio': 'município',
            'municipios': 'municípios',
            'presidencia': 'presidência',
            'superintendencia': 'superintendência',
            'diretoria': 'diretoria',
            'superintendente': 'superintendente',
            'delegacia': 'delegacia',
            'delegacias': 'delegacias',
            'policia': 'polícia',
            'militares': 'militares',
            'seguranca': 'segurança',
            'segurancas': 'segurançass',
            'defesa': 'defesa',
            'defensor': 'defensor',
            'agropecuaria': 'agropecuária',
            'agricultura': 'agricultura',
            'tecnica': 'técnica',
            'tecnicas': 'técnicas',
            'educacao': 'educação',
            'saude': 'saúde',
            'previdencia': 'previdência',
            'habitacao': 'habitação',
            'construcao': 'construção',
            'comercio': 'comércio',
            'industria': 'indústria',
            'universidade': 'universidade',
            'faculdade': 'faculdade',
            'historia': 'história',
            'historico': 'histórico',
            'patrimonio': 'patrimônio',
            'artistico': 'artístico',
            'preservacao': 'preservação',
            'crianca': 'criança',
            'criancas': 'crianças',
            'adolescente': 'adolescente',
            'idoso': 'idoso',
            'idosos': 'idosos',
            'mulher': 'mulher',
            'turista': 'turista',
            'cibernetica': 'cibernética',
            'sistema': 'sistema',
            'sistemas': 'sistemas',
            'tecnologia': 'tecnologia',
            'inovacao': 'inovação',
            'pesquisa': 'pesquisa',
            'desenvolvimento': 'desenvolvimento',
            'metrologia': 'metrologia',
            'qualidade': 'qualidade',
            'meio ambiente': 'meio ambiente',
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
         
        // 2. Remove letras duplicadas (paaulo → paulo)
        resposta = this.removerDuplicatasLetras(resposta);
         
        // 3. Corrige cidades brasileiras PRIMEIRO
        resposta = this.corrigirCidades(resposta);
        
        // 3. Corrige acentuação local (SEM API)
        resposta = this.corrigirAcentuacaoLocal(resposta);
        
        // 4. Corrige gramática e ortografia comum
        resposta = this.corrigirGramatica(resposta);
        
        // 5. Expande abreviações de órgãos (DP → Delegacia de Polícia)
        // NOTA: Ordinais (1ª, 2ª, 20ª) deixados no padrão, sem expansão
        resposta = this.expandirAbreviacoes(resposta);
        
        // 6. Específico por pergunta
        if (numero === 3) {
            resposta = this.padronizarHorarios(resposta);
        }
         
        // Detecta e formata telefones em TODAS as respostas
        resposta = this.detectarTelefones(resposta);
         
        // Corrige estados em TODAS as respostas
        resposta = this.corrigirEstados(resposta);
        
        // 7. Corrige crase (apenas formatação)
        resposta = this.corrigirCrase(resposta);
        
        // 8. Capitalização corporativa (ÚLTIMO PASSO - não altera palavras, apenas maiúscula)
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

            // Processa respostas individuais
            const respostas = [];
            for (let num = 1; num <= 9; num++) {
                if (dados[num]) {
                    const processada = this.processarResposta(num, dados[num]);
                    // DEBUG: Log para São Paulo
                    if (processada.includes('paulo')) {
                        console.log(`Q${num} resultado:`, processada);
                    }
                    respostas.push(processada);
                } else {
                    respostas.push('');
                }
            }

            // NOVO FORMATO: Agrupa respostas por seção
            const resultado = this.formatarOutputAgrupado(respostas);
            
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

    // Novo método: Formata output agrupado por seção (SEM QUEBRA DE LINHA)
    formatarOutputAgrupado(respostas) {
        // respostas[0] = Q1, respostas[1] = Q2, ..., respostas[8] = Q9
         
        const secoes = [];
         
        // Seção 1: Jurisdição/Atribuição (apenas Q9)
        if (respostas[8]) {
            secoes.push(`Jurisdição/Atribuição: ${respostas[8]}`);
        }
        
        // Seção 2: Responsável pela comunicação com o Disque 100 (Q7)
        if (respostas[6]) {
            secoes.push(`Responsável pela comunicação com o Disque 100: ${respostas[6]}`);
        }
        
        // Seção 3: Informações Adicionais (Q3)
        if (respostas[2]) {
            secoes.push(`Informações Adicionais: ${respostas[2]}`);
        }
        
        // Seção 4: Telefones Disponíveis (Q4 e Q5)
        const telefones = [respostas[3], respostas[4]].filter(r => r).join(', ');
        if (telefones) {
            secoes.push(`Telefones Disponíveis: ${telefones}`);
        }
        
        // Retorna com . como separador (SEM QUEBRA DE LINHA)
        return secoes.join('. ') + '.';
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
