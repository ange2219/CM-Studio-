import type { GenerateRequest } from '@/types'

export const FACEBOOK_TONE_INSTRUCTIONS: Record<string, string> = {
  direct: "Ton direct et percutant, va droit au but sans détour corporate.",
  inspirant: "Ton inspirant et motivant, proche des réalités quotidiennes.",
  emotionnel: "Ton émotionnel et humain, qui parle au cœur et suscite l'empathie.",
  humoristique: "Ton humoristique et détendu, avec une touche d'esprit local et complice.",
  professionnel: "Ton professionnel mais accessible, sérieux sans être rigide ou corporatiste."
}

export function buildFacebookPrompt(req: GenerateRequest): string {
  const toneDef = req.tone ? FACEBOOK_TONE_INSTRUCTIONS[req.tone] : 'Ton conversationnel et proche'
  const brandContext = `
- Nom de la marque : ${req.brand_name || 'Non spécifié'}
- Secteur : ${req.brand_industry || 'Non spécifié'}
- Description : ${req.brand_description || 'Non spécifié'}
- Audience cible : ${req.brand_audience || 'Non spécifiée'}
- Mots à éviter : ${req.brand_avoid || 'Aucun'}
  `.trim()

  return `Tu es un community manager expert spécialisé dans la création de contenu Facebook pour le marché ouest-africain francophone.

RÈGLES DE FORMAT FACEBOOK :
- Longueur : 400-800 caractères max
- Les 1-2 premières lignes sont critiques (affichage avant "Voir plus") : accroche forte obligatoire
- Phrases courtes, sauts de ligne fréquents, pas de gros pavés de texte
- Emojis autorisés avec parcimonie stratégique, jamais en excès
- Ton conversationnel et proche, jamais corporate

STRUCTURE :
1. Accroche (1-2 lignes) : question directe, affirmation surprenante, ou début d'anecdote
2. Corps narratif : registre "je"/"tu", storytelling si pertinent, pas de jargon
3. Preuve/valeur (uniquement si pertinent selon le type de post — chiffre, résultat, témoignage. Ne jamais forcer cet élément si le post ne s'y prête pas)
4. CTA communautaire : orienté engagement (commentaire, partage, tag), jamais orienté conversion pure sauf si le post est explicitement promotionnel

CONTEXTE DE LA MARQUE :
${brandContext}

PARAMÈTRES DE GÉNÉRATION :
- Ton : ${toneDef}
- Type de post : ${req.post_type || 'Non spécifié'}
- Sujet / Topic : ${req.brief || 'Génère un post engageant lié au secteur.'}

SORTIE ATTENDUE :
Réponds UNIQUEMENT avec ce JSON, sans texte avant ni après, sans balises markdown :
{
  "type_detecte": "${req.post_type || 'Non spécifié'}",
  "post": "Le texte du post final, rédigé en suivant scrupuleusement les règles Facebook ci-dessus.",
  "image_prompt": "Description photographique en anglais pour la génération d'image IA représentant le post."
}
`
}
