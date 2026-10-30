import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import T5ParAnParActeTable from "../features/invoice/components/t5ParAnParActeTable";
import { initialT5ParAnParActeRowsMock } from "../features/invoice/mocks/t5ParAnParActe";
import type {
	T5ParAnParActeColumnKey,
	T5ParAnParActeRow,
} from "../features/invoice/types/t5ParAnParActe";

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
	const [rows, setRows] = useState<T5ParAnParActeRow[]>(initialT5ParAnParActeRowsMock);
	const navigate = useNavigate();

	function updateCell(
		rowId: number,
		key: T5ParAnParActeColumnKey,
		value: string | number,
	) {
		setRows((current) =>
			current.map((row) => (row.id === rowId ? { ...row, [key]: value } : row)),
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
				<T5ParAnParActeTable rows={rows} onCellChange={updateCell} />
			</section>
		</div>
	);
}
