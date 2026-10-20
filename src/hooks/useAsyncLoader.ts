import { useEffect } from "react";

/**
 * Runs an asynchronous loader on mount, and again whenever the loader identity
 * changes — i.e. when one of its `useCallback` dependencies changed, such as the
 * active filter or the search term of a screen.
 *
 * Wrap the loader in `useCallback`: it is the single dependency of the effect,
 * which is what makes the re-run condition explicit.
 *
 * The loader receives an `isStale` predicate. A run is stale as soon as the
 * effect is cleaned up — because a dependency changed or the component
 * unmounted — which happens *before* the replacement run starts. A loader must
 * therefore check `isStale()` after every `await` and bail out before writing
 * state, so a slow response can never overwrite a newer one.
 *
 * The loader is started from a microtask rather than straight from the effect
 * body, so the state it updates never changes during the commit phase.
 */
export function useAsyncLoader(
	loader: (isStale: () => boolean) => Promise<void>,
): void {
	useEffect(() => {
		let cancelled = false;
		void (async () => {
			await Promise.resolve();
			if (cancelled) return;
			await loader(() => cancelled);
		})();
		return () => {
			cancelled = true;
		};
	}, [loader]);
}
