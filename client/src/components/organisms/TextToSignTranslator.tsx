"use client";

import { BookOpen } from "lucide-react";
import { useState } from "react";
import { SignSearchInput } from "@/components/molecules/SignSearchInput";
import { SignVideoPlayer } from "@/components/molecules/SignVideoPlayer";
import { getSignByWord, listSigns } from "@/lib/sign-dictionary";
import type { SignLookupResult } from "@/model/sign.schema";

export function TextToSignTranslator() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SignLookupResult>({ status: "idle" });

  const vocabulary = listSigns();

  const handleSearch = (term: string) => {
    const trimmed = term.trim();

    if (!trimmed) {
      setResult({ status: "idle" });
      return;
    }

    const entry = getSignByWord(trimmed);

    setResult(
      entry
        ? { status: "found", entry }
        : { status: "not-found", term: trimmed },
    );
  };

  const handleVocabularyClick = (word: string) => {
    setQuery(word);
    handleSearch(word);
  };

  return (
    <section
      aria-label="Traductor de texto a seña"
      className="relative min-h-dvh w-full overflow-hidden bg-[#050608]"
    >
      {result.status === "found" ? (
        <SignVideoPlayer entry={result.entry} immersive key={result.entry.id} />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pb-20 pt-36 text-center">
          <BookOpen
            aria-hidden="true"
            className="mb-5 h-10 w-10 text-[#c3c9d1]"
            strokeWidth={1.6}
          />
          <h2 className="text-2xl font-semibold leading-tight text-white sm:text-3xl">
            {result.status === "not-found"
              ? "No encontramos esa palabra"
              : "Busca una palabra"}
          </h2>
          <p
            className="mt-3 max-w-md text-base leading-relaxed text-[#d0d6df]"
            role={result.status === "not-found" ? "alert" : undefined}
          >
            {result.status === "not-found"
              ? `No tenemos “${result.term}” en el vocabulario actual. Prueba con otra palabra.`
              : "El video de la seña aparecerá aquí cuando elijas una palabra disponible."}
          </p>
        </div>
      )}

      <aside
        aria-labelledby="buscar-sena-titulo"
        className="translator-glass translator-panel absolute left-6 top-24 z-20 w-[min(23rem,calc(100%-3rem))] rounded-2xl p-5 sm:p-6 max-md:left-4 max-md:top-36 2xl:left-10 2xl:top-28"
      >
        <h2
          className="mb-4 text-lg font-semibold text-white"
          id="buscar-sena-titulo"
        >
          Encuentra una seña
        </h2>
        <SignSearchInput
          onSearch={handleSearch}
          onValueChange={setQuery}
          value={query}
        />

        <details className="mt-5 border-t border-white/15 pt-4">
          <summary className="min-h-11 cursor-pointer py-2 text-sm font-medium text-[#e0e5eb] underline decoration-white/40 underline-offset-4 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c3d5f1]">
            Vocabulario disponible ({vocabulary.length})
          </summary>
          <ul className="mt-3 grid grid-cols-2 gap-2">
            {vocabulary.map((entry) => (
              <li key={entry.id}>
                <button
                  className="min-h-11 w-full rounded-md bg-white/10 px-3 py-2 text-left text-sm font-medium text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c3d5f1]"
                  onClick={() => handleVocabularyClick(entry.word)}
                  type="button"
                >
                  {entry.word}
                </button>
              </li>
            ))}
          </ul>
        </details>

        {result.status === "found" && (
          <p className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-[#d8dee6]">
            <BookOpen aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            Seña de LSB boliviana.
          </p>
        )}
      </aside>
    </section>
  );
}
