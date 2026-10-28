import { CheckCircle2, X, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { subscribeToToasts, type ToastMessage } from "../../utils/notify";

/** Renders the notifications published through `notify()`. */
export function ToastViewport() {
	const [items, setItems] = useState<ToastMessage[]>([]);

	useEffect(() => {
		// Timers are tracked so unmounting the viewport does not leave a
		// callback pending on a gone component.
		const timers = new Set<number>();
		const unsubscribe = subscribeToToasts((item) => {
			setItems((current) => [...current, item]);
			const timer = window.setTimeout(() => {
				timers.delete(timer);
				setItems((current) => current.filter((t) => t.id !== item.id));
			}, 3500);
			timers.add(timer);
		});
		return () => {
			unsubscribe();
			timers.forEach((timer) => window.clearTimeout(timer));
			timers.clear();
		};
	}, []);

	return (
		<div
			className="fixed right-4 top-4 z-[100] flex w-[min(92vw,360px)] flex-col gap-2"
			aria-live="polite"
		>
			{items.map((item) => (
				<div
					key={item.id}
					className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xl"
				>
					{item.kind === "success" ? (
						<CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
					) : (
						<XCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
					)}
					<p className="flex-1 text-sm font-medium text-slate-700">
						{item.message}
					</p>
					<button
						aria-label="Fermer"
						onClick={() =>
							setItems((current) => current.filter((t) => t.id !== item.id))
						}
					>
						<X size={15} className="text-slate-400" />
					</button>
				</div>
			))}
		</div>
	);
}
