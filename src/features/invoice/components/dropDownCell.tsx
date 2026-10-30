import { useState } from "react";
import { CirclePlus } from "lucide-react";
import { Link } from "react-router-dom";
import type { dropdownOptionType as dropdownOptionProps } from "../types/dropDown";

export default function DropDownCell({
  options,
  className = "",
}: {
  options: dropdownOptionProps[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <td
      className={`relative px-3 ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="flex justify-center items-center">
        <CirclePlus className="text-yellow-30" />
      </div>

      {open && (
        <ul className="absolute left-0 top-full z-10 w-max min-w-full bg-white shadow-md">
          {options.map((option) => (
            <li key={option.label} className="h-10 px-3 flex items-center justify-center cursor-pointer hover:bg-slate-50">
              {option.path ? (
                <Link to={option.path} className="w-full">
                  {option.label}
                </Link>
              ) : (
                option.label
              )}
            </li>
          ))}
        </ul>
      )}
    </td>
  );
}
