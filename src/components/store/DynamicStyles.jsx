
import React, { useEffect } from 'react';

export default function DynamicStyles({ settings }) {
  // Este useEffect irá manipular a injeção e remoção de scripts e estilos
  useEffect(() => {
    if (!settings) return;

    const elementsToRemove = [];

    // Mapear tamanhos de fonte para desktop
    const fontSizeDesktopMap = {
      small: '14px',
      medium: '16px',  // padrão
      large: '18px',
      'extra-large': '20px'
    };

    // Mapear tamanhos de fonte para mobile
    const fontSizeMobileMap = {
      'extra-small': '12px',
      small: '14px',  // recomendado para mobile
      medium: '16px',
      large: '18px'
    };

    const desktopFontSize = fontSizeDesktopMap[settings.font_size_desktop] || 
                           fontSizeDesktopMap[settings.font_size] || '16px'; // fallback para configuração legado
    const mobileFontSize = fontSizeMobileMap[settings.font_size_mobile] || '14px';

    // 1. Injetar CSS personalizado e variáveis de cor + fonte responsiva
    if (settings.store_primary_color || settings.custom_css || settings.font_size_desktop || settings.font_size_mobile) {
      const styleTag = document.createElement('style');
      styleTag.id = 'dynamic-store-styles';
      styleTag.innerHTML = `
        .verified-product-glow {
          position: relative;
          overflow: hidden; /* Garante que a linha animada fique dentro do card */
          border-radius: 0.75rem; /* Correspondente ao rounded-lg do Card */
        }

        .verified-product-glow::before {
          content: '';
          position: absolute;
          width: 150%;
          height: 150%;
          background: conic-gradient(
            transparent,
            transparent,
            transparent,
            var(--store-primary, #f97316) /* Cor laranja do botão */
          );
          animation: rotate-border 4s linear infinite;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1; /* Fica acima do conteúdo, mas o card tem z-index maior */
        }
        
        .verified-product-glow::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          right: 2px;
          bottom: 2px;
          background: var(--card-bg, #ffffff); /* Usa uma variável para o fundo do card */
          border-radius: 0.65rem; /* Um pouco menor para criar a borda */
          z-index: 2; /* Cobre a animação, revelando só a borda */
        }

        .dark .verified-product-glow::after {
          background: var(--card-bg-dark, #1f2937); /* Cor do card no modo escuro */
        }
        
        /* A animação */
        @keyframes rotate-border {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }

        /* Isso garante que o conteúdo do card apareça acima da borda animada */
        .verified-product-glow > * {
          position: relative;
          z-index: 3;
        }

        /* New glow effect for text */
        .verified-text-glow {
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          background-image: linear-gradient(90deg, #fde047, #f97316, #fde047);
          background-size: 200% 100%;
          animation: glow-text 3s linear infinite;
        }

        @keyframes glow-text {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        :root {
          --store-primary: ${settings.store_primary_color || '#f97316'}; /* Laranja como padrão */
          --store-secondary: ${settings.store_secondary_color || '#4f46e5'};
          --desktop-font-size: ${desktopFontSize};
          --mobile-font-size: ${mobileFontSize};
          --card-bg: #ffffff; /* Cor de fundo padrão do card */
          --card-bg-dark: rgb(17 24 39 / 0.9); /* Cor de fundo do card escuro */
        }
        
        /* Aplicar tamanho de fonte para desktop (padrão) */
        html {
          font-size: var(--desktop-font-size);
        }
        
        body {
          font-size: 1rem;
        }
        
        /* Aplicar tamanho de fonte para mobile */
        @media (max-width: 768px) {
          html {
            font-size: var(--mobile-font-size);
          }
        }
        
        /* Ajustes de classes para manter proporções */
        .text-sm {
          font-size: 0.875rem;
        }
        
        .text-lg {
          font-size: 1.125rem;
        }
        
        .text-xl {
          font-size: 1.25rem;
        }
        
        .text-2xl {
          font-size: 1.5rem;
        }
        
        .text-3xl {
          font-size: 1.875rem;
        }
        
        /* CSS personalizado do usuário */
        ${settings.custom_css || ''}
      `;
      document.head.appendChild(styleTag);
      elementsToRemove.push(styleTag);
    }

    // 2. Injetar scripts na tag <head>
    if (settings.tracking_head_scripts) {
      const headScriptTag = document.createElement('script');
      headScriptTag.id = 'dynamic-head-scripts';
      // Usar innerHTML para que o navegador interprete o conteúdo como script
      headScriptTag.innerHTML = settings.tracking_head_scripts;
      document.head.appendChild(headScriptTag);
      elementsToRemove.push(headScriptTag);
    }

    // 3. Injetar scripts no início da tag <body>
    if (settings.tracking_body_scripts) {
      const bodyScriptTag = document.createElement('div'); // Usar div como wrapper
      bodyScriptTag.id = 'dynamic-body-scripts';
      bodyScriptTag.innerHTML = settings.tracking_body_scripts;
      document.body.prepend(bodyScriptTag); // prepend para adicionar no início
      elementsToRemove.push(bodyScriptTag);
    }

    // 4. Injetar JavaScript personalizado no final da tag <body>
    if (settings.custom_javascript) {
      const customJsTag = document.createElement('script');
      customJsTag.id = 'dynamic-custom-js';
      customJsTag.innerHTML = settings.custom_javascript;
      document.body.appendChild(customJsTag);
      elementsToRemove.push(customJsTag);
    }

    // Função de limpeza: remove todos os elementos injetados quando o componente desmonta
    return () => {
      elementsToRemove.forEach(element => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });
    };
  }, [settings]); // Re-executar o efeito se as configurações mudarem

  // Este componente não renderiza nada visível, apenas gerencia os efeitos colaterais
  return null;
}
