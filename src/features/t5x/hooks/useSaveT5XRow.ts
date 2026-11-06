import { useCallback } from "react";

type IdentifiedRow = { id: number };
type SaveRow<T extends IdentifiedRow> = (row: T) => Promise<T>;

export default function useSaveT5XRow<T extends IdentifiedRow>(
	createRow: SaveRow<T>,
	updateRow: SaveRow<T>,
) {
	return useCallback(
		(row: T, isNew: boolean) => (isNew ? createRow(row) : updateRow(row)),
		[createRow, updateRow],
	);
}
