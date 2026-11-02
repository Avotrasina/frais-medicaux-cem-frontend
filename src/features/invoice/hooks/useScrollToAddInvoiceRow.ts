import { useCallback, useEffect, useRef } from "react";

export default function useScrollToAddInvoiceRow(isLoaded: boolean) {
	const containerRef = useRef<HTMLDivElement>(null);
	const addRowRef = useRef<HTMLTableRowElement>(null);

	useEffect(() => {
		if (!isLoaded || !containerRef.current) return;
		containerRef.current.scrollTop = containerRef.current.scrollHeight;
		addRowRef.current?.focus({ preventScroll: true });
	}, [isLoaded]);

	const focusAddRow = useCallback(() => {
		const row = addRowRef.current;
		if (!row) return;
		row.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
		window.setTimeout(() => row.focus({ preventScroll: true }), 250);
	}, []);

	return { containerRef, addRowRef, focusAddRow };
}
