import { useMemo } from "react";

export default function useT5XAddRowValues(row: Record<string, unknown> | undefined) {
	const filledCells = useMemo(() => {
		const result: Record<string, boolean> = {};
		for (const [key, value] of Object.entries(row ?? {})) {
			if (key === "id") continue;
			result[key] = typeof value === "string"
				? value.trim().length > 0
				: typeof value === "number" && value !== 0;
		}
		return result;
	}, [row]);

	return {
		filledCells,
		hasAnyValue: Object.values(filledCells).some(Boolean),
		isCellFilled: (key: string) => Boolean(filledCells[key]),
	};
}
