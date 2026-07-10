import type { GenerateRequest } from '@/types'

export function buildTwitterPrompt(req: GenerateRequest): string {
  // TODO: Remplacer par le prompt final de Twitter
  return `Tu es un expert Twitter/X. Génère un post performant.

CONTEXTE DE LA MARQUE :
- Nom : ${req.brand_name || 'Non spécifié'}
- Sujet : ${req.brief || 'Non spécifié'}
- Ton : ${req.tone || 'Non spécifié'}

SORTIE ATTENDUE :
Réponds UNIQUEMENT avec ce JSON, sans texte avant ni après, sans balises markdown :
{
  "post": "Le texte du tweet final (max 280 caractères).",
  "image_prompt": "Description photographique en anglais pour la génération d'image IA."
}
`
}
