export type T5ParAnRow = {
	id: number;
	refSocial: string;
	dateActe: string;
	libelle: string;
	montantActe: number;
	montantCumule: number | null;
	soldePlafond: number | null;
	montantDepassement: number | null;
	nomEtablissement: string;
};

export type T5ParAnColumnKey = Exclude<keyof T5ParAnRow, "id">;

export type T5ParAnColumn = {
	key: T5ParAnColumnKey;
	label: string;
	width: string;
};

export type T5ParAnTableProps = {
	rows: T5ParAnRow[];
	focusRefSocial?: string;
	onCellChange: (
		rowId: number,
		key: T5ParAnColumnKey,
		value: string | number,
	) => void;
};
