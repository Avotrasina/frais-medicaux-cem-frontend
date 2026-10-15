import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { DataTable, type Column } from "../components/DataTable";
import { InlineCell } from "../components/InlineCell";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { ResourceToolbar } from "../components/ResourceToolbar";
import { ToastViewport, notify } from "../components/Toast";
import { beneficiaires as mockBeneficiaires } from "../data/beneficiaire";
import type { Beneficiaire } from "../types/personne";

type Row = {
  id: number;
  idp: string;
  nom: string;
  prenom: string;
  sexe: string;
  naissance: string;
  matricule: string;
  observation: string;
};
const initialRows = (): Row[] =>
  mockBeneficiaires.map((b) => ({
    id: b.id,
    idp: b.idp,
    nom: b.personne.nom,
    prenom: b.personne.prenom,
    sexe: b.personne.sexe,
    naissance: b.personne.dateNaissance,
    matricule: b.personne.agent?.matricule ?? "—",
    observation: b.observationIDP ?? "",
  }));
const blank = (): Omit<Row, "id"> => ({
  idp: "",
  nom: "",
  prenom: "",
  sexe: "FEMININ",
  naissance: "",
  matricule: "",
  observation: "",
});

export default function BeneficiairePage() {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Omit<Row, "id">>(blank());
  const [deleting, setDeleting] = useState<Row | null>(null);
  const filtered = useMemo(
    () =>
      rows.filter((r) =>
        Object.values(r).join(" ").toLowerCase().includes(query.toLowerCase()),
      ),
    [rows, query],
  );
  const update = (id: number, key: keyof Row, value: string) => {
    setRows((old) =>
      old.map((r) => (r.id === id ? { ...r, [key]: value } : r)),
    );
    notify("Bénéficiaire mis à jour");
  };
  const columns: Column<Row>[] = [
    {
      key: "idp",
      label: "IDP",
      render: (r) => (
        <InlineCell value={r.idp} onSave={(v) => update(r.id, "idp", v)} />
      ),
    },
    {
      key: "nom",
      label: "Nom",
      render: (r) => (
        <InlineCell value={r.nom} onSave={(v) => update(r.id, "nom", v)} />
      ),
    },
    {
      key: "prenom",
      label: "Prénom",
      render: (r) => (
        <InlineCell
          value={r.prenom}
          onSave={(v) => update(r.id, "prenom", v)}
        />
      ),
    },
    {
      key: "sexe",
      label: "Sexe",
      render: (r) => (
        <InlineCell value={r.sexe} onSave={(v) => update(r.id, "sexe", v)} />
      ),
    },
    {
      key: "naissance",
      label: "Date de naissance",
      render: (r) => (
        <InlineCell
          value={r.naissance}
          onSave={(v) => update(r.id, "naissance", v)}
        />
      ),
    },
    {
      key: "matricule",
      label: "Matricule agent",
      render: (r) => (
        <InlineCell
          value={r.matricule}
          onSave={(v) => update(r.id, "matricule", v)}
        />
      ),
    },
    {
      key: "observation",
      label: "Observation",
      render: (r) => (
        <InlineCell
          value={r.observation}
          onSave={(v) => update(r.id, "observation", v)}
        />
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <button
          className="btn-ghost text-red-600"
          title="Supprimer"
          onClick={() => setDeleting(r)}
        >
          <Trash2 size={15} />
        </button>
      ),
    },
  ];
  const openNew = () => {
    setEditing({ id: -1, ...blank() });
    setForm(blank());
  };
  const input = (label: string, key: keyof typeof form, type = "text") => (
    <div key={key}>
      <label className="label">{label}</label>
      <input
        className="field"
        type={type}
        required={["idp", "nom", "prenom"].includes(key)}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
      />
    </div>
  );
  return (
    <>
      <ToastViewport />
      <PageHeader
        title="Bénéficiaires"
        description="Gestion des bénéficiaires rattachés aux agents et suivi de leurs identifiants."
        actions={
          <button className="btn-primary" onClick={openNew}>
            <Plus size={16} /> Ajouter un bénéficiaire
          </button>
        }
      />
      <ResourceToolbar
        value={query}
        onChange={setQuery}
        placeholder="Rechercher par IDP, nom, matricule…"
      />
      <p className="mb-3 text-xs text-slate-400">
        {filtered.length} bénéficiaire(s) affiché(s) sur {rows.length}. Cliquez
        sur une cellule pour la modifier.
      </p>
      <DataTable rows={filtered} columns={columns} />
      <Modal
        open={!!editing}
        title={
          editing?.id === -1
            ? "Nouveau bénéficiaire"
            : "Modifier le bénéficiaire"
        }
        onClose={() => setEditing(null)}
        description="Les données sont simulées et restent en mémoire pendant la session."
      >
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (editing?.id === -1) {
              setRows((old) => [
                { ...form, id: Math.max(0, ...old.map((r) => r.id)) + 1 },
                ...old,
              ]);
              notify("Bénéficiaire créé");
            } else if (editing) {
              setRows((old) =>
                old.map((r) =>
                  r.id === editing.id ? { ...form, id: r.id } : r,
                ),
              );
              notify("Bénéficiaire modifié");
            }
            setEditing(null);
          }}
        >
          {input("Identifiant IDP", "idp")}
          {input("Nom", "nom")}
          {input("Prénom", "prenom")}
          <div>
            <label className="label">Sexe</label>
            <select
              className="field"
              value={form.sexe}
              onChange={(e) => setForm((f) => ({ ...f, sexe: e.target.value }))}
            >
              <option value="FEMININ">Féminin</option>
              <option value="MASCULIN">Masculin</option>
            </select>
          </div>
          {input("Date de naissance", "naissance", "date")}
          {input("Matricule de l'agent", "matricule")}
          {input("Observation", "observation")}
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
      <ConfirmDialog
        open={!!deleting}
        message={
          deleting
            ? `Supprimer le bénéficiaire ${deleting.nom} ${deleting.prenom} ?`
            : ""
        }
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          setRows((old) =>
            deleting ? old.filter((r) => r.id !== deleting.id) : old,
          );
          setDeleting(null);
          notify("Bénéficiaire supprimé");
        }}
      />
    </>
  );
}
