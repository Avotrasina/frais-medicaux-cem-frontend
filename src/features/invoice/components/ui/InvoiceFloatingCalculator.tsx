import { useState } from "react";
import { Calculator, Copy, X } from "lucide-react";

function evaluateExpression(expression: string): number | null {
	let position = 0;

	function parseFactor(): number {
		if (expression[position] === "+") {
			position++;
			return parseFactor();
		}
		if (expression[position] === "-") {
			position++;
			return -parseFactor();
		}
		const match = expression.slice(position).match(/^(?:\d+\.?\d*|\.\d+)/);
		if (!match) throw new Error("Nombre attendu");
		position += match[0].length;
		return Number(match[0]);
	}

	function parseTerm(): number {
		let value = parseFactor();
		while (expression[position] === "*" || expression[position] === "/") {
			const operator = expression[position++];
			const nextValue = parseFactor();
			if (operator === "/" && nextValue === 0) throw new Error("Division par zéro");
			value = operator === "*" ? value * nextValue : value / nextValue;
		}
		return value;
	}

	function parseSum(): number {
		let value = parseTerm();
		while (expression[position] === "+" || expression[position] === "-") {
			const operator = expression[position++];
			const nextValue = parseTerm();
			value = operator === "+" ? value + nextValue : value - nextValue;
		}
		return value;
	}

	try {
		if (!expression) return null;
		const value = parseSum();
		return position === expression.length && Number.isFinite(value) ? value : null;
	} catch {
		return null;
	}
}

const numberFormatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 8 });
const keys = ["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "+", "="];

export default function InvoiceFloatingCalculator() {
	const [isOpen, setIsOpen] = useState(false);
	const [expression, setExpression] = useState("");
	const [result, setResult] = useState<number | null>(null);
	const [copied, setCopied] = useState(false);
	const [copyError, setCopyError] = useState(false);

	function pressKey(key: string) {
		setCopied(false);
		setCopyError(false);
		if (key === "C") {
			setExpression("");
			setResult(null);
			return;
		}
		if (key === "=") {
			const nextResult = evaluateExpression(expression);
			if (nextResult !== null) setResult(nextResult);
			return;
		}
		if (["+", "-", "*", "/"].includes(key)) {
			const currentExpression = result !== null ? String(result) : expression;
			if (!currentExpression && !["-", "+"].includes(key)) return;
			if (/[+\-*/]$/.test(currentExpression) && !["-", "+"].includes(key)) {
				setExpression(`${currentExpression.slice(0, -1)}${key}`);
			} else {
				setExpression(`${currentExpression}${key}`);
			}
			setResult(null);
			return;
		}
		const currentExpression = result !== null ? "" : expression;
		if (key === "." && currentExpression.match(/[\d.]+$/)?.[0].includes(".")) return;
		setExpression(`${currentExpression}${key === "." && (!currentExpression || /[+\-*/(]$/.test(currentExpression)) ? "0." : key}`);
		setResult(null);
	}

	function deleteLastCharacter() {
		const currentExpression = result !== null ? String(result) : expression;
		setExpression(currentExpression.slice(0, -1));
		setResult(null);
		setCopied(false);
		setCopyError(false);
	}

	async function copyResult() {
		if (result === null) return;
		try {
			await navigator.clipboard.writeText(String(result));
			setCopied(true);
			setCopyError(false);
		} catch {
			setCopyError(true);
			setCopied(false);
		}
	}

	return (
		<>
			{isOpen && (
				<section className="fixed bottom-28 right-8 z-30 w-72 rounded-xl border border-slate-200 bg-white p-4 text-slate-800 shadow-2xl" aria-label="Calculatrice">
					<header className="mb-3 flex items-center justify-between">
						<h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Calculator size={17} /> Calculatrice</h2>
						<button type="button" className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Fermer la calculatrice" onClick={() => setIsOpen(false)}><X size={17} /></button>
					</header>
					<div className="mb-3 flex min-h-16 flex-col items-end justify-center rounded-lg bg-slate-100 px-3 py-2 text-right">
						<div className="max-w-full truncate text-xs text-slate-500">{expression || "0"}</div>
						{result !== null && <div className="max-w-full truncate text-xl font-bold text-slate-900">{numberFormatter.format(result)}</div>}
					</div>
					<div className="mb-2 grid grid-cols-2 gap-2">
						<button type="button" className="h-9 rounded-lg bg-red-50 text-sm font-semibold text-red-700 hover:bg-red-100" onClick={() => pressKey("C")}>C</button>
						<button type="button" className="h-9 rounded-lg bg-slate-100 text-sm font-semibold text-slate-800 hover:bg-slate-200" aria-label="Effacer le dernier caractère" title="Effacer le dernier caractère" onClick={deleteLastCharacter}>⌫</button>
					</div>
					<div className="grid grid-cols-4 gap-2">
						{keys.map((key) => (
							<button
								key={key}
								type="button"
								className={`h-10 rounded-lg text-sm font-semibold transition ${key === "=" || ["+", "-", "*", "/"].includes(key) ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-slate-100 text-slate-800 hover:bg-slate-200"} ${key === "0" ? "col-span-2" : ""}`}
								onClick={() => pressKey(key)}
							>
								{key === "*" ? "×" : key === "/" ? "÷" : key}
							</button>
						))}
					</div>
					{result !== null && (
						<button type="button" className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={copyResult}>
							<Copy size={15} /> {copied ? "Copié" : copyError ? "Copie impossible" : "Copier le résultat"}
						</button>
					)}
				</section>
			)}
			<button
				type="button"
				className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300"
				aria-label={isOpen ? "Fermer la calculatrice" : "Ouvrir la calculatrice"}
				title="Calculatrice"
				aria-expanded={isOpen}
				onClick={() => setIsOpen((current) => !current)}
			>
				<Calculator size={23} />
			</button>
		</>
	);
}
