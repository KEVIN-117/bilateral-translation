"use client";

import { HandMetal, SearchX } from "lucide-react";
import { useState } from "react";
import { SignSearchInput } from "@/components/molecules/SignSearchInput";
import { SignVideoPlayer } from "@/components/molecules/SignVideoPlayer";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { getSignByWord, listSigns } from "@/lib/sign-dictionary";
import type { SignLookupResult } from "@/model/sign.schema";

/**
  Flujo "Texto -> Seña" el usuario escribe una palabra y obtiene el video
  que le enseña cómo se realiza esa seña
 */
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
    <section className="flex flex-col gap-8">
      <SignSearchInput
        onSearch={handleSearch}
        onValueChange={setQuery}
        value={query}
      />

      {result.status === "found" ? (
        <SignVideoPlayer entry={result.entry} key={result.entry.id} />
      ) : null}

      {result.status === "not-found" ? (
        <Empty className="glass-card min-h-[18rem] border border-dashed border-white/10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchX className="text-gray-400" />
            </EmptyMedia>
            <EmptyTitle className="text-base text-white">
              Seña no encontrada
            </EmptyTitle>
            <EmptyDescription>
              Todavía no tenemos la seña para{" "}
              <span className="font-medium text-white">
                &quot;{result.term}&quot;
              </span>
              . Prueba con otra palabra del vocabulario disponible.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : null}

      {result.status === "idle" ? (
        <Empty className="glass-card min-h-[18rem] border border-dashed border-white/10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HandMetal className="text-gray-400" />
            </EmptyMedia>
            <EmptyTitle className="text-base text-white">
              Busca una seña
            </EmptyTitle>
            <EmptyDescription>
              Escribe una palabra y te mostramos el video que enseña cómo se
              hace en lengua de señas.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : null}

      <div className="flex flex-col gap-4">
        <h2 className="font-heading text-sm font-medium tracking-wide text-gray-400 uppercase">
          Vocabulario disponible ({vocabulary.length})
        </h2>

        <div className="flex flex-wrap gap-2">
          {vocabulary.map((entry) => (
            <button
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
              key={entry.id}
              onClick={() => handleVocabularyClick(entry.word)}
              type="button"
            >
              {entry.word}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
