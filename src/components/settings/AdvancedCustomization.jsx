
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Code, Terminal, Type, Eye, Wifi } from "lucide-react";
import { toast } from "sonner";

export default function AdvancedCustomization({ initialSettings, onSave, isSaving }) {
  const [customData, setCustomData] = useState({
    footer_text: "",
    footer_links: "",
    custom_css: "",
    custom_javascript: "",
    show_footer: true,
    tracking_head_scripts: "",
    tracking_body_scripts: "",
  });

  useEffect(() => {
    if (initialSettings) {
      setCustomData({
        footer_text: initialSettings.footer_text || "",
        footer_links: initialSettings.footer_links || "",
        custom_css: initialSettings.custom_css || "",
        custom_javascript: initialSettings.custom_javascript || "",
        show_footer: initialSettings.show_footer !== undefined ? initialSettings.show_footer : true,
        tracking_head_scripts: initialSettings.tracking_head_scripts || "",
        tracking_body_scripts: initialSettings.tracking_body_scripts || "",
      });
    }
  }, [initialSettings]);

  const handleChange = (field, value) => {
    setCustomData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(customData);
  };

  const previewInNewTab = () => {
    window.open('/Store', '_blank');
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Code className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <CardTitle>Personalização Avançada</CardTitle>
                <CardDescription>
                  Edite o rodapé, adicione CSS personalizado e JavaScript para customizar completamente sua loja.
                </CardDescription>
              </div>
            </div>
            <Button type="button" variant="outline" onClick={previewInNewTab}>
              <Eye className="w-4 h-4 mr-2" />
              Visualizar Loja
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Tabs defaultValue="footer" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="footer" className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                Rodapé
              </TabsTrigger>
              <TabsTrigger value="tracking" className="flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                Rastreamento & Pixels
              </TabsTrigger>
              <TabsTrigger value="css" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                CSS
              </TabsTrigger>
              <TabsTrigger value="javascript" className="flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                JavaScript
              </TabsTrigger>
            </TabsList>

            {/* Rodapé Tab */}
            <TabsContent value="footer" className="space-y-4 mt-6">
              <div className="flex items-center space-x-2 p-4 bg-slate-50 rounded-lg">
                <Switch 
                  id="show_footer" 
                  checked={customData.show_footer} 
                  onCheckedChange={(checked) => handleChange("show_footer", checked)} 
                />
                <Label htmlFor="show_footer" className="cursor-pointer">Mostrar rodapé na loja</Label>
              </div>

              {customData.show_footer && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="footer_text">Texto do Rodapé</Label>
                    <Textarea
                      id="footer_text"
                      placeholder="© 2024 Minha Loja. Todos os direitos reservados.&#10;Telefone: (11) 99999-9999&#10;Email: contato@minhaloja.com"
                      value={customData.footer_text}
                      onChange={(e) => handleChange("footer_text", e.target.value)}
                      className="min-h-24"
                    />
                    <p className="text-xs text-slate-500">
                      Você pode usar quebras de linha para organizar o texto.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="footer_links">Links do Rodapé (separados por linha)</Label>
                    <Textarea
                      id="footer_links"
                      placeholder="Sobre Nós|/sobre&#10;Contato|/contato&#10;Página de Links|/Links"
                      value={customData.footer_links}
                      onChange={(e) => handleChange("footer_links", e.target.value)}
                      className="min-h-20"
                    />
                    <p className="text-xs text-slate-500">
                      Formato: Texto do Link|URL (uma linha por link)
                    </p>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Tracking Tab */}
            <TabsContent value="tracking" className="space-y-6 mt-6">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                <p className="text-sm text-blue-800">Use esta seção para adicionar scripts de rastreamento como <strong>Pixel do Facebook</strong>, <strong>Google Analytics</strong> ou <strong>TikTok Pixel</strong>. Cole o código completo fornecido por essas plataformas.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tracking_head_scripts">Scripts na Tag &lt;head&gt;</Label>
                <Textarea
                  id="tracking_head_scripts"
                  placeholder="<!-- Cole aqui o código base do seu Pixel do Facebook -->"
                  value={customData.tracking_head_scripts}
                  onChange={(e) => handleChange("tracking_head_scripts", e.target.value)}
                  className="min-h-48 font-mono text-sm"
                  style={{ fontFamily: 'Monaco, Menlo, monospace' }}
                />
                 <p className="text-xs text-slate-500">
                  Ideal para o código principal do Pixel, Google Analytics (gtag.js), etc.
                </p>
              </div>

               <div className="space-y-2">
                <Label htmlFor="tracking_body_scripts">Scripts no Início da Tag &lt;body&gt;</Label>
                <Textarea
                  id="tracking_body_scripts"
                  placeholder="<!-- Cole aqui a tag <noscript> do Google Tag Manager -->"
                  value={customData.tracking_body_scripts}
                  onChange={(e) => handleChange("tracking_body_scripts", e.target.value)}
                  className="min-h-24 font-mono text-sm"
                  style={{ fontFamily: 'Monaco, Menlo, monospace' }}
                />
                 <p className="text-xs text-slate-500">
                  Usado para tags 'noscript' ou outros scripts que precisam ser carregados no início do corpo da página.
                </p>
              </div>
            </TabsContent>

            {/* CSS Tab */}
            <TabsContent value="css" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="custom_css">CSS Personalizado</Label>
                <Textarea
                  id="custom_css"
                  placeholder="/* Exemplo: Alterar cor dos botões */&#10;.btn-primary {&#10;  background-color: #ff6b6b !important;&#10;  border-color: #ff6b6b !important;&#10;}&#10;&#10;/* Alterar fonte dos títulos */&#10;h1, h2, h3 {&#10;  font-family: 'Times New Roman', serif !important;&#10;}"
                  value={customData.custom_css}
                  onChange={(e) => handleChange("custom_css", e.target.value)}
                  className="min-h-48 font-mono text-sm"
                  style={{ fontFamily: 'Monaco, Menlo, monospace' }}
                />
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Code className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Dicas de CSS:</h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>Use <code>!important</code> para sobrescrever estilos existentes</li>
                          <li>Teste sempre em uma nova aba antes de salvar</li>
                          <li>Use classes como <code>.btn</code>, <code>.card</code>, <code>h1</code>, etc.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* JavaScript Tab */}
            <TabsContent value="javascript" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="custom_javascript">JavaScript Personalizado</Label>
                <Textarea
                  id="custom_javascript"
                  placeholder="// Exemplo: Adicionar Google Analytics&#10;(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){&#10;(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),&#10;m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)&#10;})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');&#10;&#10;ga('create', 'UA-XXXXX-Y', 'auto');&#10;ga('send', 'pageview');&#10;&#10;// Exemplo: Botão de WhatsApp flutuante&#10;document.addEventListener('DOMContentLoaded', function() {&#10;  console.log('Loja carregada!');&#10;});"
                  value={customData.custom_javascript}
                  onChange={(e) => handleChange("custom_javascript", e.target.value)}
                  className="min-h-48 font-mono text-sm"
                  style={{ fontFamily: 'Monaco, Menlo, monospace' }}
                />
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Terminal className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Cuidado com JavaScript:</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>Teste sempre antes de publicar</li>
                          <li>JavaScript mal escrito pode quebrar a loja</li>
                          <li>Use <code>console.log()</code> para debug</li>
                          <li>Perfeito para Analytics, chats, pixels de conversão</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isSaving} className="bg-green-600 hover:bg-green-700">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar Personalizações"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
