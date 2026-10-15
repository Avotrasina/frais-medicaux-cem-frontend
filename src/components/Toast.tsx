import { CheckCircle2, X, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

type ToastMessage = { id: number; message: string; kind: "success" | "error" };
let sequence = 0;
const subscribers = new Set<(toast: ToastMessage) => void>();

export function notify(message: string, kind: ToastMessage["kind"] = "success") {
  const item = { id: ++sequence, message, kind };
  subscribers.forEach((subscriber) => subscriber(item));
}

export function ToastViewport() {
  const [items, setItems] = useState<ToastMessage[]>([]);
  useEffect(() => {
    const subscriber = (item: ToastMessage) => {
      setItems((current) => [...current, item]);
      window.setTimeout(() => setItems((current) => current.filter((toast) => toast.id !== item.id)), 3500);
    };
    subscribers.add(subscriber);
    return () => { subscribers.delete(subscriber); };
  }, []);
  return <div className="fixed right-4 top-4 z-[100] flex w-[min(92vw,360px)] flex-col gap-2" aria-live="polite">
    {items.map((item) => <div key={item.id} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
      {item.kind === "success" ? <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600"/> : <XCircle size={18} className="mt-0.5 shrink-0 text-red-600"/>}
      <p className="flex-1 text-sm font-medium text-slate-700">{item.message}</p>
      <button aria-label="Fermer" onClick={() => setItems((current) => current.filter((toast) => toast.id !== item.id))}><X size={15} className="text-slate-400"/></button>
    </div>)}
  </div>;
}
