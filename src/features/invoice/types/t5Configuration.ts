export type T5Configuration =
	| {
			id: string;
			kind: "parAn";
			title: string;
			plafond: number;
	  }
	| {
			id: string;
			kind: "parAnParActe";
			title: string;
			plafondParAn: number;
			plafondParActe: number;
	  }
	| {
			id: string;
			kind: "parSeance";
			title: string;
			nombreSeance: number;
	  };
