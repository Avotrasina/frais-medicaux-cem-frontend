import { useNavigate, useParams } from "react-router-dom";
import { useLookupLoading, useLookupResult } from "../features/invoice/context/LookupContext";
import { ROUTES } from "../constants/routes";
import T5ParSeanceTable from "../features/invoice/components/ui/t5ParSeanceTable";
import T5RowActions from "../features/invoice/components/ui/T5RowActions";
import type {
	T5ParSeanceRow,
} from "../features/invoice/types/t5ParSeance";
import useT5RowsByRefSocial from "../features/invoice/hooks/useT5RowsByRefSocial";
import useT5Configuration from "../features/invoice/hooks/useT5Configuration";
import { ErrorBlock, LoadingState } from "../components/ui";

function createEmptyParSeanceRow(id: number, refSocial: string): T5ParSeanceRow {
	return {
		id, refSocial, dateActe: "", libelle: "", montantActe: 0, numeroSeance: "",
		montantDepassement: 0, nomEtablissement: "",
	};
}

export default function T5ParSeance() {
	const { id, label, refSocial } = useParams();
	const { configuration, isLoading: isConfigurationLoading, error: configurationError } = useT5Configuration(id);
	const lookupResult = useLookupResult();
	const isLookupLoading = useLookupLoading();
	const {
		rows,
		isReady,
		activeRowId,
		canSave,
		isSaving,
		saveError,
		updateCell,
		saveActiveRow,
		resetActiveRow,
	} = useT5RowsByRefSocial(
		lookupResult?.t5Data.parSeance,
		refSocial,
		createEmptyParSeanceRow,
		"parSeance",
	);
	const navigate = useNavigate();
	if (isConfigurationLoading) return <LoadingState message="Chargement de la configuration T5…" />;
	if (configurationError) return <ErrorBlock message={configurationError} />;
	if (configuration?.kind !== "parSeance") {
		return <ErrorBlock message="La configuration chargée ne correspond pas à un T5 par séance." />;
	}
	const pageTitle = label ?? configuration.title;

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
				<p className="mt-2 text-center">
					<span className="inline-block rounded-lg bg-yellow-300 px-4 py-2 text-sm font-semibold text-red-800">
						Nombre de séances : {configuration.nombreSeance}
					</span>
				</p>
			</div>
			<section className="panel flex min-h-0 flex-1 flex-col overflow-hidden">
				{isLookupLoading ? (
					<LoadingState message="Recherche de l’agent et chargement des données T5…" />
				) : !lookupResult ? (
					<div className="flex flex-1 items-center justify-center text-sm text-slate-500">Veuillez rechercher l’agent correspondant à cette référence.</div>
				) : !isReady ? (
					<LoadingState message="Chargement des données T5…" />
				) : (
					<>
						{saveError && <ErrorBlock message={saveError} />}
						<T5ParSeanceTable
							rows={rows}
							onCellChange={updateCell}
							focusRefSocial={refSocial}
							activeRowId={activeRowId}
						/>
					</>
				)}
			</section>
			{isReady && (
				<T5RowActions
					canSave={canSave}
					hasActiveRow={activeRowId !== null}
					isSaving={isSaving}
					onSave={saveActiveRow}
					onReset={resetActiveRow}
				/>
			)}
		</div>
	);
}
