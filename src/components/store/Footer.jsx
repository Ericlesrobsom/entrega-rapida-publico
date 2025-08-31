import React from 'react';

export default function Footer({ settings }) {
  if (!settings || !settings.show_footer) return null;

  const parseFooterLinks = (linksText) => {
    if (!linksText) return [];
    
    return linksText.split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [text, url] = line.split('|');
        return { text: text?.trim(), url: url?.trim() };
      })
      .filter(link => link.text && link.url);
  };

  const footerLinks = parseFooterLinks(settings.footer_links);

  return (
    <footer className="bg-slate-800 text-white py-8 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            {settings.footer_text && (
              <div className="whitespace-pre-line text-slate-300">
                {settings.footer_text}
              </div>
            )}
          </div>
          
          {footerLinks.length > 0 && (
            <div>
              <h4 className="font-semibold mb-4">Links Úteis</h4>
              <ul className="space-y-2">
                {footerLinks.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.url} 
                      className="text-slate-300 hover:text-white transition-colors"
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
          <p>&copy; 2024 {settings.store_name || 'Minha Loja'}. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}