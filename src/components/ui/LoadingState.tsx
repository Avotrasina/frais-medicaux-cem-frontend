import { Loader2 } from "lucide-react";

type Props = {
	message: string;
};

export default function LoadingState({ message }: Props) {
	return (
		<div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 text-center text-sm text-slate-500" role="status" aria-live="polite">
			<Loader2 size={30} className="animate-spin text-red-600" aria-hidden="true" />
			<span>{message}</span>
		</div>
	);
}
