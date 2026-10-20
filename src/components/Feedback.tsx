import { AlertTriangle, Info, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

/** Inline status blocks shared by every management screen. */

export function LoadingBlock({ label = "Chargement…" }: { label?: string }) {
	return (
		<div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
			<Loader2 size={16} className="animate-spin text-slate-400" />
			{label}
		</div>
	);
}

export function ErrorBlock({
	message,
	onRetry,
	children,
}: {
	message: string;
	onRetry?: () => void;
	children?: ReactNode;
}) {
	return (
		<div className="flex flex-wrap items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
			<AlertTriangle size={17} className="mt-0.5 shrink-0 text-red-600" />
			<div className="min-w-0 flex-1">
				<p className="text-sm font-semibold text-red-800">{message}</p>
				{children}
			</div>
			{onRetry && (
				<button className="btn-secondary" onClick={onRetry}>
					Réessayer
				</button>
			)}
		</div>
	);
}

export function InfoBlock({
	message,
	children,
}: {
	message: string;
	children?: ReactNode;
}) {
	return (
		<div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
			<Info size={17} className="mt-0.5 shrink-0 text-amber-600" />
			<div className="min-w-0 flex-1">
				<p className="text-sm text-amber-900">{message}</p>
				{children}
			</div>
		</div>
	);
}
