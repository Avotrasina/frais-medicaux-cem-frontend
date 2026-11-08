import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import type { Prestataire } from "../../types/prestataire";

type Props = {
	options: Prestataire[];
	value: string;
	className?: string;
	isLocked?: boolean;
	onSelect: (prestataire: Prestataire) => void;
};

export default function PrestataireDropdownCell({
	options,
	value,
	className = "",
	isLocked = false,
	onSelect,
}: Props) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => () => {
		if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
	}, []);

	function cancelClose() {
		if (!closeTimeoutRef.current) return;
		clearTimeout(closeTimeoutRef.current);
		closeTimeoutRef.current = null;
	}

	function scheduleClose() {
		cancelClose();
		closeTimeoutRef.current = setTimeout(() => {
			setOpen(false);
			closeTimeoutRef.current = null;
		}, 150);
	}

	const filteredOptions = useMemo(() => {
		const query = search.trim().toLocaleLowerCase("fr");
		if (!query) return options;
		return options.filter((option) =>
			`${option.nomEtablissement} ${option.localite}`.toLocaleLowerCase("fr").includes(query),
		);
	}, [options, search]);

	function selectPrestataire(prestataire: Prestataire) {
		onSelect(prestataire);
		setSearch("");
		setOpen(false);
	}

	return (
		<td className={`relative px-2 py-2 ${className} ${isLocked ? "cursor-not-allowed bg-slate-100 text-slate-400" : ""}`}>
			<button
				type="button"
				disabled={isLocked}
				className="flex w-full items-center justify-between gap-2 text-left disabled:cursor-not-allowed"
				aria-label="Sélectionner un établissement"
				aria-haspopup="listbox"
				aria-expanded={open}
				onClick={() => setOpen((current) => !current)}
				onMouseEnter={cancelClose}
				onMouseLeave={scheduleClose}
			>
				<span className="truncate">{value || "Sélectionner un établissement"}</span>
				<ChevronDown size={14} className="shrink-0 text-slate-500" />
			</button>

			{open && !isLocked && (
				<div
					className="absolute left-0 top-full z-30 w-80 max-w-[calc(100vw-2rem)] rounded-md border border-slate-200 bg-white p-2 text-slate-800 shadow-xl"
					onClick={(event) => event.stopPropagation()}
					onMouseEnter={cancelClose}
					onMouseLeave={scheduleClose}
				>
					<label className="flex items-center gap-2 rounded-md border border-slate-300 px-2">
						<Search size={14} className="shrink-0 text-slate-400" />
						<input
							autoFocus
							type="search"
							value={search}
							placeholder="Rechercher un établissement…"
							aria-label="Rechercher un prestataire"
							className="min-w-0 flex-1 py-2 text-xs outline-none"
							onChange={(event) => setSearch(event.target.value)}
							onKeyDown={(event) => {
								if (event.key === "Escape") setOpen(false);
								if (event.key === "Enter" && filteredOptions[0]) {
									event.preventDefault();
									selectPrestataire(filteredOptions[0]);
								}
							}}
						/>
					</label>
					<ul role="listbox" className="mt-1 max-h-56 overflow-y-auto">
						{filteredOptions.length > 0 ? filteredOptions.map((option) => (
							<li key={option.id} role="option" aria-selected={option.nomEtablissement === value}>
								<button
									type="button"
									className="w-full rounded px-2 py-2 text-left text-xs hover:bg-slate-100"
									onClick={() => selectPrestataire(option)}
								>
									{option.nomEtablissement}
								</button>
							</li>
						)) : (
							<li className="px-2 py-3 text-center text-xs text-slate-500">
								Aucun prestataire trouvé.
							</li>
						)}
					</ul>
				</div>
			)}
		</td>
	);
}
