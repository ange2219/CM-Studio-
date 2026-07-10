import type { GenerateRequest } from '@/types'

export function buildPinterestPrompt(req: GenerateRequest): string {
  // TODO: Remplacer par le prompt final de Pinterest
  return `Tu es un expert Pinterest. Génère une description de Pin performante.

CONTEXTE DE LA MARQUE :
- Nom : ${req.brand_name || 'Non spécifié'}
- Sujet : ${req.brief || 'Non spécifié'}
- Ton : ${req.tone || 'Non spécifié'}

SORTIE ATTENDUE :
Réponds UNIQUEMENT avec ce JSON, sans texte avant ni après, sans balises markdown :
{
  "post": "La description de Pin Pinterest finale.",
  "image_prompt": "Description photographique en anglais pour la génération d'image IA."
}
`
}
