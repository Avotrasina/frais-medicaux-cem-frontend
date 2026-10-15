import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Badge, statusTone } from "../components/Badge";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { DataTable, type Column } from "../components/DataTable";
import { InlineCell } from "../components/InlineCell";
import { PageHeader } from "../components/PageHeader";
import { ResourceToolbar } from "../components/ResourceToolbar";
import { Modal } from "../components/Modal";
import { ToastViewport, notify } from "../components/Toast";

import { directions } from "../data/direction";
import { agents as initialAgents } from "../data/agent";
import { personnes } from "../data/personne";
import { structures } from "../data/structure";
import { agences } from "../data/agence";
import { fonctions } from "../data/fonction";
import { services } from "../data/service";

// View model matching the columns in the Excel sheet.
interface AgentRow {
  id: number;
  im: string;
  name: string;
  fonction: string;
  statutPEC: string;
  sexe: string;
  categorie: string;
  organisation: string;
  codeDirection: string;
  direction: string;
  codeServiceAgence: string;
  serviceAgence: string;
  dateNaissance: string;
  dateEntree: string;
  observation: string;
  carte: string;
  parQui: string;
}

const formatDate = (value?: string | null): string => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("fr-FR").format(date);
};

const buildAgentRows = (): AgentRow[] => {
  return initialAgents.map((agent) => {
    const personne = personnes.find(
      (p) => p.agent?.matricule === agent.matricule,
    );

    const structure = structures.find((s) => s.id === agent.structureID);

    const directionCode = structure?.direction?.codeDirection;
    const direction = directions.find((d) => d.codeDirection === directionCode);

    const agenceCode = structure?.agence?.codeAgence;
    const agence = agences.find((a) => a.codeAgence === agenceCode);

    const service = services.find(
      (s) => s.codeService === agent.serviceID,
    );

    const fonction = fonctions.find((f) => f.id === agent.fonctionID);

    const isRetired = agent.agentType === "AGENT_RETRAITE";
    const organisation = isRetired
      ? "RETRAITE"
      : agence
        ? "AGENCE"
        : "DIRECTION";

    const statutPEC = isRetired
      ? "RETRAITE"
      : (structure?.statutPEC ?? "AGENT");

    return {
      id: agent.id,
      im: agent.matricule,
      name: personne
        ? `${personne.nom.trim()} ${personne.prenom.trim()}`.trim()
        : "—",
      fonction: fonction?.nom ?? "—",
      statutPEC,
      sexe:
        personne?.sexe === "FEMININ"
          ? "Femme"
          : personne?.sexe === "MASCULIN"
            ? "Homme"
            : "—",
      categorie: agent.categorieID || "—",
      organisation,
      codeDirection: isRetired
        ? "RET"
        : agence
          ? "AGENCE"
          : (direction?.codeDirection ?? "—"),
      direction: isRetired
        ? "RETRAITE"
        : agence
          ? "Agence"
          : (direction?.nom ?? "—"),
      codeServiceAgence: isRetired
        ? "RET"
        : (agence?.codeAgence ?? service?.codeService ?? "—"),
      serviceAgence: isRetired
        ? "RETRAITE"
        : (agence?.nomAgence ?? service?.nom ?? "—"),
      dateNaissance: formatDate(personne?.dateNaissance),
      dateEntree: formatDate(agent.dateEntree),
      observation: agent.observationMatricule ?? "—",
      carte: agent.carteProfessionnellePath || "—",
      parQui: "—",
    };
  });
};

export default function AgentPage() {
  const [rows, setRows] = useState<AgentRow[]>(buildAgentRows);
  const [q, setQ] = useState("");
  const [deleteRow, setDeleteRow] = useState<AgentRow | null>(null);
  const [editing, setEditing] = useState<AgentRow | null>(null);
  const emptyRow = (): Omit<AgentRow, "id"> => ({
    im: "",
    name: "",
    fonction: "",
    statutPEC: "AGENT",
    sexe: "—",
    categorie: "",
    organisation: "DIRECTION",
    codeDirection: "",
    direction: "",
    codeServiceAgence: "",
    serviceAgence: "",
    dateNaissance: "",
    dateEntree: "",
    observation: "",
    carte: "",
    parQui: "Utilisateur connecté",
  });
  const [form, setForm] = useState<Omit<AgentRow, "id">>(emptyRow());
  const editField = (label: string, key: keyof typeof form, type = "text") => (
    <div key={key}>
      <label className="label">{label}</label>
      <input
        className="field"
        type={type}
        value={form[key]}
        required={["im", "name"].includes(key)}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
      />
    </div>
  );

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    if (!query) return rows;

    return rows.filter((row) =>
      [
        row.im,
        row.name,
        row.fonction,
        row.statutPEC,
        row.sexe,
        row.categorie,
        row.organisation,
        row.codeDirection,
        row.direction,
        row.codeServiceAgence,
        row.serviceAgence,
        row.dateNaissance,
        row.dateEntree,
        row.observation,
        row.carte,
        row.parQui,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [rows, q]);

  const save = (id: number, key: keyof AgentRow, value: string) => {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [key]: value } : row)),
    );
  };

  const columns: Column<AgentRow>[] = [
    {
      key: "im",
      label: "IM",
      render: (row) => (
        <InlineCell
          value={row.im}
          onSave={(value) => save(row.id, "im", value)}
        />
      ),
    },
    {
      key: "name",
      label: "NOM et PRENOM AGENT",
      render: (row) => (
        <InlineCell
          value={row.name}
          onSave={(value) => save(row.id, "name", value)}
        />
      ),
    },
    {
      key: "fonction",
      label: "Fonction",
      render: (row) => (
        <InlineCell
          value={row.fonction}
          onSave={(value) => save(row.id, "fonction", value)}
        />
      ),
    },
    {
      key: "statutPEC",
      label: "Statut PEC",
      render: (row) => (
        <Badge tone={statusTone(row.statutPEC)}>{row.statutPEC}</Badge>
      ),
    },
    {
      key: "sexe",
      label: "Sexe",
      render: (row) => (
        <InlineCell
          value={row.sexe}
          onSave={(value) => save(row.id, "sexe", value)}
        />
      ),
    },
    {
      key: "categorie",
      label: "Catégorie",
      render: (row) => (
        <InlineCell
          value={row.categorie}
          onSave={(value) => save(row.id, "categorie", value)}
        />
      ),
    },
    {
      key: "organisation",
      label: "Back_O & Front_O",
      render: (row) => (
        <InlineCell
          value={row.organisation}
          onSave={(value) => save(row.id, "organisation", value)}
          type="select"
        />
      ),
    },
    {
      key: "codeDirection",
      label: "Cod_Dir",
      render: (row) => (
        <InlineCell
          value={row.codeDirection}
          onSave={(value) => save(row.id, "codeDirection", value)}
        />
      ),
    },
    {
      key: "direction",
      label: "Direction",
      render: (row) => (
        <div className="max-w-64">
          <InlineCell
            value={row.direction}
            onSave={(value) => save(row.id, "direction", value)}
          />
        </div>
      ),
    },
    {
      key: "codeServiceAgence",
      label: "Cod_Serv / Cod_Agc",
      render: (row) => (
        <InlineCell
          value={row.codeServiceAgence}
          onSave={(value) => save(row.id, "codeServiceAgence", value)}
        />
      ),
    },
    {
      key: "serviceAgence",
      label: "SERVICE / Agence",
      render: (row) => (
        <div className="max-w-64">
          <InlineCell
            value={row.serviceAgence}
            onSave={(value) => save(row.id, "serviceAgence", value)}
          />
        </div>
      ),
    },
    {
      key: "dateNaissance",
      label: "Date_Naissance",
      render: (row) => (
        <InlineCell
          value={row.dateNaissance}
          onSave={(value) => save(row.id, "dateNaissance", value)}
        />
      ),
    },
    {
      key: "dateEntree",
      label: "Date_Entrée",
      render: (row) => (
        <InlineCell
          value={row.dateEntree}
          onSave={(value) => save(row.id, "dateEntree", value)}
        />
      ),
    },
    {
      key: "observation",
      label: "ObsIM",
      render: (row) => (
        <div className="max-w-48">
          <InlineCell
            value={row.observation}
            onSave={(value) => save(row.id, "observation", value)}
          />
        </div>
      ),
    },
    {
      key: "carte",
      label: "Carte",
      render: (row) => (
        <span
          className="block max-w-48 truncate font-mono text-xs text-slate-600"
          title={row.carte}
        >
          {row.carte}
        </span>
      ),
    },
    {
      key: "parQui",
      label: "ParQui",
      render: (row) => (
        <span className="text-xs text-slate-500">{row.parQui}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-1">
          <button
            title="Modifier"
            className="btn-ghost"
            onClick={() => {
              setEditing(row);
              setForm({
                im: row.im,
                name: row.name,
                fonction: row.fonction,
                statutPEC: row.statutPEC,
                sexe: row.sexe,
                categorie: row.categorie,
                organisation: row.organisation,
                codeDirection: row.codeDirection,
                direction: row.direction,
                codeServiceAgence: row.codeServiceAgence,
                serviceAgence: row.serviceAgence,
                dateNaissance: row.dateNaissance,
                dateEntree: row.dateEntree,
                observation: row.observation,
                carte: row.carte,
                parQui: row.parQui,
              });
            }}
          >
            <Pencil size={14} />
          </button>
          <button
            title="Supprimer"
            className="btn-ghost text-red-600"
            onClick={() => setDeleteRow(row)}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <ToastViewport />
      <PageHeader
        title="Agents"
        description="Liste des agents actifs et retraités, informations personnelles et rattachement organisationnel."
        actions={
          <button
            className="btn-primary"
            onClick={() => {
              setEditing({ id: -1, ...emptyRow() });
              setForm(emptyRow());
            }}
          >
            <Plus size={16} /> Ajouter un agent
          </button>
        }
      />

      <ResourceToolbar
        value={q}
        onChange={setQ}
        placeholder="Rechercher par IM, nom, fonction, direction, agence..."
      />

      <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
        <span>
          {filtered.length} agent(s) affiché(s) sur {rows.length}
        </span>
        <span>Cliquez sur une cellule modifiable pour changer sa valeur.</span>
      </div>

      <DataTable rows={filtered} columns={columns} />

      <ConfirmDialog
        open={!!deleteRow}
        message={
          deleteRow
            ? `Supprimer l'agent ${deleteRow.name} (${deleteRow.im}) de cette liste ?`
            : ""
        }
        onCancel={() => setDeleteRow(null)}
        onConfirm={() => {
          if (deleteRow) {
            setRows((current) =>
              current.filter((row) => row.id !== deleteRow.id),
            );
            notify("Agent supprimé");
          }
          setDeleteRow(null);
        }}
      />
      <Modal
        open={!!editing}
        title={editing?.id === -1 ? "Nouvel agent" : "Modifier l'agent"}
        description="Données mockées : les changements restent en mémoire pendant la session."
        onClose={() => setEditing(null)}
      >
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (editing?.id === -1) {
              setRows((current) => [
                { ...form, id: Math.max(0, ...current.map((r) => r.id)) + 1 },
                ...current,
              ]);
              notify("Agent créé");
            } else if (editing) {
              setRows((current) =>
                current.map((r) =>
                  r.id === editing.id ? { ...form, id: r.id } : r,
                ),
              );
              notify("Agent modifié");
            }
            setEditing(null);
          }}
        >
          {editField("Matricule IM", "im")}
          {editField("Nom et prénom", "name")}
          {editField("Fonction", "fonction")}
          {editField("Statut PEC", "statutPEC")}
          {editField("Sexe", "sexe")}
          {editField("Catégorie", "categorie")}
          {editField("Organisation", "organisation")}
          {editField("Code direction", "codeDirection")}
          {editField("Direction", "direction")}
          {editField("Code service / agence", "codeServiceAgence")}
          {editField("Service / agence", "serviceAgence")}
          {editField("Date de naissance", "dateNaissance")}
          {editField("Date d'entrée", "dateEntree")}
          {editField("Observation", "observation")}
          {editField("Carte", "carte")}
          <div className="flex justify-end gap-2 md:col-span-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setEditing(null)}
            >
              Annuler
            </button>
            <button className="btn-primary">Enregistrer</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
