import { useCallback, useState } from "react";
import { listProviderCategories } from "../../providers/services/providers";
import { useAsyncLoader } from "../../../hooks/useAsyncLoader";
import {
	listAgences,
	listAgentCategories,
	listDirections,
	listLieux,
} from "../services/referentials";
import type {
	Agence,
	AgentCategory,
	Direction,
	Lieu,
	ProviderCategory,
	Service,
} from "../../../types/api";

export interface Referentials {
	lieux: Lieu[];
	providerCategories: ProviderCategory[];
	agentCategories: AgentCategory[];
	agences: Agence[];
	directions: Direction[];
	/** Flat view derived from `directions`, which already carries the services. */
	services: Service[];
	loading: boolean;
	error: string | null;
	reload: () => Promise<void>;
}

/**
 * Loads every list needed to fill the dropdowns of the agent, provider and
 * prise-en-charge forms.
 *
 * Loaded once per page mount and shared by the whole page, so a form with six
 * selects still costs six requests in total, not six per field.
 */
export function useReferentials(): Referentials {
	const [lieux, setLieux] = useState<Lieu[]>([]);
	const [providerCategories, setProviderCategories] = useState<
		ProviderCategory[]
	>([]);
	const [agentCategories, setAgentCategories] = useState<AgentCategory[]>([]);
	const [agences, setAgences] = useState<Agence[]>([]);
	const [directions, setDirections] = useState<Direction[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	/**
	 * Loads every list. No state is written before the first `await`, so the
	 * effect below can call it without triggering a synchronous re-render.
	 * The first `await` is also the only suspension point: the `isStale()` guard
	 * that follows it protects the whole commit block below.
	 */
	const fetchAll = useCallback(async (isStale: () => boolean) => {
		const [
			lieuxResult,
			categoriesResult,
			agentCatsResult,
			agencesResult,
			directionsResult,
		] = await Promise.allSettled([
			listLieux(),
			listProviderCategories(),
			listAgentCategories(),
			listAgences(),
			listDirections(),
		]);

		if (isStale()) return;

		if (lieuxResult.status === "fulfilled") {
			setLieux(lieuxResult.value);
		}
		if (categoriesResult.status === "fulfilled") {
			setProviderCategories(categoriesResult.value);
		}
		if (agentCatsResult.status === "fulfilled") {
			setAgentCategories(agentCatsResult.value);
		}
		if (agencesResult.status === "fulfilled") {
			setAgences(agencesResult.value);
		}
		if (directionsResult.status === "fulfilled") {
			setDirections(directionsResult.value);
		}

		const firstFailure = [
			lieuxResult,
			categoriesResult,
			agentCatsResult,
			agencesResult,
			directionsResult,
		].find((result) => result.status === "rejected");

		setError(firstFailure ? describeFailure(firstFailure.reason) : null);
		setLoading(false);
	}, []);

	/** Manual refresh: re-displays the spinner before loading again. */
	const reload = useCallback(async () => {
		setLoading(true);
		setError(null);
		await fetchAll(() => false);
	}, [fetchAll]);

	useAsyncLoader(fetchAll);

	const services: Service[] = directions.flatMap(
		(direction) => direction.services ?? [],
	);

	return {
		lieux,
		providerCategories,
		agentCategories,
		agences,
		directions,
		services,
		loading,
		error,
		reload,
	};
}

function describeFailure(reason: unknown): string {
	if (reason instanceof Error) return reason.message;
	return "Impossible de charger les référentiels.";
}
