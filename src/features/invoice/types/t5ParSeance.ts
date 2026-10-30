export type T5ParSeanceRow = {
	id: number;
	refSocial: string;
	dateActe: string;
	libelle: string;
	montantActe: number;
	numeroSeance: string;
	montantDepassement: number;
	nomEtablissement: string;
};

export type T5ParSeanceColumnKey = Exclude<keyof T5ParSeanceRow, "id">;

export type T5ParSeanceTableProps = {
	rows: T5ParSeanceRow[];
	onCellChange: (
		rowId: number,
		key: T5ParSeanceColumnKey,
		value: string | number,
	) => void;
};
