import { useCallback, useRef, useState } from "react";
import { useAsyncLoader } from "../../../hooks/useAsyncLoader";
import { fetchT5ConfigurationMock } from "../mocks/t5Configuration";
import type { T5Configuration } from "../types/t5Configuration";

type ConfigurationState = {
	requestId: string | undefined | null;
	configuration: T5Configuration | null;
	error: string | null;
};

export default function useT5Configuration(id: string | undefined) {
	const [state, setState] = useState<ConfigurationState>({
		requestId: null,
		configuration: null,
		error: null,
	});
	const requestRef = useRef(0);

	const load = useCallback(
		async (isStale: () => boolean) => {
			const request = ++requestRef.current;
			try {
				const result = await fetchT5ConfigurationMock(id);
				if (isStale() || request !== requestRef.current) return;
				setState({ requestId: id, configuration: result, error: null });
			} catch (cause) {
				if (isStale() || request !== requestRef.current) return;
				setState({
					requestId: id,
					configuration: null,
					error:
						cause instanceof Error
							? cause.message
							: "Impossible de charger la configuration T5.",
				});
			}
		},
		[id],
	);

	useAsyncLoader(load);

	const reload = useCallback(async () => {
		setState({ requestId: null, configuration: null, error: null });
		await load(() => false);
	}, [load]);

	const isCurrentRequest = state.requestId === id;
	return {
		configuration: isCurrentRequest ? state.configuration : null,
		isLoading: !isCurrentRequest,
		error: isCurrentRequest ? state.error : null,
		reload,
	};
}
