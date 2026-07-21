# Documentation d'Implémentation : Restrictions KYC

**Projet** : CPU-PME Dashboard
**Date** : 21 juillet 2026
**Statut** : Implémentation partielle — voir [Écarts avec le document métier](#écarts-avec-le-document-métier)

---

## 📋 Table des matières

1. [Contexte](#contexte)
2. [Décision d'architecture : pourquoi pas `/entitlements`](#décision-darchitecture--pourquoi-pas-entitlements)
3. [Ce qui est implémenté](#ce-qui-est-implémenté)
4. [Fichiers créés / modifiés](#fichiers-créés--modifiés)
5. [Écarts avec le document métier](#écarts-avec-le-document-métier)
6. [Quand et comment basculer sur `/entitlements`](#quand-et-comment-basculer-sur-entitlements)
7. [Référence API](#référence-api)

---

## Contexte

Le document métier définit deux niveaux de KYC, qui correspondent en réalité à **deux niveaux du même dossier KYC** (`GET /api/adhesions/me/kyc`), identifiés par leur `code` de niveau (`targetKycLevel`/`currentKycLevel`) :

- **Niveau 1 — KYC "Standard"** (tout le monde) : 30 jours après la 1ère connexion pour fournir les documents. Une fois validé : compte actif + visible dans l'annuaire CPUPME. Passé le délai sans validation : profil retiré de l'annuaire public, services Marketplace suspendus, bannière rouge dans le dashboard.
- **Niveau 2 — KYC "Moyen"** (par service) : l'abonnement autorise à *créer* un contenu (boutique, événement, formation), mais c'est l'atteinte du niveau **Moyen** (soumis + approuvé) qui débloque les boutons créer/publier des modules métier.

⚠️ **Point corrigé le 21/07/2026** : on vérifiait initialement juste `kycCase.status === "approved"`, sans regarder *quel niveau* était approuvé. Un dossier peut être `approved` au niveau **Standard** (Niveau 1) sans que **Moyen** (Niveau 2) soit atteint — dans ce cas les boutons métier ne doivent **pas** se débloquer. Le code compare maintenant le `sortOrder` du niveau réellement atteint (`kycCase.currentKycLevel`) à celui du niveau `Moyen` (récupéré via `GET /api/adhesions/me/kyc/levels`), voir [`useKycStatus.ts`](#ce-qui-est-implémenté).

Deux endpoints backend existent pour ça :

- `GET /api/adhesions/me/kyc` → un dossier KYC unique par adhésion (statut, niveau cible/actuel, documents).
- `GET /api/adhesions/me/kyc/entitlements` (+ `?service=CODE`) → droits calculés par service (`allowed`, `reasons`, `requiredKycLevel`, `currentKycLevel`), un service par module métier.

## Décision d'architecture : pourquoi pas `/entitlements`

On a testé les deux. Résultat du test réel (voir [Référence API](#référence-api)) : sur les 7 `serviceCode` exposés par `/entitlements`, **5 renvoient `"Aucune règle d'accès configurée pour ce service"`** (`RFQ_CREATE`, `INCUBATOR_MANAGE`, `COMMUNITY_MANAGE`, `MARKETPLACE_PUBLISH`, `FORMATIONS_SELL`) — c'est-à-dire qu'aucune règle n'a encore été configurée côté backend pour ces services. `allowed` y restera `false` pour tout le monde, KYC validé ou non, tant que le backend n'aura pas configuré ces règles.

Seuls deux services ont une vraie règle aujourd'hui :
- `EVENTS_CREATE` : requiert le niveau `Associatif` (vrai écart de niveau KYC, logique et utile).
- `BOUTIQUE_CREATE` : une règle existe mais ne correspond pas au profil testé (raison différente d'un simple écart de niveau).

**Décision (validée avec l'utilisateur le 21/07/2026)** : en attendant que le backend finalise la configuration des règles `/entitlements`, on reste sur le dossier KYC unique (`/api/adhesions/me/kyc`) comme unique source de vérité pour toutes les restrictions. C'est moins précis (pas de niveau différent par service) mais fonctionnel dès maintenant et ne dépend pas d'un backend encore incomplet.

## Ce qui est implémenté

### `useKycStatus.ts` — logique par niveau

Le hook récupère `GET /api/adhesions/me/kyc` (dossier) **et** `GET /api/adhesions/me/kyc/levels` (liste des niveaux + `sortOrder`), puis compare le `sortOrder` du niveau déjà atteint (`kycCase.currentKycLevel`) à celui des niveaux `Standard` et `Moyen` :

- `isValidated` (Niveau 1) : `currentKycLevel.sortOrder >= sortOrder("Standard")` → pilote la modale de compte.
- `isModuleValidated` (Niveau 2) : `currentKycLevel.sortOrder >= sortOrder("Moyen")` → pilote `useKycGate` et donc tous les boutons créer/publier.

Les codes de niveau (`"Standard"`, `"Moyen"`) sont en constantes en haut du fichier (`KYC_ACCESS_LEVEL_CODE`, `KYC_MODULE_LEVEL_CODE`) — à adapter si le backend renomme ses niveaux.

### Niveau 1 — Modale de compte

⚠️ **Changement le 21/07/2026** : le document décrit une "bannière rouge persistante", mais sur demande explicite on est passé à une **modale** (`KycAccessModal.tsx`), sur validation utilisateur ("Remplacer entièrement par une modale"). Ce n'est donc plus littéralement une bannière persistante — écart assumé.

- Modale (`KycAccessModal.tsx`), montée dans `DashboardLayout`, affichée automatiquement une fois par session (flag `sessionStorage`) tant que le compte est en dépassement.
- Comme `DashboardLayout` est remonté à chaque changement de page (chaque page l'enveloppe individuellement), le flag de session évite qu'elle ne réapparaisse à chaque navigation ; elle réapparaît à la prochaine session (nouvel onglet / navigateur redémarré).
- Texte exact du document : *"Votre compte n'a pas encore rempli les conditions du KYC. Merci de compléter votre KYC afin de réactiver vos services CPU-PME."*
- Se déclenche quand `!isValidated && joursDepuisDébut > 30` (`isValidated` = niveau `Standard` atteint, pas juste `status === "approved"`).
- Bouton "Compléter mon KYC" → redirige vers `/kyc`.
- Date de référence des 30 jours (dans l'ordre de priorité) :
  1. `user.abonnementStartDate` (profil mappé, localStorage `cpu-pme-user`)
  2. `created_at` de l'objet brut adhésion (localStorage `cpu-adhesion`)

### Niveau 2 — Restriction des boutons "Créer"

Décision validée : on bloque le bouton **"Créer"** lui-même (pas de bouton "Publier" séparé n'existe dans le code actuel pour boutique/événements/formations — la création va directement au statut final). Le bouton reste visible mais désactivé + tooltip avec le message métier. Le gate réel est `isModuleValidated` (niveau `Moyen` atteint), via `useKycGate()`.

| Module | Fichier | Bouton(s) restreints | Message |
|---|---|---|---|
| Boutique | `src/components/marketplace/VendeurOnboarding.tsx` | "Créer la boutique" | *Veuillez compléter votre KYC Marketplace afin de publier votre boutique.* |
| Événements | `src/components/evenements/MesEvenements.tsx` | "Créer un événement", "Créer mon premier événement" | *Veuillez compléter votre KYC Organisateur.* |
| Formations | `src/components/formation/EspaceFormateur.tsx` | "Ajouter un formateur", "Nouvelle formation", "Créer ma première formation" | *Veuillez compléter votre KYC Formateur.* |
| Produits marketplace | `src/components/marketplace/MesProduits.tsx` | "Nouveau", "Ajouter un produit" | *Veuillez compléter votre KYC Marketplace afin de publier vos produits.* |
| Appels d'offres (RFQ) | `src/components/appels-offres/GestionAO.tsx`, `src/components/marketplace/RFQAcheteur.tsx` | "Créer un AO", "Nouvelle demande", "Créer une demande" | *Veuillez compléter votre KYC afin de déposer un appel d'offres.* |
| Incubateur | `src/pages/Incubateur.tsx` | "Nouveau projet", "Créer un projet" | *Veuillez compléter votre KYC afin de gérer un incubateur.* |

Ces 3 derniers modules (RFQ, Incubateur) ne font pas partie du périmètre "3 modules" du document métier mais ont été câblés quand même sur demande explicite (l'API les expose déjà).

`COMMUNITY_MANAGE` n'a aucune fonctionnalité correspondante dans le code — rien à restreindre pour l'instant.

### Statut détaillé (profil / dashboard)

Déjà couvert par `src/pages/KYCConformite.tsx` (préexistant, non modifié pour cette tâche) : statut du dossier, niveau requis vs actuel, progression documents, badges par statut.

## Fichiers créés / modifiés

**Créés :**
- `src/hooks/useKycStatus.ts` — `useKycStatus()` (statut brut du dossier + calcul Niveau 1) et `useKycGate(message)` (gate prêt à l'emploi pour un bouton).
- `src/components/shared/RestrictedButton.tsx` — bouton désactivé + tooltip générique, réutilisable partout.
- `src/components/dashboard/KycAccessModal.tsx` — modale Niveau 1 (remplace l'ancienne bannière `KycAccessBanner.tsx`, supprimée).

**Modifiés :**
- `src/lib/api.ts` — ajout `createdAt`/`updatedAt` sur le type `KycCase` (champs réels renvoyés par l'API mais absents du typage).
- `src/components/dashboard/DashboardLayout.tsx` — intégration de la modale.
- `src/components/marketplace/VendeurOnboarding.tsx`, `MesProduits.tsx`, `RFQAcheteur.tsx`
- `src/components/evenements/MesEvenements.tsx`
- `src/components/formation/EspaceFormateur.tsx`
- `src/components/appels-offres/GestionAO.tsx`
- `src/pages/Incubateur.tsx`

**Supprimé** (revert d'une tentative précédente) : `src/hooks/useEntitlements.ts` et le endpoint `kycApi.getEntitlements` dans `api.ts` — à réintroduire quand on basculera sur `/entitlements` (voir section suivante).

## Écarts avec le document métier

Connus et non résolus à ce stade — à traiter plus tard si besoin :

1. **KYC indépendant par module** : le document décrit un KYC avec documents et niveaux différents par module. On utilise actuellement un dossier KYC unique (même statut pour tous les modules). Résolu uniquement quand on basculera sur `/entitlements` (voir plus bas).
2. **Message d'erreur réseau** : en cas d'échec de l'appel API, on ne bloque pas l'utilisateur (fail-open) mais on n'affiche pas le message "impossible de vérifier votre statut KYC, réessayez" prévu par le document.
3. **Tests** : aucun test écrit. Le projet n'a pas d'infrastructure de test configurée (pas de script `test`, pas de config vitest active) — à mettre en place si on veut satisfaire cette exigence.
4. **Annuaire public** : la disparition du profil de l'annuaire après 30 jours est gérée côté backend, hors périmètre front (confirmé avec l'utilisateur).

## Quand et comment basculer sur `/entitlements`

Dès que le backend aura configuré des règles pour les 5 services actuellement vides (`RFQ_CREATE`, `INCUBATOR_MANAGE`, `COMMUNITY_MANAGE`, `MARKETPLACE_PUBLISH`, `FORMATIONS_SELL`), on peut basculer :

1. Recréer `kycApi.getEntitlements(service?)` dans `src/lib/api.ts` (`GET /api/adhesions/me/kyc/entitlements`, param `service` optionnel) — voir git history de ce fichier pour l'implémentation déjà écrite puis retirée.
2. Recréer un hook `useServiceEntitlement(serviceCode)` (sur le modèle de `useKycGate`) qui lit `allowed` et `reasons[0]` directement dans la réponse — pas de recalcul de règle côté front, conforme à la contrainte du document.
3. Remplacer, dans chacun des fichiers listés ci-dessus, `useKycGate(messageStatique)` par `useServiceEntitlement("BOUTIQUE_CREATE" | "EVENTS_CREATE" | ...)`, en gardant le message statique uniquement comme fallback si `reasons` est vide.
4. Garder `useKycStatus` (dossier unique) tel quel pour la modale Niveau 1 et `KYCConformite.tsx`, qui restent basés sur le dossier global (pas de notion "par service" pour le compte).

## Référence API

### `GET /api/adhesions/me/kyc` (Niveau 1 — dossier unique)

```json
{
  "success": true,
  "data": {
    "id": "419eb54a-...",
    "status": "draft",
    "targetKycLevel": { "code": "Standard", "name": "KYC Standard" },
    "currentKycLevel": null,
    "createdAt": "2026-07-14T18:06:48.923Z"
  }
}
```

### `GET /api/adhesions/me/kyc/entitlements` (Niveau 2 — par service, non utilisé actuellement)

Test réel du 21/07/2026, `currentKycLevel = Standard` :

```json
{
  "success": true,
  "data": [
    { "serviceCode": "BOUTIQUE_CREATE", "allowed": false, "reasons": ["Aucune règle d'accès ne correspond à votre profil"], "currentKycLevel": "Standard" },
    { "serviceCode": "EVENTS_CREATE", "allowed": false, "reasons": ["Aucune règle d'accès ne correspond à votre profil"], "requiredKycLevel": "Associatif", "currentKycLevel": "Standard" },
    { "serviceCode": "RFQ_CREATE", "allowed": false, "reasons": ["Aucune règle d'accès configurée pour ce service"] },
    { "serviceCode": "INCUBATOR_MANAGE", "allowed": false, "reasons": ["Aucune règle d'accès configurée pour ce service"] },
    { "serviceCode": "COMMUNITY_MANAGE", "allowed": false, "reasons": ["Aucune règle d'accès configurée pour ce service"] },
    { "serviceCode": "MARKETPLACE_PUBLISH", "allowed": false, "reasons": ["Aucune règle d'accès configurée pour ce service"] },
    { "serviceCode": "FORMATIONS_SELL", "allowed": false, "reasons": ["Aucune règle d'accès configurée pour ce service"] }
  ]
}
```

→ 5 services sur 7 sans règle configurée. **À signaler au backend avant toute bascule.**
