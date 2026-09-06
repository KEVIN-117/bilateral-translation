"use client";

import { Search } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { GlassButton } from "@/components/atoms/GlassButton";
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
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
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
            className="h-12 border-white/10 bg-white/5 pl-12 text-base text-white backdrop-blur-md placeholder:text-gray-500"
            onBlur={() => setIsOpen(false)}
            onChange={(event) => {
              onValueChange(event.target.value);
              setIsOpen(true);
              setHighlighted(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe una palabra, por ejemplo: HOLA"
            role="combobox"
            value={value}
          />
        </div>

        <GlassButton className="h-12" size="lg" type="submit" variant="primary">
          Traducir
        </GlassButton>
      </div>

      {showSuggestions ? (
        <div
          className="glass-panel absolute z-20 mt-2 w-full overflow-hidden rounded-xl py-1"
          id={listboxId}
          role="listbox"
        >
          {suggestions.map((entry, index) => (
            <div
              className={cn(
                "cursor-pointer px-4 py-2.5 text-sm text-gray-300 transition-colors",
                index === highlighted && "bg-white/10 text-white",
              )}
              id={`${listboxId}-${entry.id}`}
              key={entry.id}
              // onMouseDown corre antes que onBlur del input, así el clic sí registra.
              onMouseDown={(event) => {
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
