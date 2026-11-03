import { useCallback, useEffect, useRef } from "react";

export type T5XTableKey = "categories" | "acts";

export default function useScrollToT5XAddRow(isLoaded: boolean, activeTable: T5XTableKey, addRowId: number) {
	const categoriesContainerRef = useRef<HTMLDivElement>(null);
	const categoriesAddRowRef = useRef<HTMLTableRowElement>(null);
	const actsContainerRef = useRef<HTMLDivElement>(null);
	const actsAddRowRef = useRef<HTMLTableRowElement>(null);

	const getRefs = useCallback((table: T5XTableKey) => table === "categories"
		? { container: categoriesContainerRef.current, row: categoriesAddRowRef.current }
		: { container: actsContainerRef.current, row: actsAddRowRef.current }, []);

	const focusAddRow = useCallback((table: T5XTableKey = activeTable) => {
		const { row } = getRefs(table);
		if (!row) return;
		row.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
		window.setTimeout(() => row.focus({ preventScroll: true }), 250);
	}, [activeTable, addRowId, getRefs]);

	useEffect(() => {
		if (!isLoaded) return;
		const { container, row } = getRefs(activeTable);
		if (!container || !row) return;
		container.scrollTop = container.scrollHeight;
		row.focus({ preventScroll: true });
	}, [activeTable, addRowId, getRefs, isLoaded]);

	return {
		categoriesContainerRef,
		categoriesAddRowRef,
		actsContainerRef,
		actsAddRowRef,
		focusAddRow,
	};
}
