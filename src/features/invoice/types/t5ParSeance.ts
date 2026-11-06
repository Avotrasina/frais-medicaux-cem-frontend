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

export type T5ParSeanceColumn = {
	key: T5ParSeanceColumnKey;
	label: string;
	width: string;
};

export type T5ParSeanceTableProps = {
	rows: T5ParSeanceRow[];
	focusRefSocial?: string;
	activeRowId?: number | null;
	canEditRows?: boolean;
	onCellChange: (
		rowId: number,
		key: Extract<T5ParSeanceColumnKey, "dateActe" | "libelle" | "montantActe">,
		value: string | number,
	) => void;
};
