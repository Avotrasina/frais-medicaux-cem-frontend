import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge, statusTone } from "../components/Badge";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { DataTable, type Column } from "../components/DataTable";
import { InlineCell } from "../components/InlineCell";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { ResourceToolbar } from "../components/ResourceToolbar";
import { agents as initialAgents, type Agent } from "../data/mock";

export default function AgentPage() {
  const [rows, setRows] = useState(initialAgents);
  const [q, setQ] = useState("");
  const [deleteRow, setDeleteRow] = useState<Agent | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const filtered = useMemo(
    () =>
      rows.filter((r) =>
        `${r.im} ${r.name} ${r.function} ${r.direction} ${r.service}`
          .toLowerCase()
          .includes(q.toLowerCase()),
      ),
    [rows, q],
  );
  const save = (id: number, key: keyof Agent, value: string) =>
    setRows((rs) =>
      rs.map((r) => (r.id === id ? ({ ...r, [key]: value } as Agent) : r)),
    );
  const columns: Column<Agent>[] = [
    {
      key: "im",
      label: "Liste agent IM",
      render: (r) => (
        <InlineCell value={r.im} onSave={(v) => save(r.id, "im", v)} />
      ),
    },
    {
      key: "name",
      label: "Nom & prénom",
      render: (r) => (
        <div>
          <InlineCell value={r.name} onSave={(v) => save(r.id, "name", v)} />
          <div className="mt-0.5 text-[10px] text-slate-400">
            ID interne #{r.id}
          </div>
        </div>
      ),
    },
    {
      key: "function",
      label: "Fonction",
      render: (r) => (
        <InlineCell
          value={r.function}
          onSave={(v) => save(r.id, "function", v)}
        />
      ),
    },
    {
      key: "statusPec",
      label: "Statut PEC",
      render: (r) => (
        <div className="flex items-center gap-2">
          <Badge tone={statusTone(r.statusPec)}>{r.statusPec}</Badge>
        </div>
      ),
    },
    {
      key: "sex",
      label: "Sexe",
      render: (r) => (
        <InlineCell value={r.sex} onSave={(v) => save(r.id, "sex", v)} />
      ),
    },
    {
      key: "category",
      label: "Catégorie",
      render: (r) => (
        <InlineCell
          value={r.category}
          onSave={(v) => save(r.id, "category", v)}
        />
      ),
    },
    {
      key: "org",
      label: "Back_O / Front_0",
      render: (r) => (
        <InlineCell
          value={r.org}
          onSave={(v) => save(r.id, "org", v)}
          type="select"
        />
      ),
    },
    {
      key: "direction",
      label: "Code direction",
      render: (r) => (
        <InlineCell
          value={r.direction}
          onSave={(v) => save(r.id, "direction", v)}
        />
      ),
    },
    {
      key: "service",
      label: "Direction / Service",
      render: (r) => (
        <div className="max-w-52 truncate">
          <InlineCell
            value={r.service}
            onSave={(v) => save(r.id, "service", v)}
          />
        </div>
      ),
    },
    {
      key: "birth",
      label: "Date naissance",
      render: (r) => (
        <InlineCell value={r.birth} onSave={(v) => save(r.id, "birth", v)} />
      ),
    },
    {
      key: "entry",
      label: "Date entrée",
      render: (r) => (
        <InlineCell value={r.entry} onSave={(v) => save(r.id, "entry", v)} />
      ),
    },
    {
      key: "observation",
      label: "Observation",
      render: (r) => (
        <span className="max-w-52 truncate text-xs text-slate-500">
          {r.observation}
        </span>
      ),
    },
    {
      key: "card",
      label: "Carte",
      render: (r) => (
        <span className="font-mono text-xs text-slate-600">{r.card}</span>
      ),
    },
    {
      key: "updatedBy",
      label: "Par qui ?",
      render: (r) => (
        <span className="text-xs text-slate-500">{r.updatedBy}</span>
      ),
    },
  ];
  return (
    <>
      <PageHeader
        title="Agents"
        description="Gestion des agents, statut de prise en charge, rattachement organisationnel et informations de carte."
        actions={
          <button onClick={() => setFormOpen(true)} className="btn-primary">
            Ajouter un agent
          </button>
        }
      />
      <ResourceToolbar
        value={q}
        onChange={setQ}
        placeholder="Rechercher par matricule, nom, fonction, direction…"
        onAction={() => setFormOpen(true)}
      />
      <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
        <span>{filtered.length} agents affichés</span>
        <span>
          Astuce : cliquez directement dans une cellule pour modifier.
        </span>
      </div>
      <DataTable rows={filtered} columns={columns} />
      <div className="mt-3 flex items-center justify-end gap-2 text-xs text-slate-400">
        <span>Actions disponibles</span>
        <button className="btn-ghost">
          <Eye size={14} /> Voir
        </button>
        <button className="btn-ghost">
          <Pencil size={14} /> Modifier
        </button>
        <button
          onClick={() => setDeleteRow(rows[0])}
          className="btn-ghost text-red-600"
        >
          <Trash2 size={14} /> Supprimer
        </button>
        <MoreHorizontal size={16} />
      </div>
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Nouvel agent"
        description="Créez une fiche agent. Les champs pourront ensuite être modifiés inline."
      >
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            setFormOpen(false);
          }}
        >
          <div>
            <label className="label">Matricule IM</label>
            <input className="field" placeholder="100700" />
          </div>
          <div>
            <label className="label">Nom & prénom</label>
            <input className="field" placeholder="Nom complet" />
          </div>
          <div>
            <label className="label">Fonction</label>
            <input className="field" placeholder="Fonction" />
          </div>
          <div>
            <label className="label">Sexe</label>
            <select className="field">
              <option>F</option>
              <option>M</option>
            </select>
          </div>
          <div>
            <label className="label">Catégorie</label>
            <input className="field" placeholder="A / B / C" />
          </div>
          <div>
            <label className="label">Statut PEC</label>
            <select className="field">
              <option>ACTIVE</option>
              <option>SUSPENDU</option>
              <option>RETRAITE</option>
            </select>
          </div>
          <div>
            <label className="label">Direction</label>
            <input className="field" placeholder="DCH" />
          </div>
          <div>
            <label className="label">Service / Agence</label>
            <input className="field" placeholder="Service" />
          </div>
          <div>
            <label className="label">Date naissance</label>
            <input type="date" className="field" />
          </div>
          <div>
            <label className="label">Date entrée</label>
            <input type="date" className="field" />
          </div>
          <div className="md:col-span-2">
            <label className="label">Observation</label>
            <textarea className="min-h-24 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100" />
          </div>
          <div className="flex justify-end gap-2 md:col-span-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setFormOpen(false)}
            >
              Annuler
            </button>
            <button className="btn-primary">Créer l’agent</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        open={!!deleteRow}
        message={
          deleteRow
            ? `La suppression de la fiche de ${deleteRow.name} retirera l’élément de la liste. Cette action est irréversible.`
            : ""
        }
        onCancel={() => setDeleteRow(null)}
        onConfirm={() => {
          setRows((rs) =>
            deleteRow ? rs.filter((r) => r.id !== deleteRow.id) : rs,
          );
          setDeleteRow(null);
        }}
      />
    </>
  );
}
