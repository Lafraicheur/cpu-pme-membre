# Guide de Test des Abonnements - Mode Simulation

## 🎯 Comment tester le système

### Démarrage
1. Lancez le dashboard : `npm run dev`
2. Vous verrez la **page de sélection d'abonnement**
3. Cliquez sur un plan pour démarrer

---

## 📋 Tests par Abonnement

### 🔹 Test BASIC (Gratuit)

**Accès :**
- ✅ Marketplace (ACHAT uniquement)
- ✅ Appels d'offres (CONSULTATION uniquement)
- ✅ Formation (APPRENANT uniquement)
- ✅ Événements (PARTICIPATION uniquement)
- ✅ Annuaire (lecture)

**Restrictions :**
- ❌ Pas de menu "VENDRE" dans Marketplace
- ❌ Pas de bouton "Acheteur" dans Appels d'offres
- ❌ Pas de bouton "Postuler" actif dans les AO
- ❌ Pas de tab "Créer" dans Formation
- ❌ Pas de tabs "Exposant/Sponsor" dans Événements
- ❌ Data Hub complètement bloqué (message upgrade)
- ❌ Financement : pas de tab "Dons reçus"
- ❌ Mon Entreprise : "1 / 1", bouton "Inviter" grisé

**Comment tester :**
1. Sélectionnez "Basic" au démarrage
2. Allez sur **Marketplace** → Vérifiez qu'il n'y a PAS de section "VENDRE"
3. Allez sur **Appels d'offres** → Vérifiez qu'il n'y a PAS de bouton "Acheteur"
4. Allez sur **Formation** → Vérifiez qu'il n'y a PAS de tab "Créer"
5. Allez sur **Data Hub** → Vous devez voir un message "Requiert abonnement OR"
6. Allez sur **Mon Entreprise** > Équipe → "1 / 1", bouton "Inviter" désactivé
7. Allez sur **Abonnement** → Le plan "Basic" doit être marqué "✓ Votre plan actuel"

---

### 🔸 Test ARGENT (5,000 FCFA/mois)

**Nouveautés par rapport à BASIC :**
- ✅ Marketplace : **VENTE** activée
- ✅ Appels d'offres : **SOUMISSION** activée
- ✅ Appels d'offres : **PUBLICATION** activée
- ✅ Incubateur & Mentoring accessible
- ✅ Financement : demandes activées
- ✅ Équipe : jusqu'à **3 membres**

**Toujours bloqué :**
- ❌ Création de formations
- ❌ Organisation d'événements
- ❌ Data Hub
- ❌ Exports PDF/XLSX

**Comment tester :**
1. Sélectionnez "Argent" au démarrage (ou changez via header)
2. Allez sur **Marketplace** → Vérifiez qu'il y a maintenant une section "VENDRE"
3. Allez sur **Appels d'offres** → Bouton "Acheteur" visible, bouton "Postuler" actif
4. Allez sur **Formation** → Toujours PAS de tab "Créer"
5. Allez sur **Data Hub** → Toujours bloqué
6. Allez sur **Mon Entreprise** > Équipe → "1 / 3", peut inviter 2 membres
7. Allez sur **Abonnement** → Le plan "Argent" doit être marqué "✓ Votre plan actuel"

---

### 🔶 Test OR (10,000 FCFA/mois)

**Nouveautés par rapport à ARGENT :**
- ✅ Formation : **CRÉATION** activée
- ✅ Événements : **ORGANISATION** activée
- ✅ **Data Hub** accessible
- ✅ **Analytics** basiques
- ✅ **Exports** PDF/XLSX activés
- ✅ Équipe : jusqu'à **5 membres**

**Comment tester :**
1. Sélectionnez "Or" au démarrage
2. Allez sur **Formation** → Tab "Créer" maintenant VISIBLE
3. Allez sur **Événements** → Tabs "Exposant" et "Sponsor" VISIBLES
4. Allez sur **Data Hub** → Accès COMPLET (plus de message de blocage)
5. Allez sur **Mon Entreprise** > Équipe → "1 / 5"
6. Allez sur **Abonnement** → Tableau comparatif montre tous les ✓ pour OR
7. Header → Icône couronne 👑 + badge "Or"

---

### 🏢 Test ORGANISATION (25,000 FCFA/mois)

**Nouveautés :**
- ✅ Analytics **avancés**
- ✅ Équipe : jusqu'à **10 membres**
- ✅ Tous les modules opérationnels

**Comment tester :**
1. Sélectionnez "Organisation"
2. Allez sur **Mon Entreprise** > Équipe → "1 / 10"
3. Allez sur **Abonnement** → Plan "Organisation" marqué actif
4. Header → Icône building 🏢 + badge "Organisation"

---

### 🏛️ Test FÉDÉRATION (50,000 FCFA/mois)

**Nouveautés :**
- ✅ Analytics **secteur** (analyse sectorielle)
- ✅ Équipe : jusqu'à **20 membres**

**Comment tester :**
1. Sélectionnez "Fédération"
2. Allez sur **Mon Entreprise** > Équipe → "1 / 20"
3. Allez sur **Abonnement** → Plan "Fédération" marqué actif
4. Header → Icône users 👥 + badge "Fédération"

---

### 🏛️ Test INSTITUTIONNEL (100,000 FCFA/mois)

**Nouveautés :**
- ✅ Financement : **DONS** (réception de dons)
- ✅ **API & Intégrations**
- ✅ Analytics **complets**
- ✅ Équipe : **ILLIMITÉE** (∞)
- ✅ Support premium dédié

**Comment tester :**
1. Sélectionnez "Institutionnel"
2. Allez sur **Financement** → Tab "Dons reçus" maintenant VISIBLE
3. Allez sur **Mon Entreprise** > Équipe → "1 / ∞" (symbole infini)
4. Allez sur **Abonnement** → Plan "Institutionnel" marqué actif
5. Header → Icône landmark 🏛️ + badge "Institutionnel"
6. Bouton "Inviter" jamais désactivé (équipe illimitée)

---

## 🔄 Changer d'abonnement en cours de route

### Méthode 1 : Via le Header
1. Regardez en haut à droite du dashboard
2. Cliquez sur le bouton affichant votre abonnement actuel (avec badge "Simulation")
3. Menu déroulant s'ouvre avec les 6 options
4. Cliquez sur un autre abonnement
5. La page se recharge automatiquement

### Méthode 2 : Via le sélecteur
1. Dans le menu déroulant du header
2. Cliquez sur "Retour au sélecteur"
3. Vous revenez à la page de sélection complète
4. Choisissez un nouveau plan

---

## ✅ Checklist de vérification complète

### Pour chaque abonnement testé :
- [ ] Le plan correct s'affiche dans le header
- [ ] Le badge "Mode Simulation" est visible
- [ ] La page Abonnement marque le bon plan comme actif
- [ ] Le tableau de comparaison affiche correctement les fonctionnalités
- [ ] Les fonctionnalités autorisées sont accessibles
- [ ] Les fonctionnalités interdites sont masquées (pas grisées)
- [ ] La limite d'équipe est correcte
- [ ] Le bouton "Inviter" se désactive à la limite

---

## 🎨 Indicateurs visuels à vérifier

### Header (en haut à droite)
- Icône correspondant au plan (étoile, couronne, etc.)
- Nom du plan affiché
- Badge "Simulation" visible
- Menu déroulant fonctionnel

### Page Abonnement
- Card "Plan actuel" affiche le bon plan avec icône colorée
- Badge "✓ Actif" sur le plan actuel
- Badge "Mode Simulation" visible
- Bouton "Plan actif" désactivé sur le plan actuel
- Tableau comparatif : colonne du plan actuel mise en évidence

### Page Mon Entreprise
- Widget "Membres de l'équipe" affiche "X / Y"
- Progress bar affichée (sauf si illimité)
- Symbole ∞ pour INSTITUTIONNEL
- Bouton "Inviter" grisé si limite atteinte

---

## 🐛 Problèmes courants et solutions

### Le sélecteur d'abonnement ne s'affiche pas au démarrage
**Solution :** Effacez le localStorage :
```javascript
localStorage.clear()
```
Puis rechargez la page.

### Les permissions ne s'appliquent pas après changement
**Solution :** Le système recharge automatiquement la page. Si ça ne marche pas, rechargez manuellement (F5).

### Je vois des fonctionnalités qui ne devraient pas être visibles
**Solution :** Vérifiez dans le header quel est votre plan actuel. Comparez avec la matrice des permissions dans IMPLEMENTATION_ABONNEMENTS.md.

---

## 📊 Matrice de test rapide

| Fonctionnalité | BASIC | ARGENT | OR | ORGA | FED | INST |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Marketplace Vente | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| AO Soumission | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Formation Création | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Events Organisation | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Data Hub | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Exports PDF/XLSX | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Financement Dons | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Équipe | 1 | 3 | 5 | 10 | 20 | ∞ |

---

## 🚀 Pour aller plus loin

### Tester l'héritage des permissions
1. Commencez avec BASIC → notez ce qui est accessible
2. Passez à ARGENT → vérifiez que TOUT ce qui était dans BASIC est toujours là + les nouveautés
3. Passez à OR → vérifiez l'héritage continue
4. Et ainsi de suite...

### Tester la limite d'équipe
1. Allez sur Mon Entreprise > Équipe
2. Notez le compteur actuel
3. Si vous êtes à la limite, le bouton "Inviter" doit être grisé
4. Passez à un plan supérieur → le bouton se réactive

---

**Bon test ! 🎉**

*Ce guide est pour le mode simulation. En production, l'abonnement sera géré via paiement réel.*
