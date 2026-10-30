import { useLayoutEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";

type Props = {
  value: number;
  isLocked?: boolean;
  placeholder?: string;
  className?: string;
  onSave: (value: number) => void;
};

// Chiffres uniquement, avec un séparateur décimal optionnel (. ou ,)
const NUMERIC_PATTERN = /^\d*[.,]?\d*$/;

const formatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });

// Remplace l'espace insécable (U+202F / U+00A0) de fr-FR par un espace normal
const formatNumber = (n: number) =>
  formatter.format(n).replace(/\u202f|\u00a0/g, " ");

// Formate une saisie brute ("30000,5") en "30 000,5"
const formatDraft = (raw: string) => {
  if (raw === "") return "";
  const [int, dec] = raw.split(/[.,]/);
  const intFormatted = int.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const hasSeparator = /[.,]/.test(raw);
  return hasSeparator ? `${intFormatted},${dec ?? ""}` : intFormatted;
};

export default function SummableNumberCell({
  value,
  isLocked = false,
  placeholder = "Montant à ajouter",
  className = "",
  onSave,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(""); // chiffres bruts, sans espaces

  const inputRef = useRef<HTMLInputElement>(null);
  // Nombre de caractères (hors espaces) situés avant le curseur
  const caretRef = useRef<number | null>(null);

  // Après chaque changement du draft, on replace le curseur
  // au même endroit logique malgré les espaces ajoutés ou retirés
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input || caretRef.current === null) return;

    const formatted = input.value;
    let count = 0;
    let pos = 0;
    while (pos < formatted.length && count < caretRef.current) {
      if (formatted[pos] !== " ") count++;
      pos++;
    }
    input.setSelectionRange(pos, pos);
    caretRef.current = null;
  }, [draft]);

  const startEditing = () => {
    if (isLocked || editing) return;
    setDraft("");
    setEditing(true);
  };

  const commit = () => {
    const added = parseFloat(draft.replace(",", "."));
    if (!Number.isNaN(added)) {
      // arrondi à 2 décimales pour éviter 0.1 + 0.2 = 0.30000000000000004
      onSave(Math.round((value + added) * 100) / 100);
    }
    setEditing(false);
  };

  const cancel = () => setEditing(false);

  return (
    <td
      className={`relative h-full cursor-pointer truncate px-3 text-xs hover:bg-slate-50 ${className}`}
      onClick={startEditing}
    >
      {editing ? (
        <>
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            autoFocus
            className="h-full w-full pr-14"
            placeholder={placeholder}
            value={formatDraft(draft)}
            onChange={(e) => {
              const el = e.target;
              const caret = el.selectionStart ?? el.value.length;
              const raw = el.value.replace(/\s/g, "");

              if (NUMERIC_PATTERN.test(raw)) {
                caretRef.current = el.value
                  .slice(0, caret)
                  .replace(/\s/g, "").length;
                setDraft(raw);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") cancel();
            }}
          />
          <span className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
            <button
              className="cursor-pointer rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50"
              onClick={(e) => {
                e.stopPropagation();
                commit();
              }}
              aria-label="Valider"
            >
              <Check size={14} />
            </button>
            <button
              className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              onClick={(e) => {
                e.stopPropagation();
                cancel();
              }}
              aria-label="Annuler"
            >
              <X size={14} />
            </button>
          </span>
        </>
      ) : (
        formatNumber(value)
      )}
    </td>
  );
}