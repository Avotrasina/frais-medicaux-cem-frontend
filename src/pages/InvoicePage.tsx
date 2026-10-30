
import { useState } from "react";
import { FactureGlobaleTable, initialFactureGlobaleRows } from "../features/invoice";
import type { FactureGlobaleColumnKey } from "../features/invoice";
import { PageHeader, ToastViewport } from "../components/ui";

export default function FactureGlobalePage() {
	const [rows, setRows] = useState(initialFactureGlobaleRows);

	function updateCell(
		rowId: number,
		key: FactureGlobaleColumnKey,
		value: string,
	) {
		setRows((current) =>
			current.map((row) =>
				row.id === rowId ? { ...row, [key]: value } : row,
			),
		);
	}

	return (
		<>
			<ToastViewport />
			<div className="flex h-[calc(100dvh-13rem)] min-h-[24rem] flex-col lg:h-[calc(100dvh-14rem)]">
				<PageHeader
					title="Factures globales"
					description="Suivi des factures, des montants pris en charge et de leur circuit de validation. Cliquez sur une cellule pour la modifier."
				/>
				<section className="panel flex min-h-0 flex-1 flex-col overflow-hidden">
					<FactureGlobaleTable
						rows={rows}
						onCellChange={updateCell}
					/>
				</section>
			</div>
		</>
	);
}
