import { useState } from "react";
import { Check, X } from "lucide-react";

type Props = {
  value: string;
  isLocked?: boolean;
  placeholder?: string;
  className?: string;
  emptyValue?: string;
  onSave: (value: string) => void;
};

export default function EditableStringCell({
  value,
  isLocked = false,
  placeholder,
  className = "",
  emptyValue = "",
  onSave,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const startEditing = () => {
    if (isLocked || editing) return;
    setDraft(value);
    setEditing(true);
  };

  const commit = () => {
    onSave(draft);
    setEditing(false);
  };

  const cancel = () => setEditing(false);

  return (
    <td
      className={`relative h-full  max-w-20 cursor-pointer truncate px-3 text-xs hover:bg-slate-50 ${className}`}
      onClick={startEditing}
    >
      {editing ? (
        <>
          <input type="text"
            autoFocus
            className="h-full w-full pr-14"
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
