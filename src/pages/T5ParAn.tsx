import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { ROUTES } from "../constants/routes";
import T5ParAnTable from "../features/invoice/components/t5ParAnTable";
import type { T5ParAnColumnKey, T5ParAnRow } from "../features/invoice/types/t5ParAn";
import { initialT5ParAnRowsMock } from "../features/invoice/mocks/t5ParAn";

type Props = {
	title: string;
	plafond: number;
};

const moneyFormatter = new Intl.NumberFormat("fr-FR", {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

export default function T5ParAn({ title, plafond }: Props) {
	const [rows, setRows] = useState<T5ParAnRow[]>(initialT5ParAnRowsMock);
	const navigate = useNavigate();

	function updateCell(rowId: number, key: T5ParAnColumnKey, value: string | number) {
		setRows((current) =>
			current.map((row) =>
				row.id === rowId ? { ...row, [key]: value } : row,
			),
		);
	}

	return (
		<div className="flex h-[calc(100dvh-10rem)] min-h-[24rem] flex-col gap-2">
			<div className="relative">
				<h1 className="text-center text-2xl font-extrabold tracking-tight text-slate-900">
					{title}
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
						Plafond fixé : {moneyFormatter.format(plafond)}
					</span>
				</p>
			</div>
			<section className="panel flex min-h-0 flex-1 flex-col overflow-hidden">
				<T5ParAnTable rows={rows} onCellChange={updateCell} />
			</section>
			<div className="fixed bottom-12 right-8 z-20">
				<button
					type="button"
					className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-200"
					onClick={() => {}}
					aria-label="Ajouter une ligne"
				>
					<Plus size={26} />
				</button>
			</div>
		</div>
	);
}
