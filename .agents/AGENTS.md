# Règles de Design UI/UX (SaaS Premium & Compact)

Lors de la création ou de la modification de composants, vous devez strictement respecter ces règles pour garantir une interface de type "SaaS moderne, dense, compact et premium" :

1. **Border-Radius (Arrondis)**
   - Utilisez des coins *légèrement* arrondis, jamais excessivement arrondis.
   - La valeur idéale est comprise entre 10px et 14px (par exemple `rounded-xl` avec Tailwind, ou `border-radius: 12px` en CSS standard).
   - Évitez absolument les `20px+`, `rounded-2xl`, `rounded-3xl` pour les cartes.

2. **Espacements (Gaps, Margins, Paddings)**
   - Les cartes doivent être proches les unes des autres (presque collées, avec une légère séparation).
   - Les `gap` entre éléments structurants (colonnes, grilles, cartes) ne doivent pas dépasser 12px à 16px maximum (utilisez `gap-3` ou `gap-4`).
   - Évitez les styles "flottants" avec de grands espaces vides. 
   - Les paddings à l'intérieur des cartes doivent être denses (16px à 20px, par ex `p-4` ou `p-5`). Évitez les `p-6`, `p-8` excessifs.

3. **Alignement et Grille**
   - Assurez-vous d'un alignement strict sur grille, avec des marges externes discrètes.
   - Les layouts doivent maximiser l'espace écran sans paraître étouffants (la densité donne un aspect "pro").
