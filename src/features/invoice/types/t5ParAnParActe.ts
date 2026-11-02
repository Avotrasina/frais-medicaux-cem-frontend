export type T5ParAnParActeRow = {
	id: number;
	refSocial: string;
	dateActe: string;
	libelle: string;
	montantActe: number;
	depassementActe: number;
	cumulActeConsomme: number;
	soldePlafond: number;
	depassementPlafond: number;
	totalDepassement: number;
	nomEtablissement: string;
};

export type T5ParAnParActeColumnKey = Exclude<keyof T5ParAnParActeRow, "id">;

export type T5ParAnParActeColumn = {
	key: T5ParAnParActeColumnKey;
	label: string;
	width: string;
};

export type T5ParAnParActeTableProps = {
	rows: T5ParAnParActeRow[];
	onCellChange: (
		rowId: number,
		key: T5ParAnParActeColumnKey,
		value: string | number,
	) => void;
};
