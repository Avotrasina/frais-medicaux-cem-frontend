import useT6Autofill from "./useT6Autofill";
import type { T6AutofillUpdateCell } from "./useT6Autofill";
import { fetchT6ByRefSocialMock } from "../mocks/t6Rows";

const targetKeys = ["numFacture", "dateFacture", "nomEtablissement"] as const;

export default function useT6RefSocialAutofill(updateCell: T6AutofillUpdateCell) {
	return useT6Autofill(
		targetKeys,
		fetchT6ByRefSocialMock,
		updateCell,
	);
}
