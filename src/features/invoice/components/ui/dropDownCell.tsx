import { useState } from "react";
import { CirclePlus } from "lucide-react";
import { Link } from "react-router-dom";
import {TypeContrainte} from "../../types/dropDown";

export type dropdownOptionProps = {
    id: number,
    label:string,
    typeContrainte: TypeContrainte,
}

export default function DropDownCell({
  options,
  refSocial,
  className = "",
  isLocked = false,
}: {
  options: dropdownOptionProps[];
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
        <ul className="absolute left-0 top-full z-10 w-max min-w-full bg-white shadow-md">
          {options.map((option) => (
            <li key={option.label} className="h-10 px-3 flex items-center justify-center cursor-pointer hover:bg-slate-50">
               {option.typeContrainte == TypeContrainte.PAR_AN && <Link to={`/ParAn/${option.id}/${encodeURIComponent(option.label)}/${encodeURIComponent(refSocial)}`}>{option.label}</Link>}
               {option.typeContrainte == TypeContrainte.PAR_AN_PAR_ACTE && <Link to={`/ParAnParActe/${option.id}/${encodeURIComponent(option.label)}/${encodeURIComponent(refSocial)}`}>{option.label}</Link>}
               {option.typeContrainte == TypeContrainte.PAR_SEANCE && <Link to={`/ParSeance/${option.id}/${encodeURIComponent(option.label)}/${encodeURIComponent(refSocial)}`}>{option.label}</Link>}
            </li>
          ))}
        </ul>
      )}
    </td>
  );
}
