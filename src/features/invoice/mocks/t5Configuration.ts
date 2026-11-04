import type { T5Configuration } from "../types/t5Configuration";

const t5Configurations: Record<string, T5Configuration> = {
	"1": {
		id: "1",
		kind: "parAn",
		title: "T5 par an",
		plafond: 10_000_000,
	},
	"2": {
		id: "2",
		kind: "parAnParActe",
		title: "T5 par an et par acte",
		plafondParAn: 10_000_000,
		plafondParActe: 1_000_000,
	},
	"3": {
		id: "3",
		kind: "parSeance",
		title: "T5 par séance",
		nombreSeance: 3,
	},
};

export async function fetchT5ConfigurationMock(id: string | undefined): Promise<T5Configuration> {
	await Promise.resolve();
	if (!id || !t5Configurations[id]) {
		throw new Error(`Aucune configuration T5 trouvée pour l’identifiant « ${id ?? ""} ».`);
	}
	return { ...t5Configurations[id] };
}
