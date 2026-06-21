export interface ToneDefinition {
  name: string
  description: string
  rules: string[]
  contentRequirements: string[]
  hooksExamples: string[]
  fullPostExample: string
}

export const TONE_DEFINITIONS: Record<string, ToneDefinition> = {
  direct: {
    name: 'Direct',
    description: "Le ton Direct nomme une erreur que le lecteur commet sans le savoir. Il ne cherche pas à choquer pour choquer — il dit une vérité inconfortable que tout le monde évite de dire. Le lecteur doit se reconnaître dans la douleur décrite et être forcé de continuer à lire pour savoir comment s'en sortir.",
    rules: [
      'Accroche en 1 à 2 phrases maximum — courte, tranchante, sans introduction',
      "Pas de \"je vais vous expliquer\", pas de \"aujourd'hui on parle de\" — on rentre dedans immédiatement",
      'Utiliser "tu" ou "vous" — s\'adresser directement au lecteur',
      'Nommer la douleur précisément — pas "beaucoup de gens galèrent" mais "ton site reçoit des visites et personne n\'achète"',
      'Une seule idée centrale — pas de liste, pas de 5 points',
      'Saut de ligne après chaque idée forte — jamais de paragraphes longs',
      'Conclusion courte et directe — pas de morale, pas de bienveillance forcée',
      'Question finale qui force à se positionner'
    ],
    contentRequirements: [
      "Accroche qui gifle — identifie l'erreur ou la douleur",
      "Développement — explique pourquoi c'est un problème réel avec des détails concrets",
      "Retournement — révèle ce qu'il faudrait faire à la place",
      "CTA ou question — pousse à agir ou à répondre"
    ],
    hooksExamples: [
      '"T\'as un beau site ? Bravo. Mais zéro conversion pour toi."',
      '"Arrête d\'optimiser ton site pour être visité. Optimise-le pour être choisi."',
      '"Tu postes tous les jours sur LinkedIn. Personne ne t\'attend."',
      '"Ton problème n\'est pas le budget. C\'est que tu construis ce que tu veux, pas ce que ton client cherche."',
      '"Tu cherches plus de clients. Mais ton offre ne convainc même pas ta mère."'
    ],
    fullPostExample: `T'as un beau site ? Bravo.
Mais zéro conversion pour toi.

Pas parce que le design est raté.
Mais parce qu'un site beau et un site qui vend
ce sont deux choses complètement différentes.

Tu te reconnais là-dedans ?

Des visiteurs qui arrivent et repartent sans rien faire.
Google qui t'ignore au profit de concurrents moins bons que toi.
Un dev payé, une déception reçue.

Le problème n'est pas ton site.
C'est que personne ne t'a posé la bonne question avant de construire :
"Pourquoi ton client idéal te choisirait TOI plutôt qu'un autre ?"

Quand tu as la réponse — tu construis.
Pas avant.

Ton site, c'est quoi son obsession principale en ce moment ?`
  },
  inspirant: {
    name: 'Inspirant',
    description: "Le ton Inspirant motive l'audience, élève les esprits et encourage le dépassement de soi en partageant une vision ou une conviction forte.",
    rules: [
      "Utiliser un vocabulaire positif et orienté vers l'action",
      "Raconter des histoires de persévérance et de réussite",
      "Terminer par un message d'encouragement ou une vision d'avenir"
    ],
    contentRequirements: [
      "Accroche positive et engageante",
      "Partage d'une expérience inspirante ou d'un apprentissage clé",
      "Appel à l'action motivant"
    ],
    hooksExamples: [
      '"Chaque grand accomplissement commence par la décision d\'essayer."',
      '"N\'attends pas que les conditions soient parfaites pour commencer. Commence pour rendre les conditions parfaites."'
    ],
    fullPostExample: `Chaque matin est une nouvelle opportunité de repousser tes limites.
Peu importe où tu en es aujourd'hui, rappelle-toi que chaque grand leader a commencé exactement là où tu te trouves.

Le succès ne se mesure pas à l'absence de difficultés, mais à ta capacité à te relever après chaque obstacle.

Quel est le petit pas que tu vas faire aujourd'hui pour te rapprocher de ton rêve ?`
  },
  emotionnel: {
    name: 'Émotionnel',
    description: 'Le ton Émotionnel crée une connexion humaine profonde et authentique en partageant des émotions sincères (empathie, vulnérabilité, passion).',
    rules: [
      'Adopter une approche sincère et vulnérable',
      'Parler de ressentis réels plutôt que de faits froids',
      'Utiliser un langage sensible et évocateur'
    ],
    contentRequirements: [
      'Accroche captivante axée sur une émotion forte',
      "Récit authentique ou partage d'un moment de vulnérabilité",
      "Ouverture vers l'échange et le partage d'expérience"
    ],
    hooksExamples: [
      '"J\'ai failli tout abandonner la semaine dernière. Voici pourquoi."',
      '"La plus grande leçon que j\'ai apprise n\'est pas dans un livre, mais dans mes pires moments de doute."'
    ],
    fullPostExample: `Il y a des jours où le doute prend toute la place.
Où l'on se demande si tout ce travail en vaut vraiment la peine.

La semaine dernière, j'ai failli tout arrêter.
Fatigué(e), submergé(e), face à un mur.

Puis j'ai reçu ce message d'un client me disant que mon produit avait changé sa journée.
Et tout a pris son sens à nouveau.

Rappelez-vous pourquoi vous avez commencé, même quand la tempête fait rage.

Avez-vous déjà vécu un moment de doute qui s'est transformé en force ?`
  },
  humoristique: {
    name: 'Humoristique',
    description: "Le ton Humoristique divertit l'audience en utilisant l'autodérision, le second degré ou des anecdotes légères et drôles pour faire passer un message.",
    rules: [
      'Garder un ton léger et bienveillant',
      "Utiliser l'autodérision ou des situations du quotidien partagées par tous",
      "Éviter le sarcasme blessant ou l'humour trop technique"
    ],
    contentRequirements: [
      'Accroche amusante ou décalée',
      'Anecdote ou mise en situation comique',
      'Conclusion souriante ou question interactive et ludique'
    ],
    hooksExamples: [
      '"Mon café du matin a plus de motivation que moi un lundi."',
      '"J\'ai testé la productivité à 5h du matin. Mon lit a gagné par K.O."'
    ],
    fullPostExample: `J'ai lu un livre qui disait : "Le secret du succès est de se lever à 5h du matin".
Lundi, j'ai essayé.

5h00 : Le réveil sonne. Je me sens comme un super-héros.
5h05 : Je cherche mes chaussettes dans le noir. Je cogne mon orteil contre le lit.
5h10 : Je conclus que le succès est largement surestimé et je me rendors.

Leçon apprise : trouvez votre propre rythme, même s'il commence à 8h30 avec un double expresso.

Qui d'autre fait partie du club des "productifs mais après 8h" ?`
  },
  professionnel: {
    name: 'Professionnel',
    description: "Le ton Professionnel établit la crédibilité, l'expertise et le sérieux de la marque en transmettant des informations structurées, claires et de haute valeur ajoutée.",
    rules: [
      'Utiliser un langage précis, soigné et factuel',
      "Structurer clairement le propos avec des idées distinctes",
      "Fournir des données, des exemples concrets ou des frameworks reconnus"
    ],
    contentRequirements: [
      "Accroche captant l'intérêt sur un enjeu métier ou secteur",
      "Développement argumenté ou présentation de données de référence",
      "Conclusion synthétique et appel à l'action professionnel (ex : consultation, téléchargement)"
    ],
    hooksExamples: [
      '"Voici les 3 indicateurs clés de performance que chaque manager devrait suivre."',
      '"L\'évolution du marché exige une restructuration de nos modèles opérationnels. Analyse."'
    ],
    fullPostExample: `L'optimisation des processus opérationnels reste le levier principal de croissance pour les PME en 2026.
Une analyse récente montre que les entreprises automatisant leurs tâches répétitives augmentent leur productivité de 25%.

Voici les trois étapes clés pour initier cette transition :
1. Cartographier les flux de travail actuels pour identifier les goulets d'étranglement.
2. Sélectionner les outils d'automatisation adaptés à votre infrastructure existante.
3. Former vos collaborateurs pour faciliter la conduite du changement.

Une méthodologie rigoureuse garantit un retour sur investissement rapide.

Comment abordez-vous l'automatisation au sein de votre organisation ?`
  }
}
