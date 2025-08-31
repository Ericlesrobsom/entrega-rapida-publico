
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Save, AlertTriangle } from "lucide-react";

export default function MercadoPagoForm({ initialSettings, onSave, isSaving }) {
  const [publicKey, setPublicKey] = useState("");

  useEffect(() => {
    if (initialSettings) {
      setPublicKey(initialSettings.mercado_pago_public_key || "");
    }
  }, [initialSettings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      mercado_pago_public_key: publicKey,
    });
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="text-slate-950 font-semibold leading-none tracking-tight">Integração com Mercado Pago</CardTitle>
          <CardDescription className="text-slate-600 text-sm">
            Para aceitar pagamentos online. O pagamento na entrega é configurado em "Outras Formas de Pagamento".
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="public_key" className="text-slate-950 text-sm font-medium">Public Key</Label>
            <Input
              id="public_key"
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
              placeholder="APP_USR-..."
            />
             <p className="text-xs text-slate-500">
              Sua chave pública é usada para iniciar o pagamento no lado do cliente.
            </p>
          </div>
          
          <div className="flex items-start gap-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
            <AlertTriangle className="w-8 h-8 text-yellow-600 mt-1" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold">Onde está o Access Token (API Key)?</p>
              <p>Por segurança, seu Access Token (a chave secreta) não é gerenciado aqui. Ele deve ser salvo como um "Segredo" no painel da sua aplicação na Base44. Isso o mantém protegido e fora da interface do usuário.</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar Configuração do MP"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
