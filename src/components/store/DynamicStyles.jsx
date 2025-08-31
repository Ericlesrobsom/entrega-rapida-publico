import React, { useEffect } from 'react';

export default function DynamicStyles({ settings }) {
  // Este useEffect irá manipular a injeção e remoção de scripts e estilos
  useEffect(() => {
    if (!settings) return;

    const elementsToRemove = [];

    // 1. Injetar CSS personalizado e variáveis de cor
    if (settings.store_primary_color || settings.custom_css) {
      const styleTag = document.createElement('style');
      styleTag.id = 'dynamic-store-styles';
      styleTag.innerHTML = `
        :root {
          --store-primary: ${settings.store_primary_color || '#2563eb'};
          --store-secondary: ${settings.store_secondary_color || '#4f46e5'};
        }
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