"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface CommitInfo {
  sha: string;
  message: string;
  date: string;
  author: string;
}

export default function Home() {
  const [content, setContent] = useState("");
  const [sha, setSha] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // History state
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<CommitInfo[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [originalContent, setOriginalContent] = useState("");

  useEffect(() => {
    loadFile();
  }, []);

  async function loadFile() {
    setLoading(true);
    setMessage(null);
    setPreviewMode(false);
    try {
      const res = await fetch("/api/file");
      if (!res.ok) throw new Error("Failed to load file");
      const data = await res.json();
      setContent(data.content);
      setSha(data.sha);
      setOriginalContent(data.content);
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
          message: previewMode ? "Restaurar versão anterior via editor" : "Atualizar prompt via editor",
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
      setOriginalContent(content);
      setPreviewMode(false);
      setMessage({ type: "success", text: previewMode ? "Versão restaurada!" : "Salvo com sucesso!" });
    } catch {
      setMessage({ type: "error", text: "Erro ao salvar. Tente novamente." });
    } finally {
      setSaving(false);
    }
  }

  async function loadHistory() {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/history");
      if (!res.ok) throw new Error("Failed to load history");
      const data = await res.json();
      setHistory(data.history);
      setShowHistory(true);
    } catch {
      setMessage({ type: "error", text: "Erro ao carregar histórico." });
    } finally {
      setLoadingHistory(false);
    }
  }

  async function viewVersion(commitSha: string) {
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/history?sha=${commitSha}`);
      if (!res.ok) throw new Error("Failed to load version");
      const data = await res.json();
      setContent(data.content);
      setPreviewMode(true);
      setShowHistory(false);
      setMessage({ type: "success", text: "Visualizando versão anterior. Clique em 'Restaurar' para salvar." });
    } catch {
      setMessage({ type: "error", text: "Erro ao carregar versão." });
    } finally {
      setLoadingHistory(false);
    }
  }

  function cancelPreview() {
    setContent(originalContent);
    setPreviewMode(false);
    setMessage(null);
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return `Hoje ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
    if (days === 1) return `Ontem ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">
          Donna - Editor de Prompt
          {previewMode && <span className="ml-2 text-sm text-orange-600">(Visualizando versão anterior)</span>}
        </h1>
        <div className="flex items-center gap-4">
          {lastSaved && !previewMode && (
            <span className="text-sm text-gray-500">
              Salvo: {lastSaved.toLocaleTimeString("pt-BR")}
            </span>
          )}
          {previewMode ? (
            <>
              <button
                onClick={cancelPreview}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveFile}
                disabled={saving}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 transition-colors"
              >
                {saving ? "Restaurando..." : "Restaurar"}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={loadHistory}
                disabled={loadingHistory || loading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 disabled:bg-gray-100 transition-colors"
              >
                {loadingHistory ? "..." : "Histórico"}
              </button>
              <button
                onClick={saveFile}
                disabled={saving || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </>
          )}
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

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Histórico de Versões</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {history.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  Nenhum histórico encontrado
                </div>
              ) : (
                <ul className="divide-y">
                  {history.map((commit, index) => (
                    <li key={commit.sha} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {commit.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(commit.date)}
                          </p>
                        </div>
                        {index > 0 && (
                          <button
                            onClick={() => viewVersion(commit.sha)}
                            className="ml-4 px-3 py-1 text-sm border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                          >
                            Ver
                          </button>
                        )}
                        {index === 0 && (
                          <span className="ml-4 px-3 py-1 text-sm text-gray-400">
                            Atual
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="px-6 py-4 border-t bg-gray-50">
              <button
                onClick={() => setShowHistory(false)}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
