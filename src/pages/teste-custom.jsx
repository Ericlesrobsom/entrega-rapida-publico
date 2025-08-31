import React from "react";

export default function TesteCustom() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="text-center text-white p-8">
        <h1 className="text-6xl font-bold mb-4">🚀 TESTE</h1>
        <p className="text-2xl mb-6">Esta é uma página de teste simples</p>
        <p className="text-lg">Se você consegue ver isso, o sistema está funcionando!</p>
        <div className="mt-8 p-4 bg-white/20 rounded-lg backdrop-blur-sm">
          <p className="text-sm">URL atual: {window.location.href}</p>
        </div>
      </div>
    </div>
  );
}