import { factureGlobaleColumns } from "../data/tableColumn";
import DropDownCell from "./dropDownCell";
import EditableDateCell from "./editableDateCell";
import EditableStringCell from "./editableStringcell";
import SummableNumberCell from "./summableCell";
import type {dropdownOptionType} from "../types/dropDown";
import {numberColumn,dateColumn} from "../types/invoiceTable";

import type {
	FactureGlobaleRow,
	FactureGlobaleTableProps
} from "../types/invoiceTable";


const DropDownMock : dropdownOptionType[] = [
	{id:1,label:"analyse"},
	{id:2,label:"chirurgie"}
]


function hasInvoiceData(row: FactureGlobaleRow): boolean {
	return factureGlobaleColumns.some(
		(column) => column.key !== "majT5" && row[column.key] !== "" && row[column.key] !== 0,
	);
}

export default function FactureGlobaleTable({
	rows,
	onCellChange,
}: FactureGlobaleTableProps) {
	return (
		<div className="min-h-0 flex-1 overflow-auto">
			<table className="h-fit w-max min-w-full table-fixed border-collapse text-sm">
				<thead className="sticky top-0 z-10 bg-slate-900 text-white">
					<tr>
						{factureGlobaleColumns.map((column) => (
							<th
								key={column.key}
								className={`border border-slate-700 px-3 py-3 text-left text-[10px] font-extrabold uppercase tracking-wide ${column.width} ${column.key === "majT5" ? "bg-yellow-300 text-red-800" : ""}`}
							>
								{column.label}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((row) => (
						<tr key={row.id} className="bg-white  h-15  text-slate-900 hover:bg-slate-50">
							{factureGlobaleColumns.map((column) => {
								const onSave = (nextValue: string) => onCellChange(row.id, column.key, nextValue);
								const cellClass = `border border-slate-200 px-2 py-2 ${column.width}`;

								if (column.key === "majT5") {
									return hasInvoiceData(row) ? (
										<DropDownCell key={column.key} options={DropDownMock} className={`${cellClass} bg-yellow-100 text-red-800`} />
									) : (
										<td key={column.key} className={`${cellClass} bg-yellow-100 text-red-800`} />
									);
								}
								const value = row[column.key];

								if ((Object.values(dateColumn) as string[]).includes(column.key)) {
									return (
										<EditableDateCell
											key={column.key}
											value={value as string}
											className={cellClass}
											onSave={onSave}
										/>
									);
								}

								if ((Object.values(numberColumn) as string[]).includes(column.key)) {
									return (
										<SummableNumberCell
											key={column.key}
											value={value as number}
											className={cellClass}
											onSave={(nextValue) => onSave(String(nextValue))}
										/>
									);
								}

								return (
									<EditableStringCell
										key={column.key}
										value={String(value)}
										className={cellClass}
										onSave={onSave}
									/>
								);
							})}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
