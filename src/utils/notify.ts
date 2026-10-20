/**
 * Minimal toast bus.
 *
 * It lives outside the React tree so any module — service, helper, component —
 * can raise a notification without holding a hook. `ToastViewport` subscribes
 * to it and renders the messages.
 */

export type ToastKind = "success" | "error";

export interface ToastMessage {
	id: number;
	message: string;
	kind: ToastKind;
}

let sequence = 0;
const subscribers = new Set<(toast: ToastMessage) => void>();

/** Publishes a toast to every mounted viewport. */
export function notify(message: string, kind: ToastKind = "success"): void {
	const item: ToastMessage = { id: ++sequence, message, kind };
	subscribers.forEach((subscriber) => subscriber(item));
}

/** Subscribes a viewport; returns the unsubscribe function. */
export function subscribeToToasts(
	subscriber: (toast: ToastMessage) => void,
): () => void {
	subscribers.add(subscriber);
	return () => {
		subscribers.delete(subscriber);
	};
}
