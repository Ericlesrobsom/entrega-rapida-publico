import React, { useState, useEffect } from 'react';
import { SocialLink } from '@/api/entities';
import { Settings } from '@/api/entities';
import { Loader2, Send, Instagram, Facebook, Youtube, Link as LinkIcon, Twitter, Linkedin, Twitch, Github, Gitlab, ExternalLink } from 'lucide-react';

const iconMap = {
  Send: Send,
  Instagram: Instagram,
  Facebook: Facebook,
  Youtube: Youtube,
  Link: LinkIcon,
  Twitter: Twitter,
  Linkedin: Linkedin,
  Twitch: Twitch,
  Github: Github,
  Gitlab: Gitlab,
  default: LinkIcon,
};

const renderIcon = (iconName) => {
  const IconComponent = iconMap[iconName] || iconMap.default;
  return <IconComponent className="w-5 h-5" />;
};

export default function LinksPage() {
  const [links, setLinks] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [linksData, settingsData] = await Promise.all([
          SocialLink.filter({ is_active: true }, 'sort_order'),
          Settings.list()
        ]);
        setLinks(linksData);
        if (settingsData.length > 0) {
          setSettings(settingsData[0]);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans">
      {/* Header com Logo e Informações */}
      <div className="container mx-auto max-w-md p-6 pt-12">
        <div className="text-center mb-8">
          {settings?.store_logo_url && (
            <div className="mb-6">
              <img
                src={settings.store_logo_url}
                alt="Logo"
                className="w-24 h-24 rounded-full mx-auto shadow-xl border-4 border-white object-cover"
              />
            </div>
          )}
          
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            {settings?.store_name || "Nossos Links"}
          </h1>
          
          <p className="text-gray-600 text-lg leading-relaxed">
            Junte-se à nossa comunidade! Acesse nossos grupos exclusivos e redes sociais.
          </p>
        </div>

        {/* Lista de Links */}
        <div className="space-y-4">
          {links.length === 0 ? (
            <div className="text-center py-12">
              <LinkIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">Nenhum link disponível no momento.</p>
            </div>
          ) : (
            links.map((link, index) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block group transform transition-all duration-300 hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Ícone */}
                      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-3 rounded-xl shadow-md">
                        {renderIcon(link.icon)}
                      </div>
                      
                      {/* Texto */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                          {link.title}
                        </h3>
                        {link.description && (
                          <p className="text-gray-600 text-sm mt-1">
                            {link.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Seta indicando link externo */}
                    <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
                      <ExternalLink className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </a>
            ))
          )}
        </div>

        {/* Rodapé */}
        <div className="text-center mt-12 pb-8">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} {settings?.store_name || "Minha Loja"}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}