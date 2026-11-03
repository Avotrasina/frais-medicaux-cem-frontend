import { useState, type FormEvent, type ReactNode } from "react";
import { Bell, Menu, Search, X } from "lucide-react";
import type { IdpLookupResult } from "../../../../types/LookUp";
import { LookupLoadingContext, LookupResultContext } from "../../context/LookupContext";
import logo from "../../../../assets/logo.jpg";



type Props = {
	children: ReactNode;
	onSearchIdp: (idp: string) => Promise<IdpLookupResult>;
};

export default function LookupLayout({
	children,
	onSearchIdp,
}: Props) {
	const [mobileOpen, setMobileOpen] = useState(false);
	const [idp, setIdp] = useState("");
	const [lookupResult, setLookupResult] = useState<IdpLookupResult | null>(null);
	const [idpError, setIdpError] = useState<string | null>(null);
	const [idpLoading, setIdpLoading] = useState(false);

	async function submitIdp(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const query = idp.trim();
		if (!query) return;
		setIdpLoading(true);
		setIdpError(null);
		setLookupResult(null);
		try {
			setLookupResult(await onSearchIdp(query));
		} catch (error) {
			setLookupResult(null);
			setIdpError(error instanceof Error ? error.message : "Recherche IDP impossible.");
		} finally {
			setIdpLoading(false);
		}
	}

	return (
		<div className="min-h-screen bg-slate-50">
			{mobileOpen && (
				<div
					className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
					onClick={() => setMobileOpen(false)}
				/>
			)}
			<aside
				className={`fixed inset-y-0 left-0 z-40 flex w-[300px] flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
			>
				<div className="flex h-20 shrink-0 items-center border-b border-slate-100 px-5">
					<img
						src={logo}
						alt="Caisse d'Épargne de Madagascar"
						className="h-10 w-auto max-w-[185px] object-contain object-left"
					/>
					<button
						type="button"
						className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
						onClick={() => setMobileOpen(false)}
						aria-label="Fermer le panneau"
					>
						<X size={18} />
					</button>
				</div>

				<div className="flex-1 space-y-5 overflow-y-auto p-4">
					<LookupSection
						title="Informations IDP"
						searchLabel="IDP"
						searchValue={idp}
						setSearchValue={setIdp}
						onSubmit={submitIdp}
						loading={idpLoading}
						error={idpError}
					>
						<InfoField label="Nom" value={lookupResult?.agent.nom} />
						<InfoField label="Prénom" value={lookupResult?.agent.prenom} />
						<InfoField label="Code famille" value={lookupResult?.agent.codeFam} />
						<InfoField label="Observation IDP" value={lookupResult?.agent.observationIdp} />
					</LookupSection>

					<section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
						<h2 className="mb-3 text-xs font-extrabold uppercase tracking-wide text-slate-700">Informations matricule</h2>
						<div className="space-y-2">
							<InfoField label="Matricule" value={lookupResult?.agent.matricule} />
							<InfoField label="Nom" value={lookupResult?.agent.nom} />
							<InfoField label="Prénom" value={lookupResult?.agent.prenom} />
							<InfoField label="Back-office / Front-office" value={lookupResult?.agent.backOfficeFrontOffice} />
							<InfoField label="Direction" value={lookupResult?.agent.direction} />
							<InfoField label="Agence / Service" value={lookupResult?.agent.agenceService} />
						</div>
					</section>
				</div>
			</aside>

			<div className="min-h-screen lg:pl-[300px]">
				<header className="sticky top-0 z-20 flex h-20 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-6">
					<button
						type="button"
						className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
						onClick={() => setMobileOpen(true)}
						aria-label="Ouvrir le panneau de recherche"
					>
						<Menu size={21} />
					</button>
					<div className="hidden items-center gap-2 text-xs text-slate-400 md:flex">
						<span>Frais médicaux</span>
						<span>/</span>
						<span className="font-bold text-slate-700">Recherche</span>
					</div>
					<div className="ml-auto flex items-center gap-2">
						<div className="hidden h-10 w-72 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 md:flex">
							<Search size={16} className="text-slate-400" />
							<input
								className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
								placeholder="Rechercher…"
							/>
						</div>
						<button type="button" className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100" aria-label="Notifications">
							<Bell size={19} />
						</button>
						<span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-xs font-extrabold text-red-700">AR</span>
					</div>
				</header>
				<LookupLoadingContext.Provider value={idpLoading}>
					<LookupResultContext.Provider value={lookupResult}>
						<main className="mx-auto w-full max-w-[1600px] p-4 md:p-6 lg:p-8">
							{children}
						</main>
					</LookupResultContext.Provider>
				</LookupLoadingContext.Provider>
			</div>
		</div>
	);
}

function LookupSection({
	title,
	searchLabel,
	searchValue,
	setSearchValue,
	onSubmit,
	loading,
	error,
	children,
}: {
	title: string;
	searchLabel: string;
	searchValue: string;
	setSearchValue: (value: string) => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	loading: boolean;
	error: string | null;
	children: ReactNode;
}) {
	return (
		<section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
			<h2 className="mb-3 text-xs font-extrabold uppercase tracking-wide text-slate-700">{title}</h2>
			<form className="mb-3 flex items-end gap-2" onSubmit={onSubmit}>
				<label className="min-w-0 flex-1">
					<span className="label">{searchLabel}</span>
					<input
						className="field min-w-0"
						type="text"
						value={searchValue}
						required
						onChange={(event) => setSearchValue(event.target.value)}
					/>
				</label>
				<button className="btn-primary min-h-[2.75rem] shrink-0 px-3" type="submit" disabled={loading}>
					<Search size={16} />
					<span className="text-xs">{loading ? "Recherche…" : "Chercher"}</span>
				</button>
			</form>
			{error && <p className="mb-3 text-xs text-red-700" role="alert">{error}</p>}
			<div className="space-y-2">{children}</div>
		</section>
	);
}

function InfoField({ label, value }: { label: string; value?: string | null }) {
	const isEmpty = !value?.trim();

	return (
		<div>
			<label className="mb-1 block text-[11px] font-semibold text-slate-500">{label}</label>
			<input
				className={`field min-h-9 bg-slate-50 text-sm ${isEmpty ? "text-center placeholder:text-slate-400" : ""}`}
				value={value ?? ""}
				placeholder={isEmpty ? "—" : ""}
				readOnly
				aria-label={label}
			/>
		</div>
	);
}
