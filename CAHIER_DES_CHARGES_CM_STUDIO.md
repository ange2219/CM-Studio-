# CAHIER DES CHARGES FONCTIONNEL ET TECHNIQUE (CdCFT)

**Produit :** CM Studio  
**Sous-titre :** La plateforme SaaS tout-en-un de création, planification et collaboration dédiée aux Community Managers  
**Version :** 1.0  
**Statut :** Document de Référence Produit & Ingénierie  
**Technologies de référence :** Next.js 14 (App Router), Supabase (PostgreSQL, Auth, Realtime, Storage), Anthropic Claude / OpenAI, Meta Graph API & LinkedIn API  

---

## Sommaire

1. [Introduction & Contexte](#1-introduction--contexte)
2. [Objectifs du Produit](#2-objectifs-du-produit)
3. [Public Cible & Personas](#3-public-cible--personas)
4. [Périmètre Fonctionnel Détaillé](#4-périmètre-fonctionnel-détaillé)
   - [4.1 Génération de Contenu IA](#41-moteur-de-génération-de-contenu-ia)
   - [4.2 Planification & Publication Multi-Plateforme](#42-planification--publication-multi-plateforme)
   - [4.3 Fil Social Communautaire & Réseau Interne](#43-fil-social-communautaire--réseau-interne)
   - [4.4 Gestion Multi-Organisation & Collaboration](#44-gestion-multi-organisation--collaboration)
   - [4.5 Sécurité Applicative & Robustesse des Flux](#45-sécurité-applicative--robustesse-des-flux)
   - [4.6 Onboarding & Compte Utilisateur](#46-onboarding--compte-utilisateur)
   - [4.7 Tarification, Modèle Économique & Quotas](#47-tarification-modèle-économique--quotas)
5. [Exigences Non-Fonctionnelles](#5-exigences-non-fonctionnelles)
6. [Architecture Technique (Vue d'ensemble)](#6-architecture-technique-vue-densemble)
7. [Contraintes](#7-contraintes)
8. [Périmètre d'Exclusion (Hors Périmètre)](#8-périmètre-dexclusion-hors-périmètre)
9. [Roadmap Produit & Priorisation](#9-roadmap-produit--priorisation)
10. [Annexes](#10-annexes)

---

## 1. Introduction & Contexte

### 1.1 Contexte du Projet
Dans un paysage numérique saturé où la présence sur les réseaux sociaux conditionne la notoriété et la conversion des marques, les **Community Managers (CM)**, les agences de communication et les créateurs de contenu font face à une charge de travail exponentielle. La gestion manuelle de multiples clients, la déclinaison de publications sur divers canaux et le manque d'inspiration représentent un goulot d'étranglement majeur.

**CM Studio** est une solution logicielle SaaS (Software as a Service) de nouvelle génération conçue spécifiquement pour éliminer ces frictions grâce à une alliance unique :
- Un moteur d'intelligence artificielle fondé sur un **véritable prompt engineering par réseau social**,
- Une suite complète de **planification et d'analyse multi-plateforme**,
- Un **espace communautaire intégré** favorisant l'entraide, le réseautage professionnel et l'émulation par la gamification.

### 1.2 Problématique Résolue
Les outils actuels du marché souffrent de deux écueils majeurs :
1. **L'illusion du "Repurposing" générique :** Des solutions comme *Predis.ai* ou les générateurs d'écriture génériques se contentent de reformuler un même texte brut sans adapter la structure narrative, les codes typographiques ou les contraintes d'affichage (ex. césure du hook mobile) propres à chaque réseau.
2. **La fragmentation des outils :** Les professionnels jonglent entre ChatGPT pour rédiger, Canva/Midjourney pour illustrer, Notion pour briefer leurs clients, Buffer/Hootsuite pour planifier, et des groupes WhatsApp/Slack pour échanger entre pairs.

CM Studio centralise l'intégralité de cette chaîne de valeur dans un espace collaboratif étanche et optimisé.

### 1.3 Positionnement Stratégique & Facteurs Différenciateurs
- **Prompt Engineering Spécifique vs. Repurposing Basique :** Chaque réseau dispose d'une logique rédactionnelle dédiée (ex. framework AIDA/PAS/BAB pour Facebook, formats Storytelling/Conseil/Analyse pour LinkedIn, contraintes de caractères strictes, etc.).
- **Grounding Web Temps Réel :** L'IA enrichit ses propositions à l'aide de données d'actualité et de recherches web factuelles vérifiées.
- **Architecture Multi-Organisation Native :** Gestion fluide de plusieurs marques et clients au sein d'une interface unifiée sans déconnexion.
- **Communauté & Gamification Natives :** Création d'un écosystème social interne valorisant l'expertise des CMs par des cercles débloqués selon leur audience.

### 1.4 Marché Cible & Stratégie d'Expansion
- **Positionnement Global :** Produit internationalisé, multi-devises et multi-langues, répondant aux standards des marchés européen, nord-américain et émergents.
- **Marché de Lancement Initial (Go-To-Market) : L'Afrique francophone et anglophone.** Ce marché se caractérise par une adoption massive du mobile, une explosion des PME digitalisées et une communauté de créateurs et CMs très active mais mal desservie par les outils occidentaux souvent surévalués en termes de coûts et déconnectés des réalités locales.

---

## 2. Objectifs du Produit

### 2.1 Objectifs Business
| Indicateur Clé (KPI) | Cible à 6 mois (Post-MVP) | Cible à 12 mois |
| :--- | :--- | :--- |
| **Utilisateurs Inscrits** | 5 000 utilisateurs | 25 000 utilisateurs |
| **Taux de Conversion (Free to Paid)** | 4,5 % | 7,0 % |
| **Revenu Récurrent Mensuel (MRR)** | 10 000 $ | 65 000 $ |
| **Taux de Rétention M+3** | > 40 % | > 55 % |
| **Publications générées & programmées** | 50 000 posts / mois | 350 000 posts / mois |

### 2.2 Objectifs Utilisateurs
- **Gain de temps :** Réduire de 70 % le temps passé à concevoir et décliner une campagne hebdomadaire.
- **Qualité & Rigueur Copywriting :** Supprimer le syndrome de la page blanche en garantissant des accroches (hooks) calibrées pour stopper le scroll.
- **Visibilité et Collaboration :** Offrir aux agences un espace clair pour faire valider et partager les créations avec les clients et collaborateurs.

---

## 3. Public Cible & Personas

### 3.1 Persona 1 : Le CM Freelance / Solopreneur
- **Identité :** Sarah, 26 ans, Community Manager indépendante (gère 5 clients distincts).
- **Attentes :** Rapidité de création, switch rapide d'une identité de marque à l'autre, inspiration continue sans fatigue mentale.
- **Frustrations :** Coût cumulé des abonnements (ChatGPT Plus + Canva Pro + Buffer + Midjourney), posts IA trop "robotiques" ou inadaptés aux réseaux B2B.

### 3.2 Persona 2 : Le Directeur de Pôle Social Media en Agence
- **Identité :** Marc, 34 ans, Responsable Social Media dans une agence de 15 personnes.
- **Attentes :** Gestion multi-comptes sécurisée, attribution des rôles aux juniors/rédacteurs, calendrier global partagé, cohérence de marque.
- **Frustrations :** Risque de fuite de données entre clients, perte de temps lors des allers-retours de relecture.

### 3.3 Persona 3 : Le Responsable Marketing / Communication de PME
- **Identité :** Aïcha, 31 ans, Responsable Marketing généraliste dans une scale-up en croissance.
- **Attentes :** Autonomie complète sur les réseaux sans être une copywriter professionnelle chevronnée, posts visuellement qualitatifs avec images générées cohérentes.
- **Frustrations :** Manque de budget pour externaliser auprès d'une grande agence, méconnaissance des algorithmes spécifiques de chaque réseau.

---

## 4. Périmètre Fonctionnel Détaillé

### 4.1 Moteur de Génération de Contenu IA

#### 4.1.1 Description
Le module d'IA de CM Studio ne se limite pas à un champ de prompt générique. Il guide l'utilisateur à travers un tunnel structuré en 3 étapes : **Idées (Angles) → Brief éditorial → Post final optimisé**, avec recherche web active et génération d'illustrations adaptées.

#### 4.1.2 Fonctionnalités & Spécifications Détaillées

##### A. Tunnel de Génération en 3 Étapes
1. **Étape 1 - Génération d'Idées :** À partir des piliers éditoriaux de la marque et de la thématique choisie, le système propose 3 à 5 angles originaux accompagnés chacun d'un type de post et d'une ébauche de hook.
2. **Étape 2 - Affinement du Brief :** L'utilisateur sélectionne un angle ; le moteur produit un brief structuré (problème soulevé, angle d'attaque, points clés, appel à l'action visé) que l'utilisateur peut amender.
3. **Étape 3 - Génération du Post Final :** L'IA rédige la version complète adaptée aux contraintes strictes des plateformes sélectionnées.

##### B. Détection & Typologie de Posts par Plateforme
Le système applique des gabarits structurels selon le réseau :
- **LinkedIn :**
  - *Storytelling* : Récit d'apprentissage, vulnérabilité, pivot, morale actionnable.
  - *Analyse* : Décomposition factuelle d'une tendance de marché avec données.
  - *Conseil / How-To* : Étapes d'action numérotées, chaque point étant étayé par 2-3 phrases d'application concrète.
  - *Liste / Ressources* : Synthèse d'outils ou d'enseignements directs.
  - *Profil / Portrait* : Mise en valeur d'un parcours ou d'une étude de cas.
- **Facebook :** Formats conversationnels, récits de transformation, formats questions-débats.
- **Instagram / Threads / X (Twitter) / TikTok / Pinterest / YouTube :** Ajustement dynamique de la longueur, du nombre de hashtags autorisés et des métadonnées (descriptions, prompts visuels).

##### C. Les 5 Tons de Rédaction Calibrés
Chaque génération applique rigoureusement l'un des 5 tons disponibles :
1. **Direct :** Tranchant, sans détour, pointe l'erreur commise par le lecteur dès la première phrase, supprime tout mot creux.
2. **Inspirant :** Encourageant, visionnaire, axé sur la persévérance et le dépassement de soi.
3. **Émotionnel :** Humain, authentique, axé sur la vulnérabilité sincère et l'empathie.
4. **Humoristique :** Léger, autodérision, métaphores du quotidien, engageant et souriant.
5. **Professionnel :** Factuel, crédible, fondé sur des méthodologies claires et des terminologies métier soignées.

##### D. Frameworks Copywriting & Contraintes Mobiles
- **Facebook :** Intégration systématique des frameworks **AIDA** (Attention, Intérêt, Désir, Action), **PAS** (Problème, Agitation, Solution) ou **BAB** (Before, After, Bridge).
- **Contrainte de Hook Mobile Facebook :** Les 125 premiers caractères constituent le hook critique avant le bouton "Voir plus" et doivent former une unité de sens autonome qui incite au clic.
- **Contrainte de Hook LinkedIn :** 1 à 2 phrases percutantes maximum (< 200 caractères) avec saut de ligne obligatoire avant le corps du texte.
- **Règle Typographique :** Exclusion des balises Markdown non supportées nativement par les réseaux sociaux (pas de gras brut s'il n'est pas converti en caractères Unicode compatibles, formatage aéré).

##### E. Génération d'Images IA
- Création automatique d'un `image_prompt` en anglais hautement descriptif (style photographique, lumière, composition) en corrélation avec le sujet du post.
- Génération de l'image via modèle d'imagerie IA et stockage persistant dans le CDN Supabase Storage.

##### F. Grounding & Recherche Web Active
- Possibilité d'activer la recherche web temps réel lors de la génération.
- Condition d'usage : Les chiffres, statistiques et tendances ne sont injectés que si le type de post l'exige structurellement (analyses, benchmarks). L'IA cite des données fiables et vérifiées sans hallucination.

#### 4.1.3 User Stories & Critères d'Acceptation
- **User Story 1.1 :** *En tant que Community Manager, je veux générer des idées de posts à partir des piliers de ma marque afin de ne jamais être à court de sujets d'engagement.*
  - **Critère d'acceptation :** Étant donné une organisation configurée avec un secteur d'activité et des piliers de contenu, quand l'utilisateur clique sur "Générer des idées", alors le système retourne au moins 3 concepts distincts avec angle, type de post et hook préliminaire en moins de 5 secondes.
- **User Story 1.2 :** *En tant que créateur de contenu, je veux que mon post Facebook respecte la règle des 125 premiers caractères afin de maximiser le taux de clic sur "Voir plus" sur mobile.*
  - **Critère d'acceptation :** Étant donné la sélection de la plateforme Facebook et du framework "PAS", quand le post est généré, alors la première phrase avant le premier retour chariot ne dépasse pas 125 caractères et pose le problème de façon intelligible.
- **User Story 1.3 :** *En tant qu'utilisateur, je veux obtenir une illustration IA cohérente avec mon post afin de publier un contenu visuel complet sans passer par un outil externe.*
  - **Critère d'acceptation :** Étant donné un post généré avec succès, quand l'utilisateur clique sur "Générer l'image", alors l'image est générée, prévisualisée dans l'éditeur et téléversée dans le bucket `posts-media` de l'organisation.

---

### 4.2 Planification & Publication Multi-Plateforme

#### 4.2.1 Description
Permet aux utilisateurs de relier leurs présences sociales, de planifier la diffusion automatique de leurs créations à une date et heure définies, et de visualiser la chronologie dans un calendrier éditorial interactif.

#### 4.2.2 Fonctionnalités & Spécifications Détaillées
- **Connexion OAuth Sécurisée :**
  - Connexion des pages et comptes professionnels via Meta Graph API (Facebook Pages, Instagram Business).
  - Connexion des profils et pages entreprises via LinkedIn OAuth 2.0.
  - Gestion des tokens d'accès longue durée (refresh automatique avant expiration).
  - Passerelle multi-réseaux via connecteur Zernio / Ayrshare.
- **Calendrier de Publication Interactif :**
  - Vues mensuelle, hebdomadaire et quotidienne.
  - Déplacement des publications par glisser-déposer (drag-and-drop) avec recalcul automatique des dates d'envoi.
  - Filtre par plateforme, statut de publication et créateur.
- **Gestion des Statuts de Publication :**
  - Statuts gérés : `draft` (Brouillon), `scheduled` (Programmé), `published` (Publié), `partial` (Publié partiellement), `failed` (Échec), `deleted` (Archivé).
- **Tableau de Bord & Analytics de Performance :**
  - Suivi des métriques clés post-publication : Likes, Commentaires, Partages, Portée (Reach), Impressions.
  - Calcul du taux d'engagement moyen par plateforme et par type de post.

#### 4.2.3 User Stories & Critères d'Acceptation
- **User Story 2.1 :** *En tant que CM, je veux programmer un post pour vendredi prochain à 18h00 afin que la publication soit automatisée sans mon intervention.*
  - **Critère d'acceptation :** Étant donné un post validé avec médias rattachés, quand l'utilisateur sélectionne une date future et valide la programmation, alors le statut passe à `scheduled`, l'événement apparaît sur le calendrier, et le cron de publication diffuse le post à l'heure exacte.
- **User Story 2.2 :** *En tant qu'administrateur, je veux être alerté en cas d'échec de publication (ex. token expiré) afin de corriger le problème immédiatement.*
  - **Critère d'acceptation :** Étant donné une tentative de publication en échec retournée par l'API Meta/LinkedIn, quand le webhook ou le job de publication capture l'erreur, alors le statut du post passe à `failed`, le champ `error_message` est renseigné et une notification d'alerte critique est transmise à l'utilisateur.

---

### 4.3 Fil Social Communautaire & Réseau Interne

#### 4.3.1 Description
CM Studio intègre un réseau social interne complet dédié aux community managers. Cet espace favorise le partage des meilleures pratiques, la recherche de missions, le feedback entre pairs et la valorisation des compétences grâce à un système de réputation gamifié.

#### 4.3.2 Fonctionnalités & Spécifications Détaillées
- **Fil d'Actualité (Community Feed) :**
  - Publication de posts internes texte + médias (captures de résultats, retours d'expérience).
  - Interactions complètes : Likes sur les posts, Commentaires en fil imbriqué (threads multiniveaux), Likes sur les commentaires individuels.
  - Partages internes et mise en Favoris / Bookmarks (consultables dans un onglet privé dédié sur le profil).
- **Système Social de Follow / Mutual-Follow :**
  - Possibilité de suivre d'autres membres de la plateforme.
  - Détection automatique des abonnements réciproques ("Mutual Follow") pour débloquer des interactions enrichies.
- **Profils Publics & Présentation :**
  - Page de profil public accessible via slug/username (`/profile/[username]`).
  - Bio, avatar personnalisé, badge de niveau d'expertise, compteur de followers/following, liste des liens cliquables externes (portfolio, site web, LinkedIn).
- **Messagerie Privée en Temps Réel :**
  - Discussions 1-to-1 instantanées via Supabase Realtime.
  - Gestion des conversations, liste des participants, indicateurs de lecture (statut lu / non-lu) et compteurs de messages non consultés.
- **Système de Notifications Dual & Agrégateur Intelligent :**
  - Séparation stricte de deux catégories de notifications :
    1. *Notifications Internes CM Studio :* Likes, commentaires, mentions, nouveaux followers, déblocage de niveau.
    2. *Notifications Réseaux Sociaux :* Statuts de programmation, alertes de publication réussie ou échouée.
  - **Agrégation Intelligente :** Les interactions multiples sur une même ressource sont fusionnées pour éviter le spam :
    - 1 interaction : *"Sarah a aimé votre post."*
    - 2 interactions : *"Sarah et Marc ont aimé votre post."*
    - 3+ interactions : *"Sarah, Marc et 3 autres personnes ont aimé votre post."*
- **Groupes Privés Thématiques & Déblocage par Gamification :**
  - Accès aux salons et groupes de discussion restreint par des seuils de réputation basés sur le nombre de followers réels sur CM Studio :
    - **Bronze / Initiés :** Accessible dès 10 followers.
    - **Argent / Experts :** Accessible dès 50 followers.
    - **Or / Leaders :** Accessible dès 100 followers.
    - **Diamant / Légendes :** Accessible dès 500 followers.

#### 4.3.3 User Stories & Critères d'Acceptation
- **User Story 3.1 :** *En tant qu'utilisateur, je veux enregistrer un post communautaire en favori afin de pouvoir le consulter plus tard sur mon profil personnel.*
  - **Critère d'acceptation :** Étant donné un post affiché sur le fil communautaire, quand l'utilisateur clique sur l'icône "Signet / Favori", alors l'état est persisté en base de données, et le post apparaît immédiatement dans la sous-vue "Favoris" de son profil personnel.
- **User Story 3.2 :** *En tant que membre actif, je veux accéder au groupe "Cercle des Initiés" dès que j'atteins 10 abonnés pour échanger avec mes pairs.*
  - **Critère d'acceptation :** Étant donné un utilisateur dont le compteur d'abonnés passe de 9 à 10, quand l'événement est enregistré, alors la politique d'accès RLS le déclare éligible et le groupe devient immédiatement accessible en écriture et lecture dans la navigation.

---

### 4.4 Gestion Multi-Organisation & Collaboration

#### 4.4.1 Description
Permet à un utilisateur (notamment les agences et freelances) de gérer plusieurs marques ou espaces de travail indépendants (`organizations`) avec une étanchéité absolue des données et une gestion fine des droits d'accès des membres (`memberships`).

#### 4.4.2 Structure des Rôles & Matrice des Permissions

| Rôle | Description | Droits sur les Posts | Gestion des Comptes Sociaux | Gestion de l'Équipe & Facturation |
| :--- | :--- | :--- | :--- | :--- |
| **Owner** | Propriétaire de l'espace | Création, Édition, Suppression, Programmation | Connexion / Déconnexion des comptes | Invitation, Modification des rôles, Gestion de l'abonnement Stripe |
| **CM (Éditeur)** | Gestionnaire de contenu | Création, Édition, Programmation | Utilisation des comptes connectés | Aucune action administrative |
| **Viewer (Lecteur)** | Client ou relecteur | Lecture seule, Ajout de commentaires de relecture | Consultation seule | Aucun droit de gestion |

#### 4.4.3 Fonctionnalités Détaillées
- **Switcher d'Organisation Instantané :** Menu déroulant accessible dans la barre latérale permettant de basculer d'un workspace à l'autre sans recharger l'application.
- **Collaboration sur les Publications :** Les membres d'une même organisation visualisent les brouillons communs et peuvent annoter un post avant son approbation.
- **Isolation des Données (Multi-Tenancy) :** Toutes les entités (`posts`, `social_accounts`, `analytics`, `media`) portent une clé étrangère `organization_id` indexée et protégée par RLS.

---

### 4.5 Sécurité Applicative & Robustesse des Flux

1. **Row Level Security (RLS) Exhaustive :** Aucune table applicative (`organizations`, `memberships`, `posts`, `social_accounts`, `notifications`, `messages`, `groups`) ne peut être requêtée sans politique RLS explicite. Vérification de `auth.uid()` via la fonction sécurisée `is_org_member(org_id, allowed_roles)`.
2. **Validation des Données d'Entrée (Schémas Zod) :** Toutes les routes API (`app/api/*`) valident le corps des requêtes via des schémas TypeScript/Zod stricts avant tout traitement logique.
3. **Résilience des Appels IA :** Timeout strict configuré à 25 secondes sur les requêtes LLM/Imagerie et retry exponentiel (3 tentatives max avec jitter) en cas d'erreur transitoire (503/429).
4. **Vérification des Signatures de Webhooks :** Tout webhook reçu (ex. Meta, Stripe, Zernio) fait l'objet d'une vérification de signature cryptographique (HMAC-SHA256).
5. **Rate Limiting Global & Par Route :** Limitation des requêtes sur les endpoints sensibles (authentification : 5 req/min, génération IA : 10 req/min/utilisateur).
6. **Fonctions PostgreSQL Sécurisées :** Toutes les fonctions stockées `SECURITY DEFINER` spécifient explicitement `SET search_path = public` pour prévenir les failles de détournement de schéma.

---

### 4.6 Onboarding & Compte Utilisateur

- **Inscription Fluide :** Email/Mot de passe sécurisé ou Google OAuth.
- **Assistant d'Onboarding en 3 Étapes :**
  1. *Étape 1 :* Nom de la première marque / organisation, secteur et audience cible.
  2. *Étape 2 :* Piliers de contenu et positionnement de marque.
  3. *Étape 3 :* Connexion optionnelle d'un premier compte ou premier test de génération.
- **Paramètres :** Profil personnel, gestion de mot de passe, avatar, et configuration de marque.

---

### 4.7 Tarification, Modèle Économique & Quotas

#### 4.7.1 Grille Tarifaire & Tiers d'Abonnement

| Fonctionnalité / Quota | Plan Gratuit (Free) | Plan Premium (Pro) | Plan Business (Agence) |
| :--- | :--- | :--- | :--- |
| **Cible** | Découverte & Test | CM Freelance | Agences & PME |
| **Tarif indicatif** | 0 $ / mois | 29 $ / mois | 79 $ / mois |
| **Organisations / Marques** | 1 organisation | Jusqu'à 3 organisations | 10 organisations |
| **Générations IA texte** | 10 / semaine | 100 / semaine | Illimitées |
| **Générations d'images IA** | 3 / semaine | 30 / semaine | 150 / semaine |
| **Comptes sociaux connectés** | 2 comptes | Jusqu'à 10 comptes | Illimités |
| **Collaboration d'équipe** | 1 utilisateur | 2 membres / org | Membres illimités |
| **Support** | Communautaire | Prioritaire par email | Dédié & Session d'onboarding |

#### 4.7.2 Facturation & Gestion des Quotas
- Intégration complète avec **Stripe Billing & Checkout**.
- Portail client Stripe en libre-service pour la gestion des moyens de paiement et factures.
- Modal d'upgrade contextuelle en cas d'atteinte des quotas hebdomadaires.

---

## 5. Exigences Non-Fonctionnelles

- **Sécurité :** Chiffrement TLS 1.3 en transit, AES-256 au repos, tokens OAuth chiffrés en base de données, conformité aux principes RGPD.
- **Performance :** LCP < 1,8 s, FID < 100 ms, CLS < 0,1. Streaming UI via Server-Sent Events pour un affichage du premier token IA en moins de 800 ms.
- **Scalabilité :** Architecture Edge/Serverless Next.js sur Vercel, PostgreSQL Supabase infogéré avec réplication. Disponibilité cible (SLA) : 99,9 %.
- **Design UI/UX :** Style SaaS B2B compact et dense. *Border-radius* strictement calibré entre 10px et 14px (`rounded-xl`), espacements maîtrisés (`gap-3` / `gap-4`, paddings `p-4` / `p-5`).

---

## 6. Architecture Technique (Vue d'ensemble)

- **Frontend & Backend :** Next.js 14 (App Router, TypeScript, React Server Components).
- **Design System :** Tailwind CSS, Lucide Icons, composants compacts.
- **Base de Données & Services Backend :** Supabase (PostgreSQL 15+, Auth, Realtime, Storage).
- **Moteur d'IA :** Modèles Anthropic Claude 3.5 Sonnet / OpenAI avec recherche web active.
- **Intégrations Sociales :** Meta Graph API (Direct), LinkedIn REST API v2, passerelle Zernio/Ayrshare.
- **Facturation :** Stripe API & Webhooks.

---

## 7. Contraintes

- **Techniques :** Respect des quotas des APIs sociales (Meta Graph API : 200 appels/user/h). Gestion du rafraîchissement transparent des tokens OAuth.
- **Légales :** Respect strict des politiques développeurs Meta/LinkedIn, interdiction du scraping non autorisé, conformité RGPD.
- **Budgétaires :** Optimisation des coûts d'inférence IA via cache de prompts et compression WebP des médias générés.

---

## 8. Périmètre d'Exclusion (Hors Périmètre - Version Actuelle)

1. Éditeur de montage vidéo multi-pistes complet type CapCut.
2. Boîte de réception unifiée CRM omnicanale (gestion des DMs Instagram/Facebook externes).
3. Achat d'encarts publicitaires sponsorisés (Ads Manager).

---

## 9. Roadmap Produit & Priorisation (Matrice MoSCoW)

- **Phase 1 - MVP (Must Have) :**
  - Moteur de génération de post par plateforme avec 5 tons.
  - Architecture multi-organisation (`organizations`, `memberships`, rôles).
  - Politiques RLS actives sur toutes les tables.
  - Connexion OAuth Meta & LinkedIn et programmation de posts.
  - Calendrier interactif et tableau de bord des statuts.
- **Phase 2 - V1.5 (Should Have) :**
  - Tunnel en 3 étapes (Idées → Brief → Post) et grounding web.
  - Générateur d'images IA avec stockage CDN.
  - Feed communautaire, messagerie temps réel et notifications agrégées.
  - Système de groupes débloqués par seuils d'abonnés (gamification).
  - Intégration Stripe (Free / Pro / Agence).
- **Phase 3 - V2.0 (Could Have) :**
  - Suggestions automatiques de hashtags tendance par géolocalisation.
  - Export des rapports de performance au format PDF brandé pour les clients d'agences.

---

## 10. Annexes

### 10.1 Glossaire
- **AIDA / PAS / BAB :** Frameworks de copywriting (*Attention-Intérêt-Désir-Action*, *Problème-Agitation-Solution*, *Before-After-Bridge*).
- **Grounding :** Ancrage des réponses d'un LLM dans des données factuelles récentes via un moteur de recherche web.
- **RLS (Row Level Security) :** Contrôle d'accès granulaire aux données au niveau de la base de données PostgreSQL.
- **Multi-Tenancy :** Cloisonnement étanche des données de plusieurs clients au sein d'une même application.

### 10.2 Recommandations Complémentaires
1. **Cache de Prompts :** Mettre en cache les descriptions de marque pour réduire les coûts d'inférence IA de 50 %.
2. **PWA Mobile-First :** Développer un mode hors-ligne partiel pour le calendrier sur mobile pour le marché africain.
3. **Paiements Mobiles Locaux :** Compléter Stripe avec des passerelles comme *Paystack* ou *Wave/Mobile Money* pour accélérer la conversion en Afrique.
