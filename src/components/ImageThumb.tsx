import { useEffect, useState } from "react";
import { resolveAgentCardUrl } from "../services/api";
import { resolveFamilyMemberCardUrl } from "../services/family";
import type { Beneficiary } from "../types/api";

function initials(value: string): string {
	const parts = value.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return "—";
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Displays a card served by the backend's image GET routes.
 */
export function ImageThumb({
	path,
	name,
	agentMatricule,
	familyMember,
	fit = "cover",
	size = 34,
}: {
	path?: string | null;
	name: string;
	agentMatricule?: string;
	familyMember?: Pick<
		Beneficiary,
		"matricule" | "nom" | "prenom" | "dateNaissance" | "sexe" | "codeFamille"
	>;
	fit?: "cover" | "contain";
	size?: number;
}) {
	const [resolvedImage, setResolvedImage] = useState<{
		key: string;
		url: string | null;
	} | null>(null);
	const [failedKey, setFailedKey] = useState<string | null>(null);
	const familyMatricule = familyMember?.matricule;
	const familyNom = familyMember?.nom;
	const familyPrenom = familyMember?.prenom;
	const familyDateNaissance = familyMember?.dateNaissance;
	const familySexe = familyMember?.sexe;
	const familyCode = familyMember?.codeFamille;
	const imageKey = [
		path ?? "",
		agentMatricule ?? "",
		familyMatricule ?? "",
		familyNom ?? "",
		familyPrenom ?? "",
		familyDateNaissance ?? "",
		familySexe ?? "",
		familyCode ?? "",
	].join("|");
	const url = agentMatricule
		? path
			? resolveAgentCardUrl(agentMatricule)
			: null
		: resolvedImage?.key === imageKey
			? resolvedImage.url
			: null;
	const failed = url !== null && failedKey === imageKey;

	useEffect(() => {
		let cancelled = false;
		if (
			!path ||
			agentMatricule ||
			!familyMatricule ||
			!familyNom ||
			!familyPrenom ||
			!familyDateNaissance ||
			!familySexe ||
			!familyCode
		)
			return;

		const familyIdentity = {
			matricule: familyMatricule,
			nom: familyNom,
			prenom: familyPrenom,
			dateNaissance: familyDateNaissance,
			sexe: familySexe,
			codeFamille: familyCode,
		};
		void resolveFamilyMemberCardUrl(familyIdentity)
			.then((imageUrl) => {
				if (!cancelled) setResolvedImage({ key: imageKey, url: imageUrl });
			})
			.catch(() => {
				if (!cancelled) setResolvedImage({ key: imageKey, url: null });
			});
		return () => {
			cancelled = true;
		};
	}, [
		path,
		imageKey,
		agentMatricule,
		familyMatricule,
		familyNom,
		familyPrenom,
		familyDateNaissance,
		familySexe,
		familyCode,
	]);

	if (!url || failed) {
		return (
			<span
				className="inline-flex shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-extrabold text-slate-500 ring-1 ring-slate-200"
				style={{ width: size, height: size }}
				title={path ? "Image non accessible" : "Aucune image"}
			>
				{initials(name)}
			</span>
		);
	}

	return (
		<img
			src={url}
			alt={`Carte de ${name}`}
			className="shrink-0 rounded-lg ring-1 ring-slate-200"
			style={{ width: size, height: size, objectFit: fit }}
			onError={() => setFailedKey(imageKey)}
		/>
	);
}
