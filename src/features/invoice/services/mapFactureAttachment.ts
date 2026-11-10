import type {
	PieceJointeFactureResponseDto,
	PieceJointeListeFactureResponseDto,
} from "../../../api/domains/facture";
import type { FactureGlobaleAttachment } from "../types/invoiceTable";

type PieceJointeApi =
	| PieceJointeFactureResponseDto
	| PieceJointeListeFactureResponseDto;

export function mapFactureAttachment(
	piece: PieceJointeApi,
): FactureGlobaleAttachment {
	return {
		id: String(piece.id),
		nom: piece.nomFichier ?? `Pièce jointe ${piece.id}`,
		taille: piece.tailleOctets,
		type: piece.typeFichier,
	};
}
