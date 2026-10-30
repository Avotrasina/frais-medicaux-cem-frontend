import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import T5ParSeanceTable from "../features/invoice/components/t5ParSeanceTable";
import { initialT5ParSeanceRowsMock } from "../features/invoice/mocks/t5ParSeance";
import type {
	T5ParSeanceColumnKey,
	T5ParSeanceRow,
} from "../features/invoice/types/t5ParSeance";

type Props = {
	title: string;
	nombreSeance: number;
};

export default function T5ParSeance({ title, nombreSeance }: Props) {
	const [rows, setRows] = useState<T5ParSeanceRow[]>(initialT5ParSeanceRowsMock);
	const navigate = useNavigate();

	function updateCell(
		rowId: number,
		key: T5ParSeanceColumnKey,
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
				<p className="mt-2 text-center">
					<span className="inline-block rounded-lg bg-yellow-300 px-4 py-2 text-sm font-semibold text-red-800">
						Nombre de séances : {nombreSeance}
					</span>
				</p>
			</div>
			<section className="panel flex min-h-0 flex-1 flex-col overflow-hidden">
				<T5ParSeanceTable rows={rows} onCellChange={updateCell} />
			</section>
		</div>
	);
}
