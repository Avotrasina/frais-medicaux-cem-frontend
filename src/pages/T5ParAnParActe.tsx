import { useNavigate, useParams } from "react-router-dom";
import { useLookupLoading, useLookupResult } from "../components/layout/LookupContext";
import { ROUTES } from "../constants/routes";
import T5ParAnParActeTable from "../features/invoice/components/t5ParAnParActeTable";
import type {
	T5ParAnParActeRow,
} from "../features/invoice/types/t5ParAnParActe";
import useT5RowsByRefSocial from "../features/invoice/hooks/useT5RowsByRefSocial";
import { LoadingState } from "../components/ui";

function createEmptyParAnParActeRow(id: number, refSocial: string): T5ParAnParActeRow {
	return {
		id, refSocial, dateActe: "", libelle: "", montantActe: 0, depassementActe: 0,
		cumulActeConsomme: 0, soldePlafond: 0, depassementPlafond: 0,
		totalDepassement: 0, nomEtablissement: "",
	};
}

type Props = {
	title: string;
	plafondParAn: number;
	plafondParActe: number;
};

const amountFormatter = new Intl.NumberFormat("fr-FR", {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

export default function T5ParAnParActe({
	title,
	plafondParAn,
	plafondParActe,
}: Props) {
	const { label, refSocial } = useParams();
	const lookupResult = useLookupResult();
	const isLookupLoading = useLookupLoading();
	const { rows, isReady, updateCell } = useT5RowsByRefSocial(
		lookupResult?.t5Data.parAnParActe,
		refSocial,
		createEmptyParAnParActeRow,
	);
	const navigate = useNavigate();
	const pageTitle = label ?? title;

	return (
		<div className="flex h-[calc(100dvh-10rem)] min-h-[24rem] flex-col gap-2">
			<div className="relative">
				<h1 className="text-center text-2xl font-extrabold tracking-tight text-slate-900">
					{pageTitle}
				</h1>
				<button
					type="button"
					className="absolute right-0 top-0 inline-flex min-h-9 items-center justify-center rounded-lg border border-red-300 bg-gradient-to-r from-red-700 to-red-500 px-3 py-1 text-sm font-semibold text-white shadow-sm transition hover:from-red-800 hover:to-red-600"
					onClick={() => navigate(ROUTES.invoice)}
				>
					Quitter
				</button>
				<div className="mt-2 flex flex-wrap justify-center gap-2 text-sm">
					<span className="rounded-lg bg-yellow-300 px-4 py-2 font-semibold text-red-800">
						Plafond par an : {amountFormatter.format(plafondParAn)}
					</span>
					<span className="rounded-lg bg-yellow-300 px-4 py-2 font-semibold text-red-800">
						Plafond par acte : {amountFormatter.format(plafondParActe)}
					</span>
				</div>
			</div>
			<section className="panel flex min-h-0 flex-1 flex-col overflow-hidden">
				{isLookupLoading ? (
					<LoadingState message="Recherche de l’agent et chargement des données T5…" />
				) : !lookupResult ? (
					<div className="flex flex-1 items-center justify-center text-sm text-slate-500">Veuillez rechercher l’agent correspondant à cette référence.</div>
				) : !isReady ? (
					<LoadingState message="Chargement des données T5…" />
				) : (
					<T5ParAnParActeTable rows={rows} onCellChange={updateCell} focusRefSocial={refSocial} />
				)}
			</section>
		</div>
	);
}
