"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function Home() {
  const [content, setContent] = useState("");
  const [sha, setSha] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    loadFile();
  }, []);

  async function loadFile() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/file");
      if (!res.ok) throw new Error("Failed to load file");
      const data = await res.json();
      setContent(data.content);
      setSha(data.sha);
    } catch {
      setMessage({ type: "error", text: "Erro ao carregar arquivo. Tente novamente." });
    } finally {
      setLoading(false);
    }
  }

  async function saveFile() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/file", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          sha,
          message: `Atualizar prompt via editor`,
        }),
      });

      if (res.status === 409) {
        setMessage({ type: "error", text: "Arquivo foi modificado. Recarregue a página." });
        return;
      }

      if (!res.ok) throw new Error("Failed to save");

      const data = await res.json();
      setSha(data.sha);
      setLastSaved(new Date());
      setMessage({ type: "success", text: "Salvo com sucesso!" });
    } catch {
      setMessage({ type: "error", text: "Erro ao salvar. Tente novamente." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">
          Donna - Editor de Prompt
        </h1>
        <div className="flex items-center gap-4">
          {lastSaved && (
            <span className="text-sm text-gray-500">
              Salvo: {lastSaved.toLocaleTimeString("pt-BR")}
            </span>
          )}
          <button
            onClick={saveFile}
            disabled={saving || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </header>

      <main className="p-6">
        {message && (
          <div
            className={`mb-4 p-3 rounded-lg ${
              message.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message.text}
            {message.type === "error" && (
              <button
                onClick={loadFile}
                className="ml-4 underline hover:no-underline"
              >
                Recarregar
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-gray-500">Carregando...</div>
          </div>
        ) : (
          <div data-color-mode="light">
            <MDEditor
              value={content}
              onChange={(val) => setContent(val || "")}
              height={700}
              preview="edit"
            />
          </div>
        )}
      </main>
    </div>
  );
}
