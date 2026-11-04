import { useEffect, useState } from "react";
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

	useEffect(() => {
		let isCurrent = true;

		fetchT5ConfigurationMock(id)
			.then((result) => {
				if (isCurrent) setState({ requestId: id, configuration: result, error: null });
			})
			.catch((cause: unknown) => {
				if (isCurrent) {
					setState({
						requestId: id,
						configuration: null,
						error: cause instanceof Error ? cause.message : "Impossible de charger la configuration T5.",
					});
				}
			});

		return () => {
			isCurrent = false;
		};
	}, [id]);

	const isCurrentRequest = state.requestId === id;
	return {
		configuration: isCurrentRequest ? state.configuration : null,
		isLoading: !isCurrentRequest,
		error: isCurrentRequest ? state.error : null,
	};
}
