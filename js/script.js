    // Capitaliza corporativo - MINIMALISTA (apenas primeira palavra maiúscula)
    capitalizarCorporativo(texto) {
        // Palavras que DEVEM ficar minúsculas (preposições, artigos, etc)
        const minusculas = ['de', 'do', 'da', 'dos', 'das', 'e', 'ou', 'a', 'à', 'em', 'no', 'na', 'nos', 'nas', 'por', 'para', 'com', 'entre', 'sob', 'sobre', 'h', 'às', 'que', 'um', 'uma', 'uns', 'umas'];
        
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
                return palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase();
            }
            
            // Se está na lista de minúsculas, deixa TOTALMENTE minúscula
            if (minusculas.includes(wordLower)) {
                return wordLower;
            }
            
            // RESTO: Mantém exatamente como está no texto original (não força mudança)
            return palavra;
        });
        
        return capitalizado.join(' ');
    }