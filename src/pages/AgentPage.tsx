import { useMemo, useState } from "react";
import { Badge, statusTone } from "../components/Badge";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { DataTable, type Column } from "../components/DataTable";
import { InlineCell } from "../components/InlineCell";
import { PageHeader } from "../components/PageHeader";
import { ResourceToolbar } from "../components/ResourceToolbar";


import { directions } from "../data/direction";
import { agents as initialAgents } from "../data/agent";
import { personnes } from "../data/personne";
import { structures } from "../data/structure";
import { agences } from "../data/agence";
import { fonctions } from "../data/fonction";


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
      (p) => p.agent?.matricule === agent.matricule
    );

    const structure = structures.find(
      (s) => s.id === agent.structureID
    );

    const directionCode = structure?.direction?.codeDirection;
    const direction = directions.find(
      (d) => d.codeDirection === directionCode
    );

    const agenceCode = structure?.agence?.codeAgence;
    const agence = agences.find(
      (a) => a.codeAgence === agenceCode
    );

    const service = direction?.services.find(
      (s) => s.codeService === String(agent.serviceID)
    );

    const fonction = fonctions.find(
      (f) => f.id === agent.fonctionID
    );

    const isRetired = agent.agentType === "AGENT_RETRAITE";
    const organisation = isRetired
      ? "RETRAITE"
      : agence
        ? "AGENCE"
        : "DIRECTION";

    const statutPEC = isRetired
      ? "RETRAITE"
      : structure?.statutPEC ?? "AGENT";

    return {
      id: agent.id,
      im: agent.matricule,
      name: personne
        ? `${personne.nom.trim()} ${personne.prenom.trim()}`.trim()
        : "—",
      fonction: fonction?.nom ?? "—",
      statutPEC,
      sexe: personne?.sexe === "FEMININ"
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
          : direction?.codeDirection ?? "—",
      direction: isRetired
        ? "RETRAITE"
        : agence
          ? "Agence"
          : direction?.nom ?? "—",
      codeServiceAgence: isRetired
        ? "RET"
        : agence?.codeAgence ?? service?.codeService ?? "—",
      serviceAgence: isRetired
        ? "RETRAITE"
        : agence?.nomAgence ?? service?.nom ?? "—",
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
        .includes(query)
    );
  }, [rows, q]);

  const save = (
    id: number,
    key: keyof AgentRow,
    value: string
  ) => {
    setRows((current) =>
      current.map((row) =>
        row.id === id ? { ...row, [key]: value } : row
      )
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
        <Badge tone={statusTone(row.statutPEC)}>
          {row.statutPEC}
        </Badge>
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
        <span className="text-xs text-slate-500">
          {row.parQui}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Agents"
        description="Liste des agents actifs et retraités, informations personnelles et rattachement organisationnel."
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
        <span>
          Cliquez sur une cellule modifiable pour changer sa valeur.
        </span>
      </div>

      <DataTable rows={filtered} columns={columns} />

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          className="btn-ghost text-red-600"
          disabled={!deleteRow && rows.length === 0}
          onClick={() => setDeleteRow(filtered[0] ?? null)}
        >
          Supprimer le premier résultat
        </button>
      </div>

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
              current.filter((row) => row.id !== deleteRow.id)
            );
          }
          setDeleteRow(null);
        }}
      />
    </>
  );
}
