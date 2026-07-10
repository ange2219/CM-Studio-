import type { GenerateRequest } from '@/types'

export function buildTiktokPrompt(req: GenerateRequest): string {
  // TODO: Remplacer par le prompt final de TikTok
  return `Tu es un expert TikTok. Génère un script de post performant.

CONTEXTE DE LA MARQUE :
- Nom : ${req.brand_name || 'Non spécifié'}
- Sujet : ${req.brief || 'Non spécifié'}
- Ton : ${req.tone || 'Non spécifié'}

SORTIE ATTENDUE :
Réponds UNIQUEMENT avec ce JSON, sans texte avant ni après, sans balises markdown :
{
  "post": "Le script du post TikTok (instructions visuelles + voix off).",
  "image_prompt": "Description photographique en anglais pour la génération d'image IA."
}
`
}
