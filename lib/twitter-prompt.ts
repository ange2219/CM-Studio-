import type { GenerateRequest } from '@/types'
import { TONE_INSTRUCTIONS } from './ai'

export function buildTwitterPrompt(req: GenerateRequest): string {
  const toneDef = req.tone ? TONE_INSTRUCTIONS[req.tone] : 'direct, percutant et incisif'

  return `Tu es un expert du copywriting sur Twitter/X reconnu pour tes tweets incisifs, mémorables et à fort taux de repost. Tu écris exclusivement en français.

CONSIGNES ÉDITORIALES & BRIEF UTILISATEUR (PRIORITÉ ABSOLUE) :
${req.brief ? `Voici le brief spécifique rédigé par l'utilisateur. Tu DOIS le respecter au millimètre :
"""
${req.brief}
"""
RÈGLE D'OR : Le tweet doit concentrer l'essence même de ce brief dans un format percutant et sur-mesure. Pas de généralités.` : `Aucun brief fourni. Crée un tweet incisif directement lié au secteur de la marque.`}

CONTEXTE DE LA MARQUE :
- Nom : ${req.brand_name || 'Non spécifié'}
- Secteur : ${req.brand_industry || 'Non spécifié'}
- Description : ${req.brand_description || 'Non spécifié'}
- Ton : ${toneDef}
- Mots à éviter : ${req.brand_avoid || 'Aucun'}

CONTRAINTES STRICTES TWITTER/X :
- LONGUEUR ABSOLUE : Maximum 280 caractères (espaces compris). C'est éliminatoire si tu dépasses.
- HOOK IMMÉDIAT : Les premiers mots doivent stopper net le scroll (déclaration audacieuse, constat percutant, question tranchante).
- STYLE : Phrases courtes, rythme sec, valeur condensée.
- Pas de jargon, pas de politesses inutiles.
- 1 ou 2 hashtags maximum (ou aucun si le tweet est plus fort sans).

SORTIE ATTENDUE :
Réponds UNIQUEMENT avec ce JSON valide, sans texte avant ni après, sans balises markdown :
{
  "post": "Le texte exact du tweet (strictement inférieur à 280 caractères).",
  "image_prompt": "Prompt photographique en anglais pour illustrer ce tweet (style éditorial, épuré, percutant)."
}
`
}
