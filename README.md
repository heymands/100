# 💬 Disque 100 - Extrator de Dados

Ferramenta web para extrair e formatar dados de denúncias para o Disque 100 (Ministério dos Direitos Humanos).

## 🎯 Funcionalidades

- ✅ Extrai 9 respostas de um formulário
- ✅ Formata telefones com DDD: (11) 98765-4321
- ✅ Formata CEP: 01310-100
- ✅ Expande siglas de estados: SP → São Paulo
- ✅ Padroniza horários: seg e sex 8 as 17 → Segunda a Sexta 8h às 17h
- ✅ Corrige acentuação: nao → não, endereco → endereço
- ✅ Reconhece principais cidades brasileiras
- ✅ Aplica capitalização corporativa
- ✅ Protege emails e URLs de alterações
- ✅ Copia resultado para área de transferência

## 📝 Como Usar

1. Cole o texto com as 9 respostas do formulário na caixa de entrada
2. Clique no botão "⚡ Processar"
3. O sistema irá:
   - Extrair apenas as respostas
   - Corrigir acentuação
   - Formatar dados (telefone, CEP, estado)
   - Aplicar padrão corporativo
4. Clique "📋 Copiar" para copiar o resultado
5. Cole no sistema corporativo

## 🛠️ Tecnologia

- **Frontend**: HTML5, CSS3, JavaScript puro
- **Armazenamento**: Navegador (nenhum servidor)
- **Segurança**: 100% offline, sem envio de dados

## 📁 Estrutura

```
disque100/
├── index.html          # Interface web
├── css/
│   └── style.css       # Estilos corporativos
├── js/
│   └── script.js       # Lógica de processamento
└── README.md           # Este arquivo
```

## 🚀 Deploy

Site hospedado em: https://seu-usuario.github.io/disque100/

## 📋 Exemplo

**Entrada:**
```
1. Qual o nome do órgão? Centro de Atendimento ao Cidadão
2. Realiza atendimento direto? Sim
3. Horário? seg a sex 8 as 17
4. Telefone? 11987654321
5. WhatsApp? nao
6. Email? contato@ministerio.gov.br
7. Responsável? Joao Silva
8. Endereço? rua das flores 100 centro sao paulo sp 01310100
9. Jurisdição? nacional
```

**Saída:**
```
Centro de Atendimento ao Cidadão. Sim. Segunda a sexta 8h às 17h. (11) 9876-5432. Não. contato@ministerio.gov.br. João Silva. Rua das flores 100 centro São Paulo São Paulo 01310-100. Nacional.
```

## 👤 Autor

Desenvolvido para o Ministério dos Direitos Humanos - Disque 100

## 📄 Licença

Uso público - Código disponível para modificação e reutilização
