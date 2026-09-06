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
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start lg:gap-10">
      <section className="flex flex-col gap-6">
        <SignSearchInput
          onSearch={handleSearch}
          onValueChange={setQuery}
          value={query}
        />

        {result.status === "found" ? (
          <SignVideoPlayer entry={result.entry} key={result.entry.id} />
        ) : null}

        {result.status === "not-found" ? (
          <Empty className="glass-card min-h-[18rem] border border-white/10 border-dashed">
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
          <Empty className="glass-card min-h-[18rem] border border-white/10 border-dashed">
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
      </section>

      <aside className="glass-card flex flex-col gap-4 p-5 sm:p-6">
        <h2 className="text-center font-heading font-medium text-gray-400 text-sm uppercase tracking-wide lg:text-left">
          Vocabulario disponible ({vocabulary.length})
        </h2>

        <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
          {vocabulary.map((entry) => (
            <button
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-gray-300 text-sm backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
              key={entry.id}
              onClick={() => handleVocabularyClick(entry.word)}
              type="button"
            >
              {entry.word}
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
