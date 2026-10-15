import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { DataTable, type Column } from "../components/DataTable";
import { InlineCell } from "../components/InlineCell";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { ResourceToolbar } from "../components/ResourceToolbar";
import { ToastViewport, notify } from "../components/Toast";
import { prestataires as mockPrestataires } from "../data/prestataire";
import type { Prestataire } from "../types/prestataire";

type Row = Omit<Prestataire, "attestations">; type StringKeys<T> = { [K in keyof T]: T[K] extends string ? K : never }[keyof T];
const initialRows = (): Row[] => mockPrestataires.map(({ attestations: _attestations, ...p }) => p);
const blank = (): Omit<Row, "id"> => ({ nom: "", adresse: "", statut: "PRIVE", nif: "", stat: "", dateDebutConvention: "", dateFinConvention: "", listePrestation: "", lieuID: 1, categorieID: 1 });
export default function PrestatairePage() {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Omit<Row, "id">>(blank());
  const [deleting, setDeleting] = useState<Row | null>(null);
  const filtered = useMemo(() => rows.filter((r) => Object.values(r).join(" ").toLowerCase().includes(query.toLowerCase())), [rows, query]);
  const update = (id: number, key: keyof Row, value: string) => { setRows((old) => old.map((r) => r.id === id ? ({ ...r, [key]: value } as Row) : r)); notify("Prestataire mis à jour"); };
  const columns: Column<Row>[] = [
    { key: "nom", label: "Prestataire", render: (r) => <InlineCell value={r.nom} onSave={(v) => update(r.id, "nom", v)}/> },
    { key: "adresse", label: "Adresse", render: (r) => <InlineCell value={r.adresse} onSave={(v) => update(r.id, "adresse", v)}/> },
    { key: "statut", label: "Statut", render: (r) => <InlineCell value={r.statut} type="select" onSave={(v) => update(r.id, "statut", v)}/> },
    { key: "nif", label: "NIF", render: (r) => <InlineCell value={r.nif} onSave={(v) => update(r.id, "nif", v)}/> },
    { key: "stat", label: "STAT", render: (r) => <InlineCell value={r.stat} onSave={(v) => update(r.id, "stat", v)}/> },
    { key: "dateDebutConvention", label: "Début convention", render: (r) => <InlineCell value={r.dateDebutConvention} onSave={(v) => update(r.id, "dateDebutConvention", v)}/> },
    { key: "dateFinConvention", label: "Fin convention", render: (r) => <InlineCell value={r.dateFinConvention} onSave={(v) => update(r.id, "dateFinConvention", v)}/> },
    { key: "listePrestation", label: "Prestations", render: (r) => <InlineCell value={r.listePrestation} onSave={(v) => update(r.id, "listePrestation", v)}/> },
    { key: "actions", label: "Actions", render: (r) => <button className="btn-ghost text-red-600" title="Supprimer" onClick={() => setDeleting(r)}><Trash2 size={15}/></button> },
  ];
  const openNew = () => { setEditing({ id: -1, ...blank() }); setForm(blank()); };
  const field = (label: string, key: StringKeys<typeof form>, type = "text") => <div key={key}><label className="label">{label}</label><input className="field" type={type} required={["nom", "adresse"].includes(key)} value={String(form[key])} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}/></div>;
  return <><ToastViewport/><PageHeader title="Prestataires" description="Suivi des établissements conventionnés, de leurs coordonnées et des prestations couvertes." actions={<button className="btn-primary" onClick={openNew}><Plus size={16}/> Ajouter un prestataire</button>}/>
    <ResourceToolbar value={query} onChange={setQuery} placeholder="Rechercher un établissement, une adresse, NIF…"/>
    <p className="mb-3 text-xs text-slate-400">{filtered.length} prestataire(s) affiché(s) sur {rows.length}. Cliquez sur une cellule pour modifier.</p><DataTable rows={filtered} columns={columns}/>
    <Modal open={!!editing} title={editing?.id === -1 ? "Nouveau prestataire" : "Modifier le prestataire"} onClose={() => setEditing(null)} description="Les données sont simulées et conservées en mémoire pendant la session.">
      <form className="grid gap-4 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); if (editing?.id === -1) { setRows((old) => [{ ...form, id: Math.max(0, ...old.map((r) => r.id)) + 1 }, ...old]); notify("Prestataire créé"); } else if (editing) { setRows((old) => old.map((r) => r.id === editing.id ? { ...form, id: r.id } : r)); notify("Prestataire modifié"); } setEditing(null); }}>
        {field("Nom du prestataire", "nom")}{field("Adresse", "adresse")}
        <div><label className="label">Statut</label><select className="field" value={form.statut} onChange={(e) => setForm((f) => ({ ...f, statut: e.target.value as Row["statut"] }))}><option value="PRIVE">Privé</option><option value="PUBLIC">Public</option></select></div>
        {field("NIF", "nif")}{field("STAT", "stat")}{field("Début convention", "dateDebutConvention", "date")}{field("Fin convention", "dateFinConvention", "date")}{field("Prestations couvertes", "listePrestation")}
        <div className="flex justify-end gap-2 md:col-span-2"><button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Annuler</button><button className="btn-primary">Enregistrer</button></div>
      </form>
    </Modal>
    <ConfirmDialog open={!!deleting} message={deleting ? `Supprimer ${deleting.nom} ?` : ""} onCancel={() => setDeleting(null)} onConfirm={() => { setRows((old) => deleting ? old.filter((r) => r.id !== deleting.id) : old); setDeleting(null); notify("Prestataire supprimé"); }}/>
  </>;
}
