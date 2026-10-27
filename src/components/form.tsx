import { useId, type ChangeEvent, type ReactNode } from "react";
import { IMAGE_ACCEPT } from "../utils/image";

/**
 * Form primitives shared by the management screens.
 * They rely on the design tokens declared in `index.css` (`.label`, `.field`)
 * so every form of the application stays visually identical.
 */

export interface SelectOption {
	value: string;
	label: string;
}

interface BaseProps {
	label: string;
	required?: boolean;
	disabled?: boolean;
	hint?: ReactNode;
	className?: string;
}

export function TextField({
	label,
	value,
	onChange,
	type = "text",
	required = false,
	disabled = false,
	hint,
	placeholder,
	min,
	maxLength,
	className = "",
}: BaseProps & {
	value: string;
	onChange: (value: string) => void;
	type?: "text" | "date" | "number" | "email" | "tel";
	placeholder?: string;
	min?: string;
	maxLength?: number;
}) {
	const id = useId();
	return (
		<div className={className}>
			<label className="label" htmlFor={id}>
				{label}
				{required && <span className="text-red-600"> *</span>}
			</label>
			<input
				id={id}
				className="field"
				type={type}
				value={value}
				placeholder={placeholder}
				min={min}
				maxLength={maxLength}
				required={required}
				disabled={disabled}
				onChange={(event: ChangeEvent<HTMLInputElement>) =>
					onChange(event.target.value)
				}
			/>
			{hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
		</div>
	);
}

export function SelectField({
	label,
	value,
	onChange,
	options,
	placeholder = "-- Sélectionner --",
	required = false,
	disabled = false,
	hint,
	className = "",
}: BaseProps & {
	value: string;
	onChange: (value: string) => void;
	options: SelectOption[];
	/** Pass an empty string for an enum select that must always hold a value. */
	placeholder?: string;
}) {
	const id = useId();
	return (
		<div className={className}>
			<label className="label" htmlFor={id}>
				{label}
				{required && <span className="text-red-600"> *</span>}
			</label>
			<select
				id={id}
				className="field"
				value={value}
				required={required}
				disabled={disabled}
				onChange={(event: ChangeEvent<HTMLSelectElement>) =>
					onChange(event.target.value)
				}
			>
				{placeholder !== "" && <option value="">{placeholder}</option>}
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
			{hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
		</div>
	);
}

export function TextAreaField({
	label,
	value,
	onChange,
	required = false,
	disabled = false,
	hint,
	rows = 3,
	className = "",
}: BaseProps & {
	value: string;
	onChange: (value: string) => void;
	rows?: number;
}) {
	const id = useId();
	return (
		<div className={className}>
			<label className="label" htmlFor={id}>
				{label}
				{required && <span className="text-red-600"> *</span>}
			</label>
			<textarea
				id={id}
				className="field"
				rows={rows}
				value={value}
				required={required}
				disabled={disabled}
				onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
					onChange(event.target.value)
				}
			/>
			{hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
		</div>
	);
}


export function FileField({
  label,
  file,
  onFile,
  required = false,
  disabled = false,
  hint,
  className = "",
  accept = IMAGE_ACCEPT,
}: BaseProps & {
  file: File | null;
  onFile: (file: File | null) => void;
  accept?: string;
}) {
  const id = useId();

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0] ?? null;

    // Vérifier le type MIME et l'extension du fichier.
    if (
      selectedFile &&
      accept === "application/pdf" &&
      selectedFile.type !== "application/pdf" &&
      !selectedFile.name.toLowerCase().endsWith(".pdf")
    ) {
      onFile(null);
      event.target.value = "";
      return;
    }

    onFile(selectedFile);
  }

  return (
    <div className={className}>
      <label className="label" htmlFor={id}>
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>

      <input
        id={id}
        className="field"
        type="file"
        accept={accept}
        required={required && !file}
        disabled={disabled}
        onChange={handleFileChange}
      />

      <p className="mt-1 text-xs text-slate-400">
        {hint ??
          (accept === "application/pdf"
            ? "Fichier PDF uniquement."
            : "JPEG, PNG ou WEBP — 2 Mo maximum.")}
      </p>
    </div>
  );
}

