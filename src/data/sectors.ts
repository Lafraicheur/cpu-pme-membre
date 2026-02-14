// Nomenclature sectorielle CPU-PME Côte d'Ivoire (mise à jour complète)
// N1: Secteurs, N2: Filières, N3: Sous-filières, N4: Corps de métiers

export interface SectorN4 {
  code: string;
  name: string;
  activities: string[];
}

export interface SectorN3 {
  code: string;
  name: string;
  n4: SectorN4[];
}

export interface SectorN2 {
  code: string;
  name: string;
  n3: SectorN3[];
}

export interface SectorN1 {
  code: string;
  name: string;
  color: string;
  icon: string;
  n2: SectorN2[];
}

export const sectors: SectorN1[] = [
  {
    code: "N1-PRI",
    name: "Secteur Primaire : Agriculture, Élevage, Pêche",
    color: "bg-green-500",
    icon: "🌾",
    n2: [
      {
        code: "N2-PRI-AGR",
        name: "Agriculture végétale",
        n3: [
          {
            code: "N3-PRI-AGR-CER",
            name: "Céréales & légumineuses",
            n4: [
              {
                code: "N4-CER-001",
                name: "Production céréalière",
                activities: ["Riziculture", "Maïsiculture", "Mil", "Sorgho", "Fonio", "Production de semences certifiées"],
              },
              {
                code: "N4-CER-002",
                name: "Légumineuses",
                activities: ["Soja", "Niébé", "Arachide", "Haricot", "Pois de terre"],
              },
            ],
          },
          {
            code: "N3-PRI-AGR-VIV",
            name: "Racines, tubercules & plantain",
            n4: [
              {
                code: "N4-VIV-001",
                name: "Tubercules",
                activities: ["Manioc", "Igname", "Patate douce", "Taro"],
              },
              {
                code: "N4-VIV-002",
                name: "Plantain & banane",
                activities: ["Banane plantain", "Banane douce", "Conditionnement", "Transport spécialisé"],
              },
            ],
          },
          {
            code: "N3-PRI-AGR-MAR",
            name: "Maraîchage & horticulture",
            n4: [
              {
                code: "N4-MAR-001",
                name: "Maraîchage",
                activities: ["Tomate", "Oignon", "Piment", "Aubergine", "Gombo", "Laitue", "Chou"],
              },
              {
                code: "N4-MAR-002",
                name: "Horticulture",
                activities: ["Pépinières", "Fleurs coupées", "Plantes ornementales", "Herbes aromatiques"],
              },
              {
                code: "N4-MAR-003",
                name: "Production sous abris",
                activities: ["Serres", "Tunnels", "Hydroponie", "Culture hors-sol"],
              },
            ],
          },
          {
            code: "N3-PRI-AGR-FRU",
            name: "Fruits tropicaux & export",
            n4: [
              {
                code: "N4-FRU-001",
                name: "Fruits export",
                activities: ["Ananas", "Mangue", "Banane dessert", "Papaye", "Noix de coco"],
              },
              {
                code: "N4-FRU-002",
                name: "Agrumes & autres",
                activities: ["Orange", "Citron", "Mandarine", "Avocat", "Fruit de la passion"],
              },
            ],
          },
          {
            code: "N3-PRI-AGR-REN",
            name: "Cultures de rente",
            n4: [
              {
                code: "N4-REN-001",
                name: "Cacao & Café",
                activities: ["Cacao", "Café Robusta", "Café Arabica", "Pépinières cacaoyères"],
              },
              {
                code: "N4-REN-002",
                name: "Anacarde & noix",
                activities: ["Anacarde", "Cola", "Karité", "Noix de palme"],
              },
              {
                code: "N4-REN-003",
                name: "Cultures industrielles",
                activities: ["Coton", "Hévéa", "Palmier à huile", "Canne à sucre"],
              },
            ],
          },
        ],
      },
      {
        code: "N2-PRI-ELE",
        name: "Élevage & productions animales",
        n3: [
          {
            code: "N3-PRI-ELE-BOV",
            name: "Bovins & laiterie",
            n4: [
              {
                code: "N4-BOV-001",
                name: "Élevage bovin",
                activities: ["Bovins viande", "Bovins lait", "Élevage mixte", "Insémination artificielle"],
              },
              {
                code: "N4-BOV-002",
                name: "Transformation laitière",
                activities: ["Mini-laiteries", "Collecte de lait", "Yaourt local", "Fromage"],
              },
            ],
          },
          {
            code: "N3-PRI-ELE-AVI",
            name: "Aviculture",
            n4: [
              {
                code: "N4-AVI-001",
                name: "Volaille chair",
                activities: ["Poulet de chair", "Pintade", "Dinde", "Canard"],
              },
              {
                code: "N4-AVI-002",
                name: "Volaille ponte",
                activities: ["Poules pondeuses", "Œufs de table", "Œufs fécondés", "Couvoirs"],
              },
              {
                code: "N4-AVI-003",
                name: "Intrants avicoles",
                activities: ["Aliments volaille", "Poussins d'un jour", "Équipements avicoles"],
              },
            ],
          },
          {
            code: "N3-PRI-ELE-PET",
            name: "Petits ruminants & autres",
            n4: [
              {
                code: "N4-PET-001",
                name: "Ovins & caprins",
                activities: ["Moutons", "Chèvres", "Engraissement", "Reproduction"],
              },
              {
                code: "N4-PET-002",
                name: "Élevages spéciaux",
                activities: ["Porcs", "Lapins", "Aulacodes", "Escargots"],
              },
            ],
          },
          {
            code: "N3-PRI-ELE-API",
            name: "Apiculture",
            n4: [
              {
                code: "N4-API-001",
                name: "Production apicole",
                activities: ["Miel", "Cire d'abeille", "Propolis", "Pollinisation"],
              },
            ],
          },
        ],
      },
      {
        code: "N2-PRI-PEC",
        name: "Pêche & aquaculture",
        n3: [
          {
            code: "N3-PRI-PEC-MAR",
            name: "Pêche maritime",
            n4: [
              {
                code: "N4-MAR-001",
                name: "Pêche artisanale",
                activities: ["Pêche côtière", "Pêche lagunaire", "Pirogue motorisée"],
              },
              {
                code: "N4-MAR-002",
                name: "Pêche industrielle",
                activities: ["Thon", "Sardine", "Crevettes", "Armement naval"],
              },
            ],
          },
          {
            code: "N3-PRI-PEC-AQU",
            name: "Aquaculture",
            n4: [
              {
                code: "N4-AQU-001",
                name: "Pisciculture",
                activities: ["Tilapia", "Silure", "Carpe", "Machoiron"],
              },
              {
                code: "N4-AQU-002",
                name: "Support aquacole",
                activities: ["Écloseries", "Alimentation poisson", "Cages flottantes", "Bassins"],
              },
            ],
          },
        ],
      },
      {
        code: "N2-PRI-FOR",
        name: "Foresterie & environnement",
        n3: [
          {
            code: "N3-PRI-FOR-EXP",
            name: "Exploitation forestière",
            n4: [
              {
                code: "N4-EXP-001",
                name: "Bois d'œuvre",
                activities: ["Abattage", "Débardage", "Sciage", "Séchage"],
              },
            ],
          },
          {
            code: "N3-PRI-FOR-REB",
            name: "Reboisement & agroforesterie",
            n4: [
              {
                code: "N4-REB-001",
                name: "Reforestation",
                activities: ["Pépinières forestières", "Plantations", "Agroforesterie", "Carbone forestier"],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    code: "N1-SEC",
    name: "Secteur Secondaire : Industrie, BTP, Énergie",
    color: "bg-blue-500",
    icon: "🏭",
    n2: [
      {
        code: "N2-SEC-AGR",
        name: "Agro-industrie & transformation",
        n3: [
          {
            code: "N3-SEC-AGR-CAC",
            name: "Transformation cacao/café",
            n4: [
              {
                code: "N4-CAC-001",
                name: "Première transformation",
                activities: ["Fermentation", "Séchage", "Décorticage", "Torréfaction"],
              },
              {
                code: "N4-CAC-002",
                name: "Chocolaterie",
                activities: ["Chocolat", "Beurre de cacao", "Poudre de cacao", "Confiserie"],
              },
            ],
          },
          {
            code: "N3-SEC-AGR-HUI",
            name: "Huilerie & corps gras",
            n4: [
              {
                code: "N4-HUI-001",
                name: "Huiles végétales",
                activities: ["Huile de palme", "Huile de coco", "Huile d'arachide", "Huile de coton"],
              },
            ],
          },
          {
            code: "N3-SEC-AGR-BOI",
            name: "Boissons & jus",
            n4: [
              {
                code: "N4-BOI-001",
                name: "Production boissons",
                activities: ["Jus de fruits", "Eau minérale", "Boissons gazeuses", "Brasserie"],
              },
            ],
          },
          {
            code: "N3-SEC-AGR-CER",
            name: "Céréales transformées",
            n4: [
              {
                code: "N4-CER-001",
                name: "Minoterie & semoulerie",
                activities: ["Farine", "Semoule", "Couscous", "Attiéké industriel"],
              },
            ],
          },
        ],
      },
      {
        code: "N2-SEC-IND",
        name: "Industrie manufacturière",
        n3: [
          {
            code: "N3-SEC-IND-TEX",
            name: "Textile, habillement & mode",
            n4: [
              {
                code: "N4-TEX-001",
                name: "Filature & tissage",
                activities: ["Filature", "Tissage", "Teinture", "Impression textile"],
              },
              {
                code: "N4-TEX-002",
                name: "Confection",
                activities: ["Prêt-à-porter", "Uniformes", "Vêtements de travail", "Mode africaine"],
              },
              {
                code: "N4-TEX-003",
                name: "Accessoires",
                activities: ["Sacs", "Chaussures", "Maroquinerie", "Bijoux fantaisie"],
              },
            ],
          },
          {
            code: "N3-SEC-IND-PLA",
            name: "Plasturgie & emballages",
            n4: [
              {
                code: "N4-PLA-001",
                name: "Transformation plastique",
                activities: ["Sacherie", "Bouteilles PET", "Tuyaux PVC", "Films alimentaires"],
              },
              {
                code: "N4-PLA-002",
                name: "Emballages",
                activities: ["Cartons", "Papier kraft", "Emballages biodégradables", "Palettes"],
              },
            ],
          },
          {
            code: "N3-SEC-IND-CHI",
            name: "Chimie & cosmétiques",
            n4: [
              {
                code: "N4-CHI-001",
                name: "Produits d'entretien",
                activities: ["Savons", "Détergents", "Javel", "Désinfectants"],
              },
              {
                code: "N4-CHI-002",
                name: "Cosmétiques",
                activities: ["Crèmes", "Huiles corporelles", "Produits capillaires", "Parfums locaux"],
              },
            ],
          },
          {
            code: "N3-SEC-IND-MET",
            name: "Métallurgie & mécanique",
            n4: [
              {
                code: "N4-MET-001",
                name: "Travail des métaux",
                activities: ["Soudure", "Chaudronnerie", "Forge", "Fonderie"],
              },
              {
                code: "N4-MET-002",
                name: "Mécanique",
                activities: ["Usinage", "Pièces de rechange", "Outillage", "Quincaillerie"],
              },
            ],
          },
          {
            code: "N3-SEC-IND-BOI",
            name: "Bois & ameublement",
            n4: [
              {
                code: "N4-BOI-001",
                name: "Transformation du bois",
                activities: ["Scierie", "Contreplaqué", "Parquet", "Lambris"],
              },
              {
                code: "N4-BOI-002",
                name: "Menuiserie & ameublement",
                activities: ["Meubles", "Cuisines", "Portes", "Charpente"],
              },
            ],
          },
          {
            code: "N3-SEC-IND-MAT",
            name: "Matériaux de construction",
            n4: [
              {
                code: "N4-MAT-001",
                name: "Ciment & béton",
                activities: ["Cimenterie", "Béton prêt", "Pavés", "Agglos"],
              },
              {
                code: "N4-MAT-002",
                name: "Céramique & verre",
                activities: ["Carreaux", "Briques", "Verre plat", "Sanitaires"],
              },
            ],
          },
        ],
      },
      {
        code: "N2-SEC-BTP",
        name: "BTP & construction",
        n3: [
          {
            code: "N3-SEC-BTP-GEN",
            name: "Gros œuvre & génie civil",
            n4: [
              {
                code: "N4-GEN-001",
                name: "Construction",
                activities: ["Maçonnerie", "Béton armé", "Fondations", "Structure métallique"],
              },
              {
                code: "N4-GEN-002",
                name: "Génie civil",
                activities: ["Routes", "Ponts", "Barrages", "Terrassement"],
              },
              {
                code: "N4-GEN-003",
                name: "VRD",
                activities: ["Voirie", "Assainissement", "Adduction d'eau", "Réseaux divers"],
              },
            ],
          },
          {
            code: "N3-SEC-BTP-SEC",
            name: "Second œuvre & finitions",
            n4: [
              {
                code: "N4-SEC-001",
                name: "Électricité & plomberie",
                activities: ["Électricité bâtiment", "Plomberie", "Sanitaire", "Climatisation"],
              },
              {
                code: "N4-SEC-002",
                name: "Finitions",
                activities: ["Carrelage", "Peinture", "Faux-plafonds", "Menuiserie alu"],
              },
              {
                code: "N4-SEC-003",
                name: "Aménagement",
                activities: ["Décoration", "Agencement", "Paysagisme", "Domotique"],
              },
            ],
          },
          {
            code: "N3-SEC-BTP-ETU",
            name: "Études & ingénierie",
            n4: [
              {
                code: "N4-ETU-001",
                name: "Bureaux d'études",
                activities: ["Architecture", "Ingénierie structure", "Études techniques", "BIM"],
              },
              {
                code: "N4-ETU-002",
                name: "Contrôle & expertise",
                activities: ["Contrôle technique", "Topographie", "Expertise immobilière", "OPC"],
              },
            ],
          },
        ],
      },
      {
        code: "N2-SEC-ENE",
        name: "Énergie & environnement",
        n3: [
          {
            code: "N3-SEC-ENE-REN",
            name: "Énergies renouvelables",
            n4: [
              {
                code: "N4-REN-001",
                name: "Solaire",
                activities: ["Panneaux solaires", "Installation PV", "Maintenance solaire", "Batteries"],
              },
              {
                code: "N4-REN-002",
                name: "Biomasse & biogaz",
                activities: ["Biodigesteurs", "Briquettes", "Cogénération", "Valorisation déchets"],
              },
            ],
          },
          {
            code: "N3-SEC-ENE-ELE",
            name: "Électricité & distribution",
            n4: [
              {
                code: "N4-ELE-001",
                name: "Électricité",
                activities: ["Groupes électrogènes", "Onduleurs", "Transformateurs", "Mini-grids"],
              },
            ],
          },
          {
            code: "N3-SEC-ENE-ENV",
            name: "Environnement & recyclage",
            n4: [
              {
                code: "N4-ENV-001",
                name: "Gestion des déchets",
                activities: ["Collecte", "Tri", "Recyclage plastique", "Compostage"],
              },
              {
                code: "N4-ENV-002",
                name: "Traitement des eaux",
                activities: ["STEP", "Assainissement", "Eau potable", "Forages"],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    code: "N1-TER",
    name: "Secteur Tertiaire : Commerce, Services, Transport",
    color: "bg-purple-500",
    icon: "🏪",
    n2: [
      {
        code: "N2-TER-COM",
        name: "Commerce & distribution",
        n3: [
          {
            code: "N3-TER-COM-DET",
            name: "Commerce de détail",
            n4: [
              {
                code: "N4-DET-001",
                name: "Alimentation",
                activities: ["Supermarchés", "Supérettes", "Épiceries", "Boulangeries"],
              },
              {
                code: "N4-DET-002",
                name: "Non-alimentaire",
                activities: ["Boutiques mode", "Électroménager", "Quincaillerie", "Cosmétiques"],
              },
              {
                code: "N4-DET-003",
                name: "Franchises",
                activities: ["Franchises internationales", "Concepts locaux", "Corners"],
              },
            ],
          },
          {
            code: "N3-TER-COM-GRO",
            name: "Commerce de gros",
            n4: [
              {
                code: "N4-GRO-001",
                name: "Grossistes",
                activities: ["Grossistes alimentaires", "Semi-gros", "Cash & carry", "Centrales d'achat"],
              },
              {
                code: "N4-GRO-002",
                name: "Import-export",
                activities: ["Importateurs", "Exportateurs", "Négoce international", "Courtage"],
              },
            ],
          },
          {
            code: "N3-TER-COM-ECO",
            name: "E-commerce & digital",
            n4: [
              {
                code: "N4-ECO-001",
                name: "Vente en ligne",
                activities: ["Marketplaces", "Boutiques en ligne", "Réseaux sociaux", "Livraison e-com"],
              },
            ],
          },
        ],
      },
      {
        code: "N2-TER-SER",
        name: "Services aux entreprises",
        n3: [
          {
            code: "N3-TER-SER-PRO",
            name: "Services professionnels",
            n4: [
              {
                code: "N4-PRO-001",
                name: "Juridique & fiscal",
                activities: ["Avocats", "Notaires", "Fiscalistes", "Huissiers"],
              },
              {
                code: "N4-PRO-002",
                name: "Comptabilité & audit",
                activities: ["Experts-comptables", "Auditeurs", "Commissaires aux comptes", "Consulting finance"],
              },
              {
                code: "N4-PRO-003",
                name: "Conseil & RH",
                activities: ["Conseil en management", "Recrutement", "Formation pro", "Coaching"],
              },
            ],
          },
          {
            code: "N3-TER-SER-MAR",
            name: "Marketing & communication",
            n4: [
              {
                code: "N4-MAR-001",
                name: "Agences",
                activities: ["Agences pub", "Relations publiques", "Événementiel", "Production audiovisuelle"],
              },
              {
                code: "N4-MAR-002",
                name: "Digital marketing",
                activities: ["Social media", "SEO/SEA", "Content marketing", "Influence"],
              },
            ],
          },
          {
            code: "N3-TER-SER-INF",
            name: "Informatique & numérique",
            n4: [
              {
                code: "N4-INF-001",
                name: "Développement",
                activities: ["Web", "Mobile", "ERP", "Logiciels métier"],
              },
              {
                code: "N4-INF-002",
                name: "Infrastructure",
                activities: ["Infogérance", "Cloud", "Réseaux", "Cybersécurité"],
              },
              {
                code: "N4-INF-003",
                name: "Data & IA",
                activities: ["Data analytics", "BI", "Intelligence artificielle", "IoT"],
              },
            ],
          },
          {
            code: "N3-TER-SER-SEC",
            name: "Sécurité & gardiennage",
            n4: [
              {
                code: "N4-SEC-001",
                name: "Sécurité",
                activities: ["Gardiennage", "Vidéosurveillance", "Alarmes", "Transport de fonds"],
              },
            ],
          },
        ],
      },
      {
        code: "N2-TER-TRA",
        name: "Transport & logistique",
        n3: [
          {
            code: "N3-TER-TRA-MAR",
            name: "Transport de marchandises",
            n4: [
              {
                code: "N4-MAR-001",
                name: "Transport routier",
                activities: ["Camionnage", "Livraison dernier km", "Frigorifique", "Vrac"],
              },
              {
                code: "N4-MAR-002",
                name: "Transit & maritime",
                activities: ["Transit", "Affrètement", "Manutention portuaire", "Conteneurs"],
              },
            ],
          },
          {
            code: "N3-TER-TRA-LOG",
            name: "Logistique & entreposage",
            n4: [
              {
                code: "N4-LOG-001",
                name: "Entreposage",
                activities: ["Entrepôts", "Chambres froides", "Stockage vrac", "Zones franches"],
              },
              {
                code: "N4-LOG-002",
                name: "Supply chain",
                activities: ["3PL", "Fulfillment", "Reverse logistics", "Cross-docking"],
              },
            ],
          },
          {
            code: "N3-TER-TRA-PER",
            name: "Transport de personnes",
            n4: [
              {
                code: "N4-PER-001",
                name: "Transport urbain",
                activities: ["Taxis", "VTC", "Minibus", "Transport d'entreprise"],
              },
              {
                code: "N4-PER-002",
                name: "Location & tourisme",
                activities: ["Location véhicules", "Autocars", "Navettes aéroport"],
              },
            ],
          },
        ],
      },
      {
        code: "N2-TER-TOU",
        name: "Tourisme & hôtellerie-restauration",
        n3: [
          {
            code: "N3-TER-TOU-HOT",
            name: "Hôtellerie & hébergement",
            n4: [
              {
                code: "N4-HOT-001",
                name: "Hôtellerie",
                activities: ["Hôtels", "Résidences hôtelières", "Auberges", "Lodges"],
              },
              {
                code: "N4-HOT-002",
                name: "Location saisonnière",
                activities: ["Airbnb", "Villas", "Appartements meublés"],
              },
            ],
          },
          {
            code: "N3-TER-TOU-RES",
            name: "Restauration",
            n4: [
              {
                code: "N4-RES-001",
                name: "Restaurants",
                activities: ["Gastronomie", "Maquis", "Fast-food", "Food-court"],
              },
              {
                code: "N4-RES-002",
                name: "Services alimentaires",
                activities: ["Traiteurs", "Catering", "Food-truck", "Dark kitchen"],
              },
            ],
          },
          {
            code: "N3-TER-TOU-AGE",
            name: "Agences & loisirs",
            n4: [
              {
                code: "N4-AGE-001",
                name: "Tourisme",
                activities: ["Agences de voyages", "Tour-opérateurs", "Guides", "Écotourisme"],
              },
              {
                code: "N4-AGE-002",
                name: "Loisirs",
                activities: ["Parcs", "Plages privées", "Sports nautiques", "Événementiel festif"],
              },
            ],
          },
        ],
      },
      {
        code: "N2-TER-FIN",
        name: "Services financiers",
        n3: [
          {
            code: "N3-TER-FIN-BAN",
            name: "Banque & assurance",
            n4: [
              {
                code: "N4-BAN-001",
                name: "Services bancaires",
                activities: ["Banques commerciales", "Microfinance", "SFD", "Crédit-bail"],
              },
              {
                code: "N4-BAN-002",
                name: "Assurance",
                activities: ["Assurance vie", "IARD", "Courtage", "Mutualité"],
              },
            ],
          },
          {
            code: "N3-TER-FIN-TEC",
            name: "FinTech & paiements",
            n4: [
              {
                code: "N4-TEC-001",
                name: "Paiements digitaux",
                activities: ["Mobile money", "Agrégateurs", "Passerelles de paiement", "Crypto (agrément)"],
              },
            ],
          },
        ],
      },
      {
        code: "N2-TER-EDU",
        name: "Éducation & santé",
        n3: [
          {
            code: "N3-TER-EDU-FOR",
            name: "Formation & enseignement",
            n4: [
              {
                code: "N4-FOR-001",
                name: "Enseignement privé",
                activities: ["Écoles primaires", "Secondaires", "Universités privées", "Grandes écoles"],
              },
              {
                code: "N4-FOR-002",
                name: "Formation continue",
                activities: ["Centres de formation", "E-learning", "Certifications", "Langues"],
              },
            ],
          },
          {
            code: "N3-TER-EDU-SAN",
            name: "Santé & bien-être",
            n4: [
              {
                code: "N4-SAN-001",
                name: "Structures de soins",
                activities: ["Cliniques", "Cabinets médicaux", "Laboratoires", "Pharmacies"],
              },
              {
                code: "N4-SAN-002",
                name: "Bien-être",
                activities: ["Salles de sport", "Spas", "Instituts de beauté", "Médecine douce"],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    code: "N1-NUM",
    name: "Économie Numérique & Innovation",
    color: "bg-cyan-500",
    icon: "💻",
    n2: [
      {
        code: "N2-NUM-DEV",
        name: "Développement & Tech",
        n3: [
          {
            code: "N3-NUM-DEV-WEB",
            name: "Web & Mobile",
            n4: [
              {
                code: "N4-WEB-001",
                name: "Applications",
                activities: ["Apps iOS", "Apps Android", "PWA", "Cross-platform"],
              },
              {
                code: "N4-WEB-002",
                name: "Web",
                activities: ["Sites vitrine", "E-commerce", "SaaS", "Portails"],
              },
            ],
          },
          {
            code: "N3-NUM-DEV-FIN",
            name: "FinTech & InsurTech",
            n4: [
              {
                code: "N4-FIN-001",
                name: "Solutions financières",
                activities: ["Paiements", "Crédit digital", "Épargne", "Transferts"],
              },
            ],
          },
          {
            code: "N3-NUM-DEV-AGR",
            name: "AgriTech",
            n4: [
              {
                code: "N4-AGR-001",
                name: "Solutions agricoles",
                activities: ["Traçabilité", "Marketplace agricole", "Conseil digital", "Météo"],
              },
            ],
          },
          {
            code: "N3-NUM-DEV-EDU",
            name: "EdTech",
            n4: [
              {
                code: "N4-EDU-001",
                name: "E-learning",
                activities: ["Plateformes", "MOOC", "LMS", "Gamification"],
              },
            ],
          },
          {
            code: "N3-NUM-DEV-SAN",
            name: "HealthTech",
            n4: [
              {
                code: "N4-SAN-001",
                name: "Santé digitale",
                activities: ["Télémédecine", "Gestion patients", "Pharmacie en ligne", "Assurance santé"],
              },
            ],
          },
        ],
      },
      {
        code: "N2-NUM-SER",
        name: "Services numériques",
        n3: [
          {
            code: "N3-NUM-SER-BPO",
            name: "BPO & centres de contact",
            n4: [
              {
                code: "N4-BPO-001",
                name: "Externalisation",
                activities: ["Call centers", "Back-office", "Saisie de données", "Modération"],
              },
            ],
          },
          {
            code: "N3-NUM-SER-CRE",
            name: "Création digitale",
            n4: [
              {
                code: "N4-CRE-001",
                name: "Créatifs",
                activities: ["Graphic design", "UX/UI", "Animation 3D", "Jeux vidéo"],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    code: "N1-ART",
    name: "Artisanat & Industries Créatives",
    color: "bg-orange-500",
    icon: "🎨",
    n2: [
      {
        code: "N2-ART-PRO",
        name: "Artisanat de production",
        n3: [
          {
            code: "N3-ART-PRO-TEX",
            name: "Textile artisanal",
            n4: [
              {
                code: "N4-TEX-001",
                name: "Tissage & teinture",
                activities: ["Pagne tissé", "Bogolan", "Batik", "Tie & dye"],
              },
              {
                code: "N4-TEX-002",
                name: "Couture artisanale",
                activities: ["Tenues traditionnelles", "Broderie", "Haute couture africaine"],
              },
            ],
          },
          {
            code: "N3-ART-PRO-BOI",
            name: "Bois & vannerie",
            n4: [
              {
                code: "N4-BOI-001",
                name: "Ébénisterie artisanale",
                activities: ["Sculptures", "Masques", "Meubles traditionnels", "Instruments musique"],
              },
              {
                code: "N4-BOI-002",
                name: "Vannerie & sparterie",
                activities: ["Paniers", "Nattes", "Chapeaux", "Sacs naturels"],
              },
            ],
          },
          {
            code: "N3-ART-PRO-POT",
            name: "Poterie & céramique",
            n4: [
              {
                code: "N4-POT-001",
                name: "Poterie",
                activities: ["Canaris", "Jarres", "Décoration", "Vaisselle artisanale"],
              },
            ],
          },
        ],
      },
      {
        code: "N2-ART-CRE",
        name: "Industries créatives",
        n3: [
          {
            code: "N3-ART-CRE-MUS",
            name: "Musique & spectacle",
            n4: [
              {
                code: "N4-MUS-001",
                name: "Production musicale",
                activities: ["Studios d'enregistrement", "Labels", "Distribution digitale", "Management artiste"],
              },
              {
                code: "N4-MUS-002",
                name: "Spectacle vivant",
                activities: ["Concerts", "Théâtre", "Danse", "Festivals"],
              },
            ],
          },
          {
            code: "N3-ART-CRE-AUD",
            name: "Audiovisuel & cinéma",
            n4: [
              {
                code: "N4-AUD-001",
                name: "Production",
                activities: ["Films", "Séries", "Documentaires", "Publicités TV"],
              },
              {
                code: "N4-AUD-002",
                name: "Post-production",
                activities: ["Montage", "VFX", "Sound design", "Doublage"],
              },
            ],
          },
          {
            code: "N3-ART-CRE-MED",
            name: "Médias & presse",
            n4: [
              {
                code: "N4-MED-001",
                name: "Médias",
                activities: ["Presse écrite", "Radio", "Web media", "Podcasts"],
              },
            ],
          },
        ],
      },
    ],
  },
];

// Fonctions utilitaires
export const getSectorN1List = () => sectors.map((s) => ({ 
  code: s.code, 
  name: s.name, 
  color: s.color,
  icon: s.icon 
}));

export const getSectorN2List = (n1Code: string) => {
  const sector = sectors.find((s) => s.code === n1Code);
  return sector?.n2.map((n2) => ({ code: n2.code, name: n2.name })) || [];
};

export const getSectorN3List = (n2Code: string) => {
  for (const n1 of sectors) {
    const n2 = n1.n2.find((n) => n.code === n2Code);
    if (n2) {
      return n2.n3.map((n3) => ({ code: n3.code, name: n3.name }));
    }
  }
  return [];
};

export const getSectorN4List = (n3Code: string) => {
  for (const n1 of sectors) {
    for (const n2 of n1.n2) {
      const n3 = n2.n3.find((n) => n.code === n3Code);
      if (n3) {
        return n3.n4.map((n4) => ({ code: n4.code, name: n4.name }));
      }
    }
  }
  return [];
};

export const getActivities = (n3Code: string): string[] => {
  for (const n1 of sectors) {
    for (const n2 of n1.n2) {
      const n3 = n2.n3.find((n) => n.code === n3Code);
      if (n3) {
        return n3.n4.flatMap((n4) => n4.activities);
      }
    }
  }
  return [];
};

export const getActivitiesByN4 = (n4Code: string): string[] => {
  for (const n1 of sectors) {
    for (const n2 of n1.n2) {
      for (const n3 of n2.n3) {
        const n4 = n3.n4.find((n) => n.code === n4Code);
        if (n4) {
          return n4.activities;
        }
      }
    }
  }
  return [];
};

export const searchSectors = (query: string): { n1: string; n2: string; n3: string; n4: string; activity: string }[] => {
  const results: { n1: string; n2: string; n3: string; n4: string; activity: string }[] = [];
  const lowerQuery = query.toLowerCase();
  
  for (const n1 of sectors) {
    for (const n2 of n1.n2) {
      for (const n3 of n2.n3) {
        for (const n4 of n3.n4) {
          for (const activity of n4.activities) {
            if (
              n1.name.toLowerCase().includes(lowerQuery) ||
              n2.name.toLowerCase().includes(lowerQuery) ||
              n3.name.toLowerCase().includes(lowerQuery) ||
              n4.name.toLowerCase().includes(lowerQuery) ||
              activity.toLowerCase().includes(lowerQuery)
            ) {
              results.push({
                n1: n1.name,
                n2: n2.name,
                n3: n3.name,
                n4: n4.name,
                activity,
              });
            }
          }
        }
      }
    }
  }
  return results;
};

// Types pour les formulaires
export const opportunityTypes = [
  "Marché public",
  "Marché privé",
  "Consultation restreinte",
  "Appel à manifestation d'intérêt",
  "Demande de devis",
  "Partenariat",
  "Subvention",
  "Programme d'accompagnement",
] as const;

export const prestationTypes = [
  "Fournitures",
  "Services",
  "Travaux",
  "Prestations intellectuelles",
  "Location",
  "Mixte",
] as const;

export const priceModels = [
  "Forfait global",
  "Prix unitaires",
  "Bordereau de prix",
  "Temps & matériaux",
  "Cost plus",
  "Mixte",
] as const;

export const requiredDocuments = [
  "RCCM (Registre du Commerce)",
  "ARF (Attestation de Régularité Fiscale)",
  "DFE (Déclaration Fiscale d'Existence)",
  "Attestation CNPS",
  "Attestation CMU",
  "Certificat de conformité",
  "Attestation de capacité financière",
  "Relevés bancaires (3 derniers mois)",
  "États financiers (2 derniers exercices)",
  "Références clients",
  "CV du personnel clé",
  "Attestation d'assurance RC Pro",
  "Caution bancaire",
  "Certificat de qualité ISO",
  "Certificat phytosanitaire",
] as const;

export const kycLevels = ["Minimum", "Standard", "Renforcé", "Premium"] as const;

export const entityTypes = [
  "Entreprise individuelle",
  "SARL",
  "SA",
  "SAS",
  "SASU",
  "SNC",
  "SCS",
  "GIE",
  "Coopérative",
  "Association",
  "ONG",
  "Établissement public",
  "Société d'État",
] as const;

export const companySize = [
  "TPE (1-5 employés)",
  "PE (6-20 employés)",
  "ME (21-100 employés)",
  "ETI (101-500 employés)",
  "GE (500+ employés)",
] as const;

export const certifications = [
  "ISO 9001",
  "ISO 14001",
  "ISO 22000",
  "HACCP",
  "Fair Trade",
  "Bio / Organic",
  "UTZ",
  "Rainforest Alliance",
  "Made in CI",
  "Label Excellence CI",
  "CE",
  "NF",
] as const;
