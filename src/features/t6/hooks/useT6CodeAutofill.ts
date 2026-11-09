import useT6Autofill from "./useT6Autofill";
import type { T6AutofillUpdateCell } from "./useT6Autofill";
import { fetchT6ByCodeMock } from "../mocks/t6Rows";

const targetKeys = ["actePrestation", "categorie"] as const;

export default function useT6CodeAutofill(updateCell: T6AutofillUpdateCell) {
	return useT6Autofill(targetKeys, fetchT6ByCodeMock, updateCell);
}
