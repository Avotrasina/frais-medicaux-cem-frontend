import { useCallback, useRef, useState } from "react";
import type { T6CellValue, T6ColumnKey, T6Row } from "../types/t6Row";

export type T6AutofillUpdateCell = (rowId: number, key: T6ColumnKey, value: T6CellValue) => void;
type Lookup = (value: string) => Promise<T6Row | undefined>;

export default function useT6Autofill(
	targetKeys: readonly T6ColumnKey[],
	lookup: Lookup,
	updateCell: T6AutofillUpdateCell,
) {
	const [loadingCells, setLoadingCells] = useState<ReadonlySet<string>>(() => new Set());
	const [error, setError] = useState<string | null>(null);
	const requestIds = useRef(new Map<number, number>());
	const nextRequestId = useRef(0);

	const fill = useCallback(async (rowId: number, value: string) => {
		const requestId = ++nextRequestId.current;
		requestIds.current.set(rowId, requestId);
		setError(null);
		setLoadingCells((current) => new Set([
			...current,
			...targetKeys.map((key) => `${rowId}:${key}`),
		]));

		try {
			const matchedRow = await lookup(value);
			if (requestIds.current.get(rowId) !== requestId) return;
			for (const key of targetKeys) {
				updateCell(rowId, key, matchedRow?.[key] ?? "");
			}
		} catch (reason) {
			if (requestIds.current.get(rowId) === requestId) {
				setError(reason instanceof Error ? reason.message : "Le chargement des données associées a échoué.");
			}
		} finally {
			if (requestIds.current.get(rowId) === requestId) {
				requestIds.current.delete(rowId);
				setLoadingCells((current) => {
					const next = new Set(current);
					for (const key of targetKeys) next.delete(`${rowId}:${key}`);
					return next;
				});
			}
		}
	}, [lookup, targetKeys, updateCell]);

	const cancelRow = useCallback((rowId: number) => {
		requestIds.current.delete(rowId);
		setLoadingCells((current) => {
			const next = new Set(current);
			for (const key of targetKeys) next.delete(`${rowId}:${key}`);
			return next;
		});
	}, [targetKeys]);

	return { fill, cancelRow, loadingCells, error };
}
