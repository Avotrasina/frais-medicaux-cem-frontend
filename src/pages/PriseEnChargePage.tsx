import { FileDown, Plus, Printer, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge, statusTone } from "../components/Badge";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { DataTable, type Column } from "../components/DataTable";
import { InlineCell } from "../components/InlineCell";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { ResourceToolbar } from "../components/ResourceToolbar";
import { ToastViewport, notify } from "../components/Toast";
import { attestations as mockAttestations } from "../data/attestation";
import { beneficiaires } from "../data/beneficiaire";
import { prestataires } from "../data/prestataire";

type Row = {
  id: number;
  idpBeneficiaire: string;
  beneficiaire: string;
  prestataireID: number;
  prestataire: string;
  datValidation: string;
  naturePrestation: string;
  servicePrestataire: string;
  statut: string;
};
const initialRows = (): Row[] =>
  mockAttestations.map((a) => ({
    id: a.id,
    idpBeneficiaire: a.idpBeneficiaire,
    beneficiaire:
      beneficiaires.find((b) => b.idp === a.idpBeneficiaire)?.personne.nom ??
      "Bénéficiaire",
    prestataireID: a.prestataireID,
    prestataire:
      prestataires.find((p) => p.id === a.prestataireID)?.nom ?? "Prestataire",
    datValidation: a.dateValidation,
    naturePrestation: a.naturePrestation,
    servicePrestataire: a.servicePrestataire,
    statut: "VALIDÉE",
  }));
type Form = {
  idpBeneficiaire: string;
  prestataireID: number;
  datValidation: string;
  naturePrestation: string;
  servicePrestataire: string;
  statut: string;
};
const blank = (): Form => ({
  idpBeneficiaire: beneficiaires[0]?.idp ?? "",
  prestataireID: prestataires[0]?.id ?? 1,
  datValidation: new Date().toISOString().slice(0, 10),
  naturePrestation: "Consultation médicale",
  servicePrestataire: "Médecine générale",
  statut: "EN ATTENTE",
});
function printAttestation(row: Row) {
  const popup = window.open("", "_blank", "width=900,height=700");
  if (!popup) {
    notify(
      "Autorisez les fenêtres pop-up pour générer l'attestation.",
      "error",
    );
    return;
  }
  const safe = (v: string) =>
    v.replace(
      /[&<>"]/g,
      (c) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c,
    );
  popup.document.write(
    `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Attestation PEC ${row.id}</title><style>body{font:14px Arial,sans-serif;color:#222;margin:48px;line-height:1.7}header{border-bottom:3px solid #e30613;padding-bottom:16px}h1{text-align:center;margin:48px 0 32px;font-size:22px} .ref{color:#666;text-align:right}.box{border:1px solid #ddd;padding:24px;margin-top:24px}footer{margin-top:90px;text-align:right}</style></head><body><header><strong>CAISSE D'ÉPARGNE DE MADAGASCAR</strong><div>Gestion des frais médicaux</div></header><p class="ref">Référence : PEC-${String(row.id).padStart(4, "0")}<br>Date : ${safe(row.datValidation)}</p><h1>ATTESTATION DE PRISE EN CHARGE</h1><p>La Caisse d'Épargne de Madagascar atteste que le bénéficiaire ci-dessous est autorisé à bénéficier de la prestation indiquée auprès du prestataire désigné.</p><div class="box"><p><b>Identifiant bénéficiaire :</b> ${safe(row.idpBeneficiaire)}</p><p><b>Bénéficiaire :</b> ${safe(row.beneficiaire)}</p><p><b>Prestataire :</b> ${safe(row.prestataire)}</p><p><b>Nature de la prestation :</b> ${safe(row.naturePrestation)}</p><p><b>Service :</b> ${safe(row.servicePrestataire)}</p><p><b>Statut :</b> ${safe(row.statut)}</p></div><footer>La Direction des Ressources Humaines<br><br><br>Signature et cachet</footer><script>window.onload=()=>window.print()</script></body></html>`,
  );
  popup.document.close();
}
export default function PriseEnChargePage() {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Form>(blank());
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
      old.map((r) =>
        r.id === id
          ? ({
              ...r,
              [key]: value,
              ...(key === "idpBeneficiaire"
                ? {
                    beneficiaire:
                      beneficiaires.find((b) => b.idp === value)?.personne
                        .nom ?? "Bénéficiaire",
                  }
                : {}),
              ...(key === "prestataire"
                ? {
                    prestataireID:
                      prestataires.find((p) => p.nom === value)?.id ??
                      r.prestataireID,
                  }
                : {}),
            } as Row)
          : r,
      ),
    );
    notify("Prise en charge mise à jour");
  };
  const columns: Column<Row>[] = [
    {
      key: "id",
      label: "Référence",
      render: (r) => (
        <span className="font-mono text-xs font-bold">
          PEC-{String(r.id).padStart(4, "0")}
        </span>
      ),
    },
    {
      key: "idpBeneficiaire",
      label: "IDP bénéficiaire",
      render: (r) => (
        <InlineCell
          value={r.idpBeneficiaire}
          onSave={(v) => update(r.id, "idpBeneficiaire", v)}
        />
      ),
    },
    {
      key: "beneficiaire",
      label: "Bénéficiaire",
      render: (r) => <span>{r.beneficiaire}</span>,
    },
    {
      key: "prestataire",
      label: "Prestataire",
      render: (r) => (
        <InlineCell
          value={r.prestataire}
          onSave={(v) => update(r.id, "prestataire", v)}
        />
      ),
    },
    {
      key: "datValidation",
      label: "Date",
      render: (r) => (
        <InlineCell
          value={r.datValidation}
          onSave={(v) => update(r.id, "datValidation", v)}
        />
      ),
    },
    {
      key: "naturePrestation",
      label: "Nature prestation",
      render: (r) => (
        <InlineCell
          value={r.naturePrestation}
          onSave={(v) => update(r.id, "naturePrestation", v)}
        />
      ),
    },
    {
      key: "servicePrestataire",
      label: "Service",
      render: (r) => (
        <InlineCell
          value={r.servicePrestataire}
          onSave={(v) => update(r.id, "servicePrestataire", v)}
        />
      ),
    },
    {
      key: "statut",
      label: "Statut",
      render: (r) => (
        <select
          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
          value={r.statut}
          onChange={(e) => update(r.id, "statut", e.target.value)}
        >
          <option>EN ATTENTE</option>
          <option>VALIDÉE</option>
          <option>REFUSÉE</option>
        </select>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex gap-1">
          <button
            className="btn-ghost"
            title="Générer l'attestation PDF"
            onClick={() => printAttestation(r)}
          >
            <FileDown size={15} />
          </button>
          <button
            className="btn-ghost"
            title="Imprimer"
            onClick={() => printAttestation(r)}
          >
            <Printer size={15} />
          </button>
          <button
            className="btn-ghost text-red-600"
            title="Supprimer"
            onClick={() => setDeleting(r)}
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];
  return (
    <>
      <ToastViewport />
      <PageHeader
        title="Prises en charge"
        description="Création et suivi des demandes d'attestation de prise en charge médicale."
        actions={
          <button
            className="btn-primary"
            onClick={() => {
              setForm(blank());
              setEditing({
                id: -1,
                ...blank(),
                beneficiaire: "",
                prestataire: "",
              });
            }}
          >
            <Plus size={16} /> Nouvelle demande
          </button>
        }
      />
      <ResourceToolbar
        value={query}
        onChange={setQuery}
        placeholder="Rechercher une référence, un bénéficiaire, un prestataire…"
      />
      <p className="mb-3 text-xs text-slate-400">
        {filtered.length} prise(s) en charge affichée(s). L'attestation peut
        être imprimée ou enregistrée au format PDF.
      </p>
      <DataTable rows={filtered} columns={columns} />
      <Modal
        open={!!editing}
        title="Nouvelle demande de prise en charge"
        description="Choisissez un bénéficiaire et un prestataire avant de générer l'attestation."
        onClose={() => setEditing(null)}
      >
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const b = beneficiaires.find((x) => x.idp === form.idpBeneficiaire);
            const p = prestataires.find(
              (x) => x.id === Number(form.prestataireID),
            );
            if (!b || !p) {
              notify(
                "Sélectionnez un bénéficiaire et un prestataire valides.",
                "error",
              );
              return;
            }
            const row: Row = {
              ...form,
              id: Math.max(0, ...rows.map((r) => r.id)) + 1,
              beneficiaire: `${b.personne.nom} ${b.personne.prenom}`,
              prestataire: p.nom,
              prestataireID: p.id,
            };
            setRows((old) => [row, ...old]);
            setEditing(null);
            notify("Demande de prise en charge créée");
          }}
        >
          <div>
            <label className="label">Bénéficiaire</label>
            <select
              required
              className="field"
              value={form.idpBeneficiaire}
              onChange={(e) =>
                setForm((f) => ({ ...f, idpBeneficiaire: e.target.value }))
              }
            >
              {beneficiaires.map((b) => (
                <option key={b.id} value={b.idp}>
                  {b.idp} — {b.personne.nom} {b.personne.prenom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Prestataire</label>
            <select
              required
              className="field"
              value={form.prestataireID}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  prestataireID: Number(e.target.value),
                }))
              }
            >
              {prestataires.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Date de demande</label>
            <input
              required
              type="date"
              className="field"
              value={form.datValidation}
              onChange={(e) =>
                setForm((f) => ({ ...f, datValidation: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="label">Nature de la prestation</label>
            <input
              required
              className="field"
              value={form.naturePrestation}
              onChange={(e) =>
                setForm((f) => ({ ...f, naturePrestation: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="label">Service</label>
            <input
              required
              className="field"
              value={form.servicePrestataire}
              onChange={(e) =>
                setForm((f) => ({ ...f, servicePrestataire: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="label">Statut</label>
            <select
              className="field"
              value={form.statut}
              onChange={(e) =>
                setForm((f) => ({ ...f, statut: e.target.value }))
              }
            >
              <option>EN ATTENTE</option>
              <option>VALIDÉE</option>
              <option>REFUSÉE</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 md:col-span-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setEditing(null)}
            >
              Annuler
            </button>
            <button className="btn-primary">Créer la demande</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        open={!!deleting}
        message={deleting ? `Supprimer la demande PEC-${deleting.id} ?` : ""}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          setRows((old) =>
            deleting ? old.filter((r) => r.id !== deleting.id) : old,
          );
          setDeleting(null);
          notify("Prise en charge supprimée");
        }}
      />
    </>
  );
}
