import { useCallback } from "react";

type IdentifiedRow = { id: number };
type SaveRow<T> = (row: T, originalRow: T | null) => Promise<T>;

export default function useSaveT5XRow<T extends IdentifiedRow>(
	createRow: SaveRow<T>,
	updateRow: SaveRow<T>,
) {
	return useCallback(
		(row: T, originalRow: T | null, isNew: boolean) =>
			isNew ? createRow(row, null) : updateRow(row, originalRow),
		[createRow, updateRow],
	);
}
