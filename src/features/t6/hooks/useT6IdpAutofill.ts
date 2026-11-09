import useT6Autofill from "./useT6Autofill";
import type { T6AutofillUpdateCell } from "./useT6Autofill";
import { fetchT6ByIdpMock } from "../mocks/t6Rows";

const targetKeys = [
	"nomBeneficiaire",
	"prenomBeneficiaire",
	"codeFamille",
	"obsIdp",
	"im",
	"nomAgent",
	"prenomAgent",
	"direction",
	"serviceAgence",
] as const;

export default function useT6IdpAutofill(updateCell: T6AutofillUpdateCell) {
	return useT6Autofill(
		targetKeys,
		fetchT6ByIdpMock,
		updateCell,
	);
}
