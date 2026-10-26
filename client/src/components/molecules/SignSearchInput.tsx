"use client";

import { Search } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchSigns } from "@/lib/sign-dictionary";
import { cn } from "@/lib/utils";

interface SignSearchInputProps {
  value: string;
  onValueChange: (value: string) => void;
  onSearch: (term: string) => void;
}

/**
 * Buscador del diccionario con autocompletado. Las sugerencias salen del
 * catálogo local; seleccionar una dispara la búsqueda directamente.
 */
export function SignSearchInput({
  value,
  onValueChange,
  onSearch,
}: SignSearchInputProps) {
  const listboxId = useId();
  const inputId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);

  const suggestions = useMemo(() => searchSigns(value), [value]);
  const showSuggestions = isOpen && suggestions.length > 0;

  const commit = (term: string) => {
    onValueChange(term);
    onSearch(term);
    setIsOpen(false);
    setHighlighted(-1);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      setHighlighted(-1);
      return;
    }

    if (!showSuggestions) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted((index) => (index + 1) % suggestions.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((index) =>
        index <= 0 ? suggestions.length - 1 : index - 1,
      );
      return;
    }

    if (event.key === "Enter" && suggestions[highlighted]) {
      event.preventDefault();
      commit(suggestions[highlighted].word);
    }
  };

  return (
    <form
      className="relative w-full"
      onSubmit={(event) => {
        event.preventDefault();
        commit(value);
      }}
    >
      <label
        className="mb-2 block text-sm font-medium text-white"
        htmlFor={inputId}
      >
        Escribe una palabra
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#c3c9d1]"
          />
          <Input
            aria-activedescendant={
              suggestions[highlighted]
                ? `${listboxId}-${suggestions[highlighted].id}`
                : undefined
            }
            aria-autocomplete="list"
            aria-controls={showSuggestions ? listboxId : undefined}
            aria-expanded={showSuggestions}
            autoComplete="off"
            className="min-h-12 border-white/25 bg-black/25 pl-12 text-base text-white placeholder:text-[#c3c9d1] focus-visible:ring-2 focus-visible:ring-[#a9c3ea]"
            id={inputId}
            onBlur={() => setIsOpen(false)}
            onChange={(event) => {
              onValueChange(event.target.value);
              setIsOpen(true);
              setHighlighted(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Por ejemplo: gracias"
            role="combobox"
            value={value}
          />
        </div>

        <Button
          className="min-h-12 shrink-0 bg-[#4d6999] px-5 text-white hover:bg-[#5c79aa] focus-visible:ring-[#c3d5f1]"
          type="submit"
        >
          Traducir
        </Button>
      </div>

      {showSuggestions ? (
        <div
          className="translator-glass absolute z-50 mt-2 w-full overflow-hidden rounded-xl py-1"
          id={listboxId}
          role="listbox"
        >
          {suggestions.map((entry, index) => (
            <div
              className={cn(
                "min-h-11 cursor-pointer px-4 py-2.5 text-left text-sm text-white transition-colors",
                index === highlighted && "bg-white/15",
              )}
              id={`${listboxId}-${entry.id}`}
              key={entry.id}
              // onMouseDown corre antes que onBlur del input, así el clic sí registra.
              onPointerDown={(event) => {
                event.preventDefault();
                commit(entry.word);
              }}
              onMouseEnter={() => setHighlighted(index)}
              role="option"
              aria-selected={index === highlighted}
              tabIndex={-1}
            >
              {entry.word}
            </div>
          ))}
        </div>
      ) : null}
    </form>
  );
}
