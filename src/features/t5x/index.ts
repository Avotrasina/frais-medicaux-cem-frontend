export { default as T5XTypesTable } from "./components/T5XCategoriesTable";
export { default as T5XActsTable } from "./components/T5XActsTable";
export { default as useT5XCategories } from "./hooks/useT5XCategories";
export { default as useT5XActs } from "./hooks/useT5XActs";
export { fetchT5XTable1Mock, fetchT5XTable2Mock, initialT5XTable1Mock, initialT5XTable2Mock } from "./mocks/t5xTypes";
export { T5X_ACT_CONSTRAINT_TYPES, T5X_CONSTRAINT_TYPES, T5X_REGIME_TYPES } from "./types/t5xType";
export type {
	T5XColumn,
	T5XConstraintEditableKey,
	T5XConstraintRow,
	T5XConstraintTableProps,
	T5XConstraintType,
	T5XRegime,
	T5XTypeEditableKey,
	T5XTypeRow,
	T5XTypeTableProps,
} from "./types/t5xType";
