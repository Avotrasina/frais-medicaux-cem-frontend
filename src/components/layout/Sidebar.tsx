import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  FileCheck2,
  FileText,
  Gauge,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  Search,
  Settings,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { Modal } from "../Modal";
import logo from "../../assets/logo.jpg";

const nav = [
  { to: "/", label: "Tableau de bord", icon: LayoutDashboard },
  { section: "Gestion" },
  { to: "/agents", label: "Agents", icon: Users },
  { to: "/beneficiaires", label: "Bénéficiaires", icon: UserRound },
  { to: "/prestataires", label: "Prestataires", icon: Stethoscope },
  { to: "/pec", label: "Prises en charge", icon: ShieldCheck, badge: "12" },
  { to: "/factures", label: "Factures", icon: FileText, badge: "8" },
  { to: "/retenues", label: "Retenues salaire", icon: WalletCards },
  { section: "Pilotage" },
  { to: "/rapports", label: "États & suivi", icon: Gauge },
  { to: "/utilisateurs", label: "Utilisateurs", icon: Users },
  { to: "/parametres", label: "Paramètres", icon: Settings },
];

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const current =
    nav.find((n: any) => n.to === location.pathname && n.label)?.label ??
    "Tableau de bord";

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${isActive ? "bg-red-50 text-red-700" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"}`;

  return (
    <div className="min-h-screen bg-slate-50">
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[270px] flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"} ${collapsed ? "lg:w-[82px]" : ""}`}
      >
        <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-5">
          <img
            src={logo}
            alt="Caisse d'Épargne de Madagascar"
            className="h-10 w-auto max-w-[185px] object-contain object-left"
          />
          <button
            className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
            onClick={() => setOpen(false)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <div
            className={`mb-3 px-3 pt-2 text-[10px] font-extrabold uppercase tracking-[.18em] text-slate-400 ${collapsed ? "lg:hidden" : ""}`}
          >
            Navigation
          </div>
          <nav className="space-y-1">
            {nav.map((item: any, idx) =>
              item.section ? (
                <div
                  key={idx}
                  className={`px-3 pb-2 pt-5 text-[10px] font-extrabold uppercase tracking-[.18em] text-slate-400 ${collapsed ? "lg:hidden" : ""}`}
                >
                  {item.section}
                </div>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  title={collapsed ? item.label : undefined}
                  onClick={() => setOpen(false)}
                  className={linkClass}
                >
                  <item.icon size={18} className="shrink-0" />
                  <span className={`${collapsed ? "lg:hidden" : ""}`}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      className={`ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 ${collapsed ? "lg:hidden" : ""}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ),
            )}
          </nav>
        </div>
        <div className="border-t border-slate-100 p-3">
          <div
            className={`flex items-center gap-3 rounded-xl bg-slate-50 p-3 ${collapsed ? "lg:justify-center" : ""}`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-extrabold text-white">
              AR
            </div>
            <div className={`${collapsed ? "lg:hidden" : ""}`}>
              <div className="text-xs font-bold text-slate-800">
                Ando Rakoto
              </div>
              <div className="text-[10px] text-slate-400">Administrateur</div>
            </div>
          </div>
        </div>
      </aside>

      <div
        className={`min-h-screen transition-[padding] duration-200 ${collapsed ? "lg:pl-[82px]" : "lg:pl-[270px]"}`}
      >
        <header className="sticky top-0 z-20 flex h-20 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-6">
          <button
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu size={21} />
          </button>
          <button
            className="hidden rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:block"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <Menu size={20} /> : <PanelLeftClose size={20} />}
          </button>
          <div className="hidden items-center gap-2 text-xs text-slate-400 md:flex">
            <span>Frais médicaux</span>
            <span>/</span>
            <span className="font-bold text-slate-700">{current}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden h-10 w-72 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 md:flex">
              <Search size={16} className="text-slate-400" />
              <input
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                placeholder="Rechercher un agent, PEC, facture…"
              />
            </div>
            <button className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100">
              <Bell size={19} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
            <button
              onClick={() => setProfileOpen(true)}
              className="flex items-center gap-2 rounded-xl p-1.5 pr-2.5 hover:bg-slate-50"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-xs font-extrabold text-red-700">
                AR
              </span>
              <ChevronDown
                size={15}
                className="hidden text-slate-400 sm:block"
              />
            </button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1600px] p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
      <Modal
        open={profileOpen}
        title="Mon profil"
        description="Compte actuellement connecté"
        onClose={() => setProfileOpen(false)}
        width="max-w-md"
      >
        <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-lg font-extrabold text-white">
            AR
          </div>
          <div>
            <div className="font-bold text-slate-900">Ando Rakoto</div>
            <div className="text-sm text-slate-500">
              Administrateur • Direction SI
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Dernière connexion : aujourd'hui, 08:41
            </div>
          </div>
        </div>
        <div className="mt-6 grid gap-2">
          <button className="btn-secondary justify-start">
            <UserRound size={17} /> Modifier mon profil
          </button>
          <button className="btn-secondary justify-start">
            <Settings size={17} /> Préférences d’interface
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">
            <LogOut size={17} /> Se déconnecter
          </button>
        </div>
      </Modal>
    </div>
  );
}
