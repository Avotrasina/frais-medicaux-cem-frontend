import { useState } from "react";
import { CirclePlus } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../../constants/routes";
import { fillPath } from "../../../../services/api-contract";
import {
    TypeContrainte,
    type DropdownOption,
} from "../../types/dropDown";

const ROUTE_BY_CONSTRAINT: Record<TypeContrainte, string> = {
    [TypeContrainte.PAR_AN]: ROUTES.T5ParAn,
    [TypeContrainte.PAR_AN_PAR_ACTE]: ROUTES.T5ParAnParActe,
    [TypeContrainte.PAR_SEANCE]: ROUTES.T5Parseance,
};

export default function DropDownCell({
  options,
  refSocial,
  className = "",
  isLocked = false,
}: {
  options: DropdownOption[];
  refSocial: string;
  className?: string;
  isLocked?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <td
      className={`relative px-3 ${className} ${isLocked ? "cursor-not-allowed bg-slate-100 opacity-60" : "cursor-pointer"}`}
      onMouseEnter={() => !isLocked && setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="flex justify-center items-center">
        <CirclePlus className="text-yellow-30" />
      </div>

      {open && !isLocked && (
        <ul className="absolute left-0 top-full z-10 max-h-72 w-max min-w-full overflow-y-auto bg-white shadow-md">
          {options.map((option) => {
            const route = ROUTE_BY_CONSTRAINT[option.typeContrainte];
            const path = fillPath(route, {
              id: option.id,
              label: option.label,
              refSocial,
            });
            return (
              <li
                key={`${option.type}-${option.id}`}
                className="flex h-10 items-center gap-2 px-3 hover:bg-slate-50"
              >
                <Link
                  className="flex min-w-0 flex-1 items-center gap-2"
                  to={{ pathname: path, search: `?type=${option.type}` }}
                >
                  <span className="truncate">{option.label}</span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      option.type === "acte"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {option.type === "acte" ? "Acte" : "Catégorie"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </td>
  );
}
