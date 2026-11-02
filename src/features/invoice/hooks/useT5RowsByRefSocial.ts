import { useCallback, useEffect, useState } from "react";

type ReferencedRow = { id: number; refSocial: string };
type RowKey<T> = Exclude<keyof T, "id">;

export default function useT5RowsByRefSocial<T extends ReferencedRow>(
	sourceRows: T[] | undefined,
	refSocial: string | undefined,
	createEmptyRow: (id: number, refSocial: string) => T,
) {
	const [rows, setRows] = useState<T[]>([]);
	const [loadedSource, setLoadedSource] = useState<{ rows: T[]; refSocial: string } | null>(null);

	useEffect(() => {
		if (!sourceRows || !refSocial) {
			setRows([]);
			setLoadedSource(null);
			return;
		}

		const loadedRows = sourceRows.map((row) => ({ ...row }));
		if (!loadedRows.some((row) => row.refSocial === refSocial)) {
			const nextId = Math.max(0, ...loadedRows.map((row) => row.id)) + 1;
			loadedRows.push(createEmptyRow(nextId, refSocial));
		}

		setRows(loadedRows);
		setLoadedSource({ rows: sourceRows, refSocial });
	}, [sourceRows, refSocial, createEmptyRow]);

	const updateCell = useCallback((rowId: number, key: RowKey<T>, value: string | number) => {
		setRows((current) => current.map((row) =>
			row.id === rowId ? { ...row, [key]: value } as T : row,
		));
	}, []);

	const isReady = Boolean(loadedSource && loadedSource.rows === sourceRows && loadedSource.refSocial === refSocial);
	return { rows: isReady ? rows : [], isReady, updateCell };
}
