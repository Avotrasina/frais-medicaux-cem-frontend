import { useRef, useState } from "react";
import { Check, X } from "lucide-react";

type Props = {
  value: string;
  isLocked?: boolean;
  placeholder?: string;
  className?: string;
  emptyValue?: string;
  onSave: (value: string) => void;
};

function toInputDate(value: string): string {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : value;
}

function toStoredDate(value: string): string {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
}

export default function EditableDateCell({
  value,
  isLocked = false,
  placeholder,
  className = "",
  emptyValue = "",
  onSave,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const startEditing = () => {
    if (isLocked || editing) return;
    setDraft(toInputDate(value));
    setEditing(true);
  };

  const commit = () => {
    onSave(toStoredDate(draft));
    setEditing(false);
  };

  const cancel = () => setEditing(false);

  const closeIfUnchanged = () => {
    if (dateInputRef.current === document.activeElement) return;
    if (toStoredDate(draft) === value) setEditing(false);
  };

  return (
    <td
      className={`relative h-full truncate px-3 text-xs ${isLocked ? "cursor-not-allowed bg-slate-100 text-slate-400" : "cursor-pointer hover:bg-slate-50"} ${className}`}
      onClick={startEditing}
      onMouseLeave={closeIfUnchanged}
    >
      {editing ? (
        <>
          <input type="date"
            ref={dateInputRef}
            autoFocus
            className="box-border h-full w-full min-w-0 max-w-full pr-14 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600"
            placeholder={placeholder}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") cancel();
            }}
          />
          <span className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
            <button
              className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50"
              onClick={(e) => {
                e.stopPropagation();
                commit();
              }}
              aria-label="Valider"
            >
              <Check size={14} />
            </button>
            <button
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
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
        value || (emptyValue && <span className="absolute inset-0 flex items-center justify-center">{emptyValue}</span>)
      )}
    </td>
  );
}
