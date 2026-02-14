# Documentation d'Implémentation : Système de Contrôle d'Accès par Abonnement

**Projet** : CPU-PME Dashboard
**Date** : 30 décembre 2025
**Version** : 1.0.0

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture du système](#architecture-du-système)
3. [Fichiers créés](#fichiers-créés)
4. [Fichiers modifiés](#fichiers-modifiés)
5. [Niveaux d'abonnement](#niveaux-dabonnement)
6. [Matrice des permissions](#matrice-des-permissions)
7. [Guide d'utilisation](#guide-dutilisation)
8. [Tests](#tests)
9. [Prochaines étapes](#prochaines-étapes)

---

## Vue d'ensemble

### 🎯 Objectif

Implémenter un système de contrôle d'accès basé sur **6 niveaux d'abonnement** avec héritage des droits, permettant de restreindre l'accès aux fonctionnalités du dashboard selon le type d'abonnement de l'utilisateur.

### ✅ Décisions de conception validées

- ✅ **Remplacer** les 3 niveaux actuels (Basic/Silver/Gold) par 6 nouveaux niveaux
- ✅ **Bloquer** l'ajout de membres d'équipe si limite atteinte
- ✅ **Masquer** complètement les fonctionnalités inaccessibles (pas de grisé)
- ✅ **Pas de quotas mensuels** - fonctionnalités simplement activées ou désactivées

### 🔑 Principes clés

1. **Héritage hiérarchique** : Chaque tier hérite des permissions du précédent
2. **Type-safe** : TypeScript strict sur tous les types
3. **Performance** : Hook optimisé, pas de re-calculs inutiles
4. **UX propre** : Masquage complet, pas de features grisées visibles
5. **Centralisé** : Une seule source de vérité (`TIER_CONFIGS`)

---

## Architecture du système

### Structure des composants

```
┌─────────────────────────────────────────────────────────┐
│                     AuthContext                         │
│  ┌────────────────────────────────────────────────┐    │
│  │ User {                                          │    │
│  │   subscription: {                               │    │
│  │     tier: SubscriptionTier                      │    │
│  │     features: Feature[]                         │    │
│  │     teamLimit: number                           │    │
│  │   }                                             │    │
│  │ }                                               │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────┐
│              useSubscription Hook                       │
│  • canAccess(feature)                                   │
│  • canAddMember()                                       │
│  • getTeamLimit()                                       │
│  • requiresUpgrade(feature)                             │
└─────────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  Components                             │
│  ┌────────────────┐  ┌──────────────────┐             │
│  │ Subscription   │  │ TeamLimit        │             │
│  │ Guard          │  │ Indicator        │             │
│  └────────────────┘  └──────────────────┘             │
└─────────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Pages / Modules                            │
│  Marketplace │ AO │ Formation │ Events │ DataHub...    │
└─────────────────────────────────────────────────────────┘
```

### Flux de vérification des permissions

```
User Login
    ↓
Load Subscription Data
    ↓
Store in AuthContext
    ↓
Component uses useSubscription()
    ↓
canAccess('feature.name') → Check TIER_CONFIGS
    ↓
Show/Hide Feature
```

---

## Fichiers créés

### 1. `/src/types/subscription.ts` (89 lignes)

**Rôle** : Définitions TypeScript centrales pour le système d'abonnements

**Types exportés** :
- `SubscriptionTier` : 'BASIC' | 'ARGENT' | 'OR' | 'ORGANISATION' | 'FEDERATION' | 'INSTITUTIONNEL'
- `SubscriptionCategory` : 'individual' | 'collective'
- `SubscriptionStatus` : 'active' | 'expired' | 'cancelled' | 'trial'
- `Feature` : 50+ identifiants de fonctionnalités (ex: 'marketplace.seller', 'formation.creator')
- `Subscription` : Interface complète d'un abonnement
- `TierConfig` : Configuration d'un tier avec ses features et héritage

**Exemple** :
```typescript
export type Feature =
  | 'marketplace.buyer'
  | 'marketplace.seller'
  | 'ao.consultation'
  | 'ao.submission'
  // ... 46 autres features
```

---

### 2. `/src/lib/permissions.ts` (142 lignes)

**Rôle** : Logique centrale des permissions et configuration des tiers

**Exports principaux** :
- `TIER_CONFIGS` : Record de configuration de chaque tier
- `getFeaturesForTier(tier)` : Résout l'héritage et retourne toutes les features
- `canAccessFeature(tier, feature)` : Vérifie si un tier a accès à une feature
- `canAddTeamMember(current, limit)` : Vérifie la limite d'équipe
- `getRequiredTier(feature)` : Trouve le tier minimum pour une feature

**Configuration complète** :
```typescript
export const TIER_CONFIGS: Record<SubscriptionTier, TierConfig> = {
  BASIC: {
    tier: 'BASIC',
    teamLimit: 1,
    features: [
      'auth.sso',
      'profile.public',
      'directory.read',
      'marketplace.buyer',
      'ao.consultation',
      'formation.learner',
      'events.participation',
      'support.standard',
    ],
  },
  ARGENT: {
    tier: 'ARGENT',
    teamLimit: 3,
    inheritsFrom: 'BASIC',
    features: [
      'marketplace.seller',
      'ao.submission',
      'ao.publishing',
      'incubator.access',
      'financing.requests',
      'support.priority',
    ],
  },
  // ... 4 autres tiers
};
```

---

### 3. `/src/hooks/useSubscription.ts` (21 lignes)

**Rôle** : Hook React pour accéder facilement aux permissions

**API** :
```typescript
const {
  subscription,        // Objet subscription complet
  canAccess,          // (feature: Feature) => boolean
  getTeamLimit,       // () => number
  canAddMember,       // () => boolean
  requiresUpgrade,    // (feature: Feature) => SubscriptionTier | null
  tier,               // SubscriptionTier actuel
  category,           // 'individual' | 'collective'
} = useSubscription();
```

**Exemple d'utilisation** :
```typescript
const { canAccess } = useSubscription();
const isVendeur = canAccess('marketplace.seller');

return (
  <>
    {isVendeur && <VendorDashboard />}
  </>
);
```

---

### 4. `/src/components/subscription/SubscriptionGuard.tsx` (56 lignes)

**Rôle** : Composant wrapper pour protéger les fonctionnalités

**Props** :
```typescript
interface SubscriptionGuardProps {
  feature: Feature;           // Feature requise
  children: ReactNode;        // Contenu à protéger
  fallback?: ReactNode;       // Contenu alternatif
  showUpgrade?: boolean;      // Afficher message upgrade
}
```

**Comportements** :
- Si accès OK → affiche `children`
- Si `fallback` fourni → affiche `fallback`
- Si `showUpgrade=true` → affiche Alert avec bouton "Mettre à niveau"
- Sinon → retourne `null` (masque complètement)

**Exemple** :
```typescript
<SubscriptionGuard feature="datahub.access" showUpgrade={true}>
  <DataHubContent />
</SubscriptionGuard>
```

---

### 5. `/src/components/subscription/FeatureBadge.tsx` (57 lignes)

**Rôle** : Badge visuel indiquant le tier requis

**Props** :
```typescript
interface FeatureBadgeProps {
  requiredTier: SubscriptionTier;
  size?: 'sm' | 'md' | 'lg';
}
```

**Style par tier** :
- BASIC : Gris (Sparkles icon)
- ARGENT : Secondary (Star icon)
- OR : Primary (Crown icon)
- ORGANISATION : Bleu (Building2 icon)
- FEDERATION : Violet (Users icon)
- INSTITUTIONNEL : Ambre (Landmark icon)

---

### 6. `/src/components/subscription/TeamLimitIndicator.tsx` (50 lignes)

**Rôle** : Widget affichant l'usage de l'équipe

**Affichage** :
- Nombre actuel / limite
- Progress bar (sauf si illimité)
- Badge "Limite proche" si > 80%
- Symbole ∞ pour INSTITUTIONNEL

**Exemple visuel** :
```
┌─────────────────────────────┐
│ 👥 Membres de l'équipe      │
│                             │
│ Utilisateurs    3 / 5       │
│ ███████████████░░░░░  60%   │
└─────────────────────────────┘
```

---

## Fichiers modifiés

### 7. `/src/contexts/AuthContext.tsx`

**Modifications** :
1. **Imports ajoutés** :
   ```typescript
   import { Subscription, Feature } from "@/types/subscription";
   import { canAccessFeature, getFeaturesForTier, TIER_CONFIGS } from "@/lib/permissions";
   ```

2. **User interface étendue** :
   ```typescript
   export interface User {
     // ... champs existants
     subscription: Subscription;  // ← NOUVEAU
   }
   ```

3. **AuthContextType étendue** :
   ```typescript
   interface AuthContextType {
     // ... méthodes existantes
     canAccess: (feature: Feature) => boolean;      // ← NOUVEAU
     canAddTeamMember: () => boolean;               // ← NOUVEAU
     getTeamLimit: () => number;                    // ← NOUVEAU
   }
   ```

4. **Méthodes implémentées** (lignes 82-99) :
   ```typescript
   const canAccess = (feature: Feature): boolean => {
     if (!user?.subscription) return false;
     if (user.subscription.status !== 'active') return false;
     return canAccessFeature(user.subscription.tier, feature);
   };

   const canAddTeamMember = (): boolean => {
     if (!user?.subscription) return false;
     const limit = user.subscription.teamLimit;
     const current = user.subscription.currentTeamSize;
     if (limit === -1) return true; // unlimited
     return current < limit;
   };

   const getTeamLimit = (): number => {
     if (!user?.subscription) return 0;
     return user.subscription.teamLimit;
   };
   ```

5. **Login démo mis à jour** (lignes 48-70) :
   ```typescript
   const demoUser: User = {
     id: "demo-user-1",
     name: "Utilisateur Demo",
     email,
     role: "owner",
     companyId: "company-1",
     companyName: "Entreprise Demo SARL",
     subscription: {
       tier: 'ARGENT',
       category: 'individual',
       status: 'active',
       startDate: new Date().toISOString(),
       teamLimit: TIER_CONFIGS.ARGENT.teamLimit,
       currentTeamSize: 1,
       features: getFeaturesForTier('ARGENT'),
     },
   };
   ```

---

### 8. `/src/pages/Abonnement.tsx`

**Modifications majeures** :

1. **Imports ajoutés** :
   ```typescript
   import { Users, Landmark } from "lucide-react";
   ```

2. **PlanFeature interface étendue** (lignes 9-17) :
   ```typescript
   interface PlanFeature {
     name: string;
     basic: boolean | string;
     argent: boolean | string;        // ← Renommé de 'silver'
     or: boolean | string;            // ← Renommé de 'gold'
     organisation: boolean | string;  // ← NOUVEAU
     federation: boolean | string;    // ← NOUVEAU
     institutionnel: boolean | string;// ← NOUVEAU
   }
   ```

3. **planFeatures array** (lignes 19-39) - 19 features comparées :
   ```typescript
   const planFeatures: PlanFeature[] = [
     { name: "SSO & Profil public", basic: true, argent: true, or: true, organisation: true, federation: true, institutionnel: true },
     { name: "Marketplace (vendeur)", basic: false, argent: true, or: true, organisation: true, federation: true, institutionnel: true },
     { name: "Formation (créateur)", basic: false, argent: false, or: true, organisation: true, federation: true, institutionnel: true },
     { name: "Financement (dons)", basic: false, argent: false, or: false, organisation: false, federation: false, institutionnel: true },
     { name: "Data Hub & Analytics", basic: false, argent: false, or: "Basique", organisation: "Avancé", federation: "Secteur", institutionnel: "Complet" },
     { name: "Membres d'équipe", basic: "1", argent: "3", or: "5", organisation: "10", federation: "20", institutionnel: "Illimité" },
     // ... 13 autres features
   ];
   ```

4. **plans array** (lignes 41-122) - 6 plans avec catégories :
   ```typescript
   const plans = [
     // Individual Tiers
     {
       id: "basic",
       name: "Basic",
       category: "Individuel",
       price: "0",
       period: "Gratuit",
       icon: Sparkles,
       color: "bg-muted",
     },
     {
       id: "argent",
       name: "Argent",
       category: "Individuel",
       price: "5 000",
       period: "FCFA/mois",
       icon: Star,
       popular: true,
     },
     {
       id: "or",
       name: "Or",
       category: "Individuel",
       price: "10 000",
       icon: Crown,
     },
     // Collective Tiers
     {
       id: "organisation",
       name: "Organisation",
       category: "Collectif",
       price: "25 000",
       icon: Building2,
       color: "bg-blue-500/10",
     },
     {
       id: "federation",
       name: "Fédération",
       category: "Collectif",
       price: "50 000",
       icon: Users,
       color: "bg-purple-500/10",
     },
     {
       id: "institutionnel",
       name: "Institutionnel",
       category: "Collectif",
       price: "100 000",
       icon: Landmark,
       color: "bg-amber-500/10",
     },
   ];
   ```

---

### 9. `/src/pages/Marketplace.tsx`

**Modifications** :

1. **Import ajouté** :
   ```typescript
   import { useSubscription } from "@/hooks/useSubscription";
   ```

2. **Remplacement du mock** (lignes 150-151) :
   ```typescript
   // AVANT : const [isVendeur] = useState(true);
   // APRÈS :
   const { canAccess } = useSubscription();
   const isVendeur = canAccess('marketplace.seller');
   ```

3. **Effet** : La section "VENDRE" (lignes 392-412) est déjà conditionnelle avec `{isVendeur && ...}`, donc elle est automatiquement masquée pour les utilisateurs BASIC.

---

### 10. `/src/pages/AppelsOffres.tsx`

**Modifications** :

1. **Import** :
   ```typescript
   import { useSubscription } from "@/hooks/useSubscription";
   ```

2. **Checks de permissions** (lignes 138-140) :
   ```typescript
   const { canAccess } = useSubscription();
   const canSubmit = canAccess('ao.submission');
   const canPublish = canAccess('ao.publishing');
   ```

3. **Bouton "Acheteur" conditionnel** (lignes 252-265) :
   ```typescript
   {canPublish && (
     <button onClick={() => setUserMode("acheteur")}>
       <Briefcase className="w-4 h-4" />
       Acheteur
     </button>
   )}
   ```

4. **Bouton "Postuler" conditionnel** (lignes 465-474) :
   ```typescript
   {(ao.status === "open" || ao.status === "closing_soon") && canSubmit ? (
     <Button onClick={() => handleSubmit(ao)}>Postuler</Button>
   ) : canSubmit ? (
     <Button disabled>Clôturé</Button>
   ) : (
     <Button disabled>Argent requis</Button>
   )}
   ```

---

### 11. `/src/pages/Formation.tsx`

**Modifications** :

1. **Imports** :
   ```typescript
   import { useSubscription } from "@/hooks/useSubscription";
   ```

2. **Check permission** (lignes 15-16) :
   ```typescript
   const { canAccess } = useSubscription();
   const canCreate = canAccess('formation.creator');
   ```

3. **Tab "Créer" conditionnel** (lignes 79-84) :
   ```typescript
   {canCreate && (
     <TabsTrigger value="creer" className="gap-2">
       <Settings className="w-4 h-4" />
       Créer
     </TabsTrigger>
   )}
   ```

4. **TabsContent conditionnel** (lignes 107-113) :
   ```typescript
   {canCreate && (
     <TabsContent value="creer">
       <p>Interface de création de formations</p>
     </TabsContent>
   )}
   ```

**Effet** : Le tab "Créer" est complètement masqué pour BASIC et ARGENT, visible uniquement à partir de OR.

---

### 12. `/src/pages/Evenements.tsx`

**Modifications** :

1. **Imports** :
   ```typescript
   import { useSubscription } from "@/hooks/useSubscription";
   ```

2. **Check permission** (lignes 17-18) :
   ```typescript
   const { canAccess } = useSubscription();
   const canOrganize = canAccess('events.organization');
   ```

3. **Tabs "Exposant" et "Sponsor" conditionnels** (lignes 66-71) :
   ```typescript
   {canOrganize && (
     <>
       <TabsTrigger value="exposant">
         <Store className="w-4 h-4" />Exposant
       </TabsTrigger>
       <TabsTrigger value="sponsor">
         <Award className="w-4 h-4" />Sponsor
       </TabsTrigger>
     </>
   )}
   ```

**Effet** : Les tabs organisation d'événements sont masqués pour BASIC et ARGENT.

---

### 13. `/src/pages/DataHub.tsx`

**Modifications** :

1. **Imports** :
   ```typescript
   import { useSubscription } from "@/hooks/useSubscription";
   import { SubscriptionGuard } from "@/components/subscription/SubscriptionGuard";
   ```

2. **Permission export** (lignes 21-26) :
   ```typescript
   const { canAccess } = useSubscription();
   const canExport = canAccess('export.pdf') || canAccess('export.xlsx');
   ```

3. **Guard complet** (lignes 35-85) :
   ```typescript
   <DashboardLayout>
     <SubscriptionGuard feature="datahub.access" showUpgrade={true}>
       <div className="space-y-6 animate-fade-in">
         {/* Tout le contenu DataHub */}
       </div>
     </SubscriptionGuard>
   </DashboardLayout>
   ```

**Effet** :
- BASIC/ARGENT voient un message "Cette fonctionnalité requiert un abonnement OR" avec bouton upgrade
- OR+ ont accès complet
- L'export est contrôlé séparément par `canExport`

---

### 14. `/src/pages/MonEntreprise.tsx`

**Modifications** :

1. **Imports** :
   ```typescript
   import { useSubscription } from "@/hooks/useSubscription";
   import { TeamLimitIndicator } from "@/components/subscription/TeamLimitIndicator";
   import { useToast } from "@/hooks/use-toast";
   ```

2. **Hooks** (lignes 108-109) :
   ```typescript
   const { canAddMember, getTeamLimit } = useSubscription();
   const { toast } = useToast();
   ```

3. **Description avec compteur** (ligne 316) :
   ```typescript
   <p className="text-sm text-muted-foreground">
     Invitez des membres et gérez les rôles ({team.length}/{getTeamLimit()})
   </p>
   ```

4. **Bouton "Inviter" bloqué** (lignes 319-336) :
   ```typescript
   <Button
     className="gap-2"
     disabled={!canAddMember()}
     onClick={() => {
       if (!canAddMember()) {
         toast({
           title: "Limite atteinte",
           description: "Mettez à niveau votre abonnement pour ajouter plus de membres.",
           variant: "destructive",
         });
         return;
       }
       // Open invite dialog logic here
     }}
   >
     <Plus className="w-4 h-4" />
     Inviter un membre
   </Button>
   ```

5. **Indicateur ajouté** (ligne 363) :
   ```typescript
   <TeamLimitIndicator />
   ```

**Effet** :
- BASIC : 1 membre max, bouton bloqué si 1 membre présent
- ARGENT : 3 membres max
- OR : 5 membres max
- ORGANISATION : 10 membres max
- FEDERATION : 20 membres max
- INSTITUTIONNEL : Illimité

---

### 15. `/src/pages/Financement.tsx`

**Modifications** :

1. **Import** :
   ```typescript
   import { useSubscription } from "@/hooks/useSubscription";
   ```

2. **Check permission** (lignes 151-152) :
   ```typescript
   const { canAccess } = useSubscription();
   const canReceiveDonations = canAccess('financing.donations');
   ```

3. **TabsList dynamique** (ligne 729) :
   ```typescript
   <TabsList className={`grid w-full ${canReceiveDonations ? 'grid-cols-6' : 'grid-cols-5'}`}>
     {/* ... autres tabs */}
     {canReceiveDonations && (
       <TabsTrigger value="dons">Dons reçus</TabsTrigger>
     )}
   </TabsList>
   ```

4. **TabsContent conditionnel** (lignes 860-876) :
   ```typescript
   {canReceiveDonations && (
     <TabsContent value="dons">
       <Card>
         <CardHeader>
           <CardTitle>Dons reçus</CardTitle>
           <CardDescription>
             Gérez les dons et contributions reçus par votre organisation
           </CardDescription>
         </CardHeader>
         <CardContent>
           <p className="text-sm text-muted-foreground text-center py-12">
             Aucun don reçu pour le moment
           </p>
         </CardContent>
       </Card>
     </TabsContent>
   )}
   ```

**Effet** : Le tab "Dons reçus" n'apparaît que pour les utilisateurs INSTITUTIONNEL.

---

## Niveaux d'abonnement

### Membres Individuels

#### 🔹 BASIC (Gratuit)
- **Équipe** : 1 utilisateur
- **Accès** :
  - ✅ Authentification SSO
  - ✅ Profil public (lecture/édition)
  - ✅ Annuaire (lecture)
  - ✅ Marketplace : **achat uniquement**
  - ✅ Appels d'offres : **consultation uniquement**
  - ✅ Formations : **apprenant uniquement**
  - ✅ Événements : **participation uniquement**
  - ✅ Support standard
- **Interdits** :
  - ❌ Vente sur Marketplace
  - ❌ Soumission/Publication d'AO
  - ❌ Création de formations
  - ❌ Organisation d'événements
  - ❌ Data Hub & Analytics
  - ❌ Exports PDF/XLSX
  - ❌ API & Intégrations
  - ❌ Gestion d'équipe

---

#### 🔸 ARGENT (5,000 FCFA/mois)
- **Équipe** : 3 utilisateurs max
- **Hérite de** : BASIC +
- **Nouveautés** :
  - ✅ Marketplace : **vente activée**
  - ✅ Appels d'offres : **soumission + publication**
  - ✅ Incubateur & accompagnement
  - ✅ Financement : demandes
  - ✅ Support prioritaire

---

#### 🔶 OR (10,000 FCFA/mois)
- **Équipe** : 5 utilisateurs max
- **Hérite de** : ARGENT +
- **Nouveautés** :
  - ✅ Création & gestion de formations
  - ✅ Organisation/publication d'événements
  - ✅ **Data Hub & Analytics** (accès basique)
  - ✅ **Exports** (PDF / XLSX)
  - ✅ Équipe étendue

---

### Structures Collectives

#### 🏢 ORGANISATION (25,000 FCFA/mois)
- **Équipe** : 10 utilisateurs max
- **Hérite de** : OR +
- **Nouveautés** :
  - ✅ Accès complet opérationnel
  - ✅ Analytics avancés
  - ✅ Tous les modules activés

---

#### 🏛️ FÉDÉRATION (50,000 FCFA/mois)
- **Équipe** : 20 utilisateurs max
- **Hérite de** : ORGANISATION +
- **Nouveautés** :
  - ✅ Outils renforcés de pilotage filière
  - ✅ **Analytics secteur** (analyse sectorielle approfondie)

---

#### 🏛️ INSTITUTIONNEL (100,000 FCFA/mois)
- **Équipe** : **Illimitée**
- **Hérite de** : FÉDÉRATION +
- **Nouveautés** :
  - ✅ **Financement : dons** (recevoir des dons)
  - ✅ **API & intégrations**
  - ✅ Analytics & exports complets
  - ✅ Support premium
  - ✅ Toutes les fonctionnalités

---

## Matrice des permissions

### Tableau récapitulatif complet

| Fonctionnalité | Feature ID | BASIC | ARGENT | OR | ORGA | FED | INST |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Authentification** |
| SSO & Profil public | `auth.sso`, `profile.public` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Annuaire (lecture) | `directory.read` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Marketplace** |
| Achat | `marketplace.buyer` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Vente | `marketplace.seller` | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Appels d'offres** |
| Consultation | `ao.consultation` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Soumission | `ao.submission` | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Publication | `ao.publishing` | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Formation** |
| Apprenant | `formation.learner` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Créateur | `formation.creator` | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Événements** |
| Participation | `events.participation` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Organisation | `events.organization` | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Incubateur** |
| Accès | `incubator.access` | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Mentoring | `incubator.mentoring` | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Financement** |
| Demandes | `financing.requests` | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Dons (recevoir) | `financing.donations` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Analytics & Data** |
| Data Hub | `datahub.access` | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Analytics basique | `analytics.basic` | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Analytics avancé | `analytics.advanced` | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Analytics secteur | `analytics.sector` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Exports** |
| Export PDF | `export.pdf` | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Export XLSX | `export.xlsx` | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| **API & Intégrations** |
| API Access | `api.access` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Intégrations | `integrations.enabled` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Support** |
| Standard | `support.standard` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Prioritaire | `support.priority` | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Premium | `support.premium` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Équipe** |
| Limite membres | - | 1 | 3 | 5 | 10 | 20 | ∞ |

---

## Guide d'utilisation

### Pour les développeurs

#### 1. Vérifier une permission simple

```typescript
import { useSubscription } from '@/hooks/useSubscription';

function MyComponent() {
  const { canAccess } = useSubscription();

  if (!canAccess('marketplace.seller')) {
    return <p>Fonctionnalité réservée aux abonnés Argent et supérieur</p>;
  }

  return <SellerDashboard />;
}
```

#### 2. Masquer conditionnellement un élément

```typescript
function Menu() {
  const { canAccess } = useSubscription();

  return (
    <nav>
      <MenuItem to="/marketplace">Acheter</MenuItem>
      {canAccess('marketplace.seller') && (
        <MenuItem to="/marketplace/vendre">Vendre</MenuItem>
      )}
    </nav>
  );
}
```

#### 3. Utiliser le Guard avec message upgrade

```typescript
import { SubscriptionGuard } from '@/components/subscription/SubscriptionGuard';

function DataHub() {
  return (
    <SubscriptionGuard feature="datahub.access" showUpgrade={true}>
      <DataHubContent />
    </SubscriptionGuard>
  );
}
```

#### 4. Vérifier la limite d'équipe

```typescript
function TeamManagement() {
  const { canAddMember, getTeamLimit } = useSubscription();
  const { toast } = useToast();

  const handleInvite = () => {
    if (!canAddMember()) {
      toast({
        title: "Limite atteinte",
        description: `Votre plan autorise ${getTeamLimit()} membres maximum.`,
        variant: "destructive",
      });
      return;
    }

    // Ouvrir dialog d'invitation
  };

  return (
    <Button onClick={handleInvite} disabled={!canAddMember()}>
      Inviter un membre
    </Button>
  );
}
```

#### 5. Afficher le tier requis

```typescript
import { FeatureBadge } from '@/components/subscription/FeatureBadge';

function FeatureList() {
  return (
    <div>
      <h3>Création de formations <FeatureBadge requiredTier="OR" /></h3>
      <p>Créez vos propres formations</p>
    </div>
  );
}
```

#### 6. Ajouter un nouvel abonnement tier

```typescript
// Dans /src/lib/permissions.ts

export const TIER_CONFIGS: Record<SubscriptionTier, TierConfig> = {
  // ... tiers existants

  NOUVEAU_TIER: {
    tier: 'NOUVEAU_TIER',
    name: 'Nouveau Tier',
    category: 'collective',
    price: 150000,
    period: 'month',
    teamLimit: 50,
    inheritsFrom: 'INSTITUTIONNEL', // Hérite du tier précédent
    features: [
      'nouvelle.feature',
      'autre.feature',
    ],
  },
};
```

#### 7. Ajouter une nouvelle feature

```typescript
// 1. Dans /src/types/subscription.ts
export type Feature =
  | 'existing.feature'
  // ...
  | 'ma.nouvelle.feature';  // ← Ajouter ici

// 2. Dans /src/lib/permissions.ts
export const TIER_CONFIGS = {
  OR: {
    // ... config existante
    features: [
      // ... features existantes
      'ma.nouvelle.feature',  // ← Ajouter à un tier
    ],
  },
};

// 3. Dans votre composant
const { canAccess } = useSubscription();
const hasNewFeature = canAccess('ma.nouvelle.feature');
```

---

### Pour les utilisateurs (guide utilisateur)

#### Comment savoir mon niveau d'abonnement actuel ?

1. Allez sur **Mon Entreprise** > Tab **Équipe**
2. Regardez l'indicateur : "Membres de l'équipe : X / Y"
   - Si Y = 1 → BASIC
   - Si Y = 3 → ARGENT
   - Si Y = 5 → OR
   - Si Y = 10 → ORGANISATION
   - Si Y = 20 → FÉDÉRATION
   - Si Y = ∞ → INSTITUTIONNEL

Ou consultez la page **Abonnement & Facturation**.

#### Comment mettre à niveau mon abonnement ?

1. Allez sur **Abonnement & Facturation**
2. Comparez les 6 plans disponibles
3. Cliquez sur **Choisir** pour le plan souhaité
4. Suivez le processus de paiement (Orange Money, MTN MoMo, Wave, Carte)

#### Que se passe-t-il si j'atteins la limite de membres ?

- Le bouton "Inviter un membre" devient **grisé**
- Si vous cliquez dessus, un message apparaît : "Limite atteinte. Mettez à niveau votre abonnement."
- Vous devez passer au tier supérieur pour augmenter la limite

#### Quelles fonctionnalités sont masquées selon mon abonnement ?

**BASIC** :
- ❌ Pas de menu "VENDRE" dans Marketplace
- ❌ Pas de bouton "Acheteur" dans Appels d'offres
- ❌ Pas de tab "Créer" dans Formation
- ❌ Pas de tabs "Exposant/Sponsor" dans Événements
- ❌ Accès Data Hub bloqué avec message upgrade
- ❌ Pas de bouton "Inviter" si 1 membre déjà présent

**ARGENT** :
- ✅ Menu "VENDRE" maintenant visible
- ✅ Peut soumettre/publier des AO
- ❌ Toujours pas de création de formations
- ❌ Toujours pas de Data Hub
- ✅ Peut inviter jusqu'à 2 membres supplémentaires (total 3)

**OR et supérieur** :
- ✅ Toutes les fonctionnalités disponibles selon le tier

---

## Tests

### Checklist de tests manuels

#### ✅ Test 1 : Vérifier l'affichage des tiers

1. Aller sur `/abonnement`
2. Vérifier que **6 plans** s'affichent :
   - Basic (Gratuit)
   - Argent (5,000 FCFA/mois) - Badge "Plus populaire"
   - Or (10,000 FCFA/mois)
   - Organisation (25,000 FCFA/mois)
   - Fédération (50,000 FCFA/mois)
   - Institutionnel (100,000 FCFA/mois)
3. Vérifier le tableau de comparaison avec **19 features**

**Résultat attendu** : ✅ 6 plans visibles avec bon prix, bonnes icônes, bonnes couleurs

---

#### ✅ Test 2 : Login avec tier BASIC

1. **Préparer** : Modifier `AuthContext.tsx` ligne 58 :
   ```typescript
   subscription: {
     tier: 'BASIC',  // ← Changer ARGENT en BASIC
     // ...
   }
   ```
2. Se connecter
3. Tester chaque page :
   - **Marketplace** : Menu "VENDRE" absent ✅
   - **Appels d'offres** : Bouton "Acheteur" absent ✅
   - **Formation** : Tab "Créer" absent ✅
   - **Événements** : Tabs "Exposant/Sponsor" absents ✅
   - **Data Hub** : Message "Requiert abonnement OR" avec bouton upgrade ✅
   - **Mon Entreprise > Équipe** : "1 / 1", bouton "Inviter" grisé ✅
   - **Financement** : Pas de tab "Dons" ✅

**Résultat attendu** : ✅ Toutes les fonctionnalités premium masquées

---

#### ✅ Test 3 : Login avec tier ARGENT (défaut)

1. **Préparer** : Laisser `tier: 'ARGENT'` dans AuthContext
2. Se connecter
3. Tester :
   - **Marketplace** : Menu "VENDRE" visible ✅
   - **Appels d'offres** : Bouton "Acheteur" visible, peut soumettre ✅
   - **Formation** : Tab "Créer" toujours absent ✅
   - **Data Hub** : Toujours bloqué ✅
   - **Mon Entreprise > Équipe** : "1 / 3", peut inviter 2 membres ✅

**Résultat attendu** : ✅ Features ARGENT activées, features OR+ toujours masquées

---

#### ✅ Test 4 : Login avec tier OR

1. **Préparer** : Changer `tier: 'OR'`
2. Se connecter
3. Tester :
   - **Formation** : Tab "Créer" maintenant visible ✅
   - **Événements** : Tabs "Exposant/Sponsor" visibles ✅
   - **Data Hub** : Accès complet ✅
   - **Mon Entreprise > Équipe** : "1 / 5" ✅

**Résultat attendu** : ✅ Toutes features OR activées

---

#### ✅ Test 5 : Login avec tier INSTITUTIONNEL

1. **Préparer** : Changer `tier: 'INSTITUTIONNEL'`
2. Se connecter
3. Tester :
   - **Mon Entreprise > Équipe** : "1 / ∞" (symbole infini) ✅
   - **Financement** : Tab "Dons reçus" visible ✅
   - Bouton "Inviter" jamais grisé ✅

**Résultat attendu** : ✅ Toutes features activées, équipe illimitée

---

#### ✅ Test 6 : Limite d'équipe

1. Se connecter avec `tier: 'ARGENT'` (limite 3)
2. Ajouter manuellement 3 membres dans `mockTeam` (MonEntreprise.tsx ligne 73)
3. Aller sur Mon Entreprise > Équipe
4. Vérifier :
   - Affichage "3 / 3" ✅
   - Progress bar à 100% ✅
   - Badge "Limite proche" absent (il apparaît > 80%, soit 3/3 = 100%) ✅
   - Bouton "Inviter" **grisé** ✅
5. Cliquer sur bouton grisé
6. Vérifier toast : "Limite atteinte. Mettez à niveau..." ✅

**Résultat attendu** : ✅ Bouton bloqué, toast affiché

---

#### ✅ Test 7 : Héritage des permissions

1. Se connecter avec `tier: 'OR'`
2. Vérifier que toutes les features BASIC sont accessibles :
   - Marketplace achat ✅
   - AO consultation ✅
   - Formations (apprenant) ✅
3. Vérifier que toutes les features ARGENT sont accessibles :
   - Marketplace vente ✅
   - AO soumission ✅
4. Vérifier que les features OR sont accessibles :
   - Formation création ✅
   - Data Hub ✅

**Résultat attendu** : ✅ L'héritage fonctionne correctement

---

#### ✅ Test 8 : TeamLimitIndicator

1. Se connecter avec `tier: 'ARGENT'` (limite 3)
2. Mettre `currentTeamSize: 2` dans AuthContext
3. Aller sur Mon Entreprise > Équipe
4. Vérifier le widget TeamLimitIndicator :
   - Titre "Membres de l'équipe" ✅
   - "Utilisateurs : 2 / 3" ✅
   - Progress bar à ~67% ✅
   - Pas de badge warning (apparaît à 80%+) ✅

**Résultat attendu** : ✅ Widget affiché correctement

---

### Tests automatisés (à implémenter)

```typescript
// Exemple de test unitaire avec Vitest

import { describe, it, expect } from 'vitest';
import { getFeaturesForTier, canAccessFeature } from '@/lib/permissions';

describe('Permissions System', () => {
  it('should inherit features from parent tier', () => {
    const argentFeatures = getFeaturesForTier('ARGENT');
    const basicFeatures = getFeaturesForTier('BASIC');

    // ARGENT doit avoir toutes les features de BASIC
    basicFeatures.forEach(feature => {
      expect(argentFeatures).toContain(feature);
    });
  });

  it('should allow ARGENT to sell on marketplace', () => {
    expect(canAccessFeature('ARGENT', 'marketplace.seller')).toBe(true);
  });

  it('should block BASIC from selling on marketplace', () => {
    expect(canAccessFeature('BASIC', 'marketplace.seller')).toBe(false);
  });

  it('should allow only INSTITUTIONNEL to receive donations', () => {
    expect(canAccessFeature('BASIC', 'financing.donations')).toBe(false);
    expect(canAccessFeature('ARGENT', 'financing.donations')).toBe(false);
    expect(canAccessFeature('OR', 'financing.donations')).toBe(false);
    expect(canAccessFeature('ORGANISATION', 'financing.donations')).toBe(false);
    expect(canAccessFeature('FEDERATION', 'financing.donations')).toBe(false);
    expect(canAccessFeature('INSTITUTIONNEL', 'financing.donations')).toBe(true);
  });

  it('should enforce team limits correctly', () => {
    const { TIER_CONFIGS } = require('@/lib/permissions');

    expect(TIER_CONFIGS.BASIC.teamLimit).toBe(1);
    expect(TIER_CONFIGS.ARGENT.teamLimit).toBe(3);
    expect(TIER_CONFIGS.OR.teamLimit).toBe(5);
    expect(TIER_CONFIGS.ORGANISATION.teamLimit).toBe(10);
    expect(TIER_CONFIGS.FEDERATION.teamLimit).toBe(20);
    expect(TIER_CONFIGS.INSTITUTIONNEL.teamLimit).toBe(-1); // unlimited
  });
});
```

---

## Prochaines étapes

### 🔴 Priorité Haute (Critique pour production)

#### 1. Intégration Backend API

**Objectif** : Connecter le système à une vraie base de données et API

**Actions** :
- [ ] Créer modèle `Subscription` en base de données
- [ ] Endpoint `GET /api/users/:id/subscription` - Récupérer l'abonnement
- [ ] Endpoint `POST /api/subscriptions/upgrade` - Changer de tier
- [ ] Endpoint `POST /api/subscriptions/payment` - Traiter paiement
- [ ] Endpoint `GET /api/subscriptions/plans` - Liste des plans disponibles
- [ ] Synchroniser `AuthContext` avec API au login

**Fichiers à modifier** :
- Créer `/src/services/subscriptionApi.ts`
- Modifier `/src/contexts/AuthContext.tsx` pour appeler l'API

---

#### 2. Intégration Paiement

**Objectif** : Permettre les paiements réels

**Providers à intégrer** :
- [ ] **Orange Money** (API)
- [ ] **MTN Mobile Money** (API)
- [ ] **Wave** (API)
- [ ] **Carte bancaire** (Stripe ou équivalent)

**Actions** :
- [ ] Implémenter webhook de confirmation paiement
- [ ] Activer automatiquement l'abonnement après paiement
- [ ] Gérer les renouvellements automatiques
- [ ] Gérer les échecs de paiement

**Fichiers à créer** :
- `/src/services/paymentService.ts`
- `/src/components/subscription/PaymentModal.tsx`

---

#### 3. Gestion des Expirations

**Objectif** : Gérer le cycle de vie des abonnements

**Actions** :
- [ ] Cron job quotidien pour vérifier les expirations
- [ ] Notification 7 jours avant expiration
- [ ] Notification 1 jour avant expiration
- [ ] Dégradation automatique vers BASIC si non renouvelé
- [ ] Grace period de 3 jours après expiration

**Fichiers à créer** :
- `/src/services/subscriptionScheduler.ts`

---

### 🟡 Priorité Moyenne (Important pour UX)

#### 4. Interface de gestion d'abonnement

**Actions** :
- [ ] Modal de changement de plan avec preview
- [ ] Confirmation avant downgrade (perte de features)
- [ ] Affichage de la date de renouvellement
- [ ] Historique des paiements
- [ ] Téléchargement des factures PDF

**Fichiers à créer** :
- `/src/components/subscription/UpgradeModal.tsx`
- `/src/components/subscription/BillingHistory.tsx`

---

#### 5. Période d'essai (Trial)

**Actions** :
- [ ] Offrir 14 jours d'essai gratuit pour OR
- [ ] Badge "Trial" dans le header
- [ ] Compte à rebours visible
- [ ] Conversion automatique vers BASIC si pas d'upgrade

**Fichiers à modifier** :
- `/src/types/subscription.ts` - Ajouter `isTrial: boolean`
- `/src/components/subscription/TrialBanner.tsx` - Nouveau

---

#### 6. Analytics & Tracking

**Actions** :
- [ ] Tracking des conversions par tier
- [ ] Mesurer le taux de churn (résiliation)
- [ ] Dashboard admin des abonnements actifs
- [ ] Alertes si baisse anormale des conversions

**Fichiers à créer** :
- `/src/pages/admin/SubscriptionDashboard.tsx`

---

### 🟢 Priorité Basse (Nice to have)

#### 7. Quotas mensuels (optionnel)

Si besoin futur de limiter certaines actions :

**Exemple** :
- BASIC : 5 consultations AO/mois
- ARGENT : 10 soumissions AO/mois

**Actions** :
- [ ] Ajouter `usageTracking` dans User
- [ ] Créer système de compteurs mensuels
- [ ] Reset automatique le 1er du mois
- [ ] Afficher barres de progression usage

---

#### 8. Plans personnalisés

**Actions** :
- [ ] Permettre la création de tiers custom pour grandes entreprises
- [ ] Négociation de tarifs sur mesure
- [ ] Features à la carte

---

#### 9. Programme d'affiliation

**Actions** :
- [ ] Parrainage : 1 mois gratuit par filleul
- [ ] Tracking des référrals
- [ ] Dashboard affilié

---

## Annexes

### A. Glossaire

| Terme | Définition |
|---|---|
| **Tier** | Niveau d'abonnement (BASIC, ARGENT, OR, etc.) |
| **Feature** | Fonctionnalité contrôlée par permissions (ex: `marketplace.seller`) |
| **Guard** | Composant wrapper qui protège l'accès à une fonctionnalité |
| **Héritage** | Mécanisme où un tier hérite des permissions du tier inférieur |
| **TeamLimit** | Nombre maximum de membres d'équipe autorisés |
| **Subscription** | Objet contenant toutes les infos d'abonnement d'un utilisateur |

---

### B. FAQ Développeur

**Q : Comment ajouter une nouvelle feature ?**
R : Voir section "Guide d'utilisation > 7. Ajouter une nouvelle feature"

**Q : Peut-on avoir plusieurs tiers actifs en même temps ?**
R : Non, un utilisateur a un seul tier actif à la fois.

**Q : Comment gérer un utilisateur qui downgrade ?**
R : Le système masque automatiquement les features perdues. Aucune donnée n'est supprimée, juste l'accès est restreint.

**Q : Le système fonctionne-t-il offline ?**
R : Partiellement. Les permissions sont stockées dans `localStorage` donc disponibles offline. Mais le changement d'abonnement nécessite une connexion.

**Q : Comment tester avec différents tiers ?**
R : Modifier manuellement `tier` dans `AuthContext.tsx` ligne 58.

---

### C. Diagramme de flux utilisateur

```
Utilisateur se connecte
         ↓
   Tier = BASIC ?
    ↙        ↘
  OUI       NON
   ↓          ↓
Voit UI    Tier vérifié
minimale   pour chaque
   ↓       feature
   ↓          ↓
Peut      Features
upgrade   affichées
via btn   selon tier
"Mettre      ↓
à niveau"    Peut
   ↓      utiliser
Paiement  features
   ↓      autorisées
Tier        ↓
activé   Limite
   ↓     équipe
Accès   respectée
complet
```

---

### D. Code snippets utiles

#### Vérifier si l'abonnement est actif

```typescript
const { subscription } = useSubscription();

if (subscription?.status !== 'active') {
  return <ExpiredSubscriptionBanner />;
}
```

#### Obtenir le nom du tier en français

```typescript
import { TIER_CONFIGS } from '@/lib/permissions';

const tierName = TIER_CONFIGS[subscription.tier].name;
// "Basic", "Argent", "Or", etc.
```

#### Calculer les jours restants avant expiration

```typescript
const daysRemaining = subscription.endDate
  ? Math.ceil((new Date(subscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  : Infinity;

if (daysRemaining < 7) {
  toast({ title: `Plus que ${daysRemaining} jours avant expiration!` });
}
```

---

### E. Ressources externes

- [Stripe Billing Docs](https://stripe.com/docs/billing) - Pour intégration paiement
- [React Query](https://tanstack.com/query) - Déjà utilisé, pour gérer le cache API
- [Zod](https://zod.dev/) - Déjà utilisé, pour validation des données

---

## 📝 Changelog

| Version | Date | Auteur | Changements |
|---|---|---|---|
| 1.0.0 | 2025-12-30 | Claude Sonnet 4.5 | Implémentation initiale du système d'abonnements |

---

## 📧 Contact & Support

Pour toute question sur cette implémentation :
- **Documentation** : Ce fichier
- **Code source** : `/src/types/subscription.ts`, `/src/lib/permissions.ts`
- **Tests** : Section "Tests" ci-dessus

---

**FIN DU DOCUMENT**
