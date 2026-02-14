// Régions, districts, villes et communes de Côte d'Ivoire (mise à jour complète)
export interface Location {
  district: string;
  region: string;
  ville: string;
  commune: string;
}

// Districts administratifs
export const districts = [
  "DISTRICT AUTONOME D'ABIDJAN",
  "DISTRICT AUTONOME DE YAMOUSSOUKRO",
  "DISTRICT DES LAGUNES",
  "DISTRICT DE LA COMOÉ",
  "DISTRICT DU WOROBA",
  "DISTRICT DE LA VALLÉE DU BANDAMA",
  "DISTRICT DU ZANZAN",
  "DISTRICT DES SAVANES",
  "DISTRICT DU DENGUÉLÉ",
  "DISTRICT DU SASSANDRA-MARAHOUÉ",
  "DISTRICT DE LA NAWA",
  "DISTRICT DU GÔH-DJIBOUA",
  "DISTRICT DES MONTAGNES",
  "DISTRICT DU BAS-SASSANDRA",
] as const;

export type District = (typeof districts)[number];

// Régions administratives
export const regions = [
  "ABIDJAN",
  "YAMOUSSOUKRO",
  "LAGUNES",
  "AGNÉBY-TIASSA",
  "GRANDS-PONTS",
  "MÉ",
  "SUD-COMOÉ",
  "INDÉNIÉ-DJUABLIN",
  "BÉLIER",
  "GBÊKÊ",
  "HAMBOL",
  "IFFOU",
  "MORONOU",
  "N'ZI",
  "BOUNKANI",
  "GONTOUGO",
  "TCHOLOGO",
  "PORO",
  "BAGOUÉ",
  "KABADOUGOU",
  "FOLON",
  "BAFING",
  "BÉRÉ",
  "WORODOUGOU",
  "HAUT-SASSANDRA",
  "MARAHOUÉ",
  "SAN-PEDRO",
  "NAWA",
  "GBÔKLÉ",
  "LÔH-DJIBOUA",
  "GÔH",
  "CAVALLY",
  "GUÉMON",
  "TONKPI",
  "BAS-SASSANDRA",
] as const;

export type Region = (typeof regions)[number];

export const locations: Location[] = [
  // DISTRICT AUTONOME D'ABIDJAN
  { district: "DISTRICT AUTONOME D'ABIDJAN", region: "ABIDJAN", ville: "Abidjan", commune: "Abobo" },
  { district: "DISTRICT AUTONOME D'ABIDJAN", region: "ABIDJAN", ville: "Abidjan", commune: "Adjamé" },
  { district: "DISTRICT AUTONOME D'ABIDJAN", region: "ABIDJAN", ville: "Abidjan", commune: "Attécoubé" },
  { district: "DISTRICT AUTONOME D'ABIDJAN", region: "ABIDJAN", ville: "Abidjan", commune: "Cocody" },
  { district: "DISTRICT AUTONOME D'ABIDJAN", region: "ABIDJAN", ville: "Abidjan", commune: "Koumassi" },
  { district: "DISTRICT AUTONOME D'ABIDJAN", region: "ABIDJAN", ville: "Abidjan", commune: "Marcory" },
  { district: "DISTRICT AUTONOME D'ABIDJAN", region: "ABIDJAN", ville: "Abidjan", commune: "Plateau" },
  { district: "DISTRICT AUTONOME D'ABIDJAN", region: "ABIDJAN", ville: "Abidjan", commune: "Port-Bouët" },
  { district: "DISTRICT AUTONOME D'ABIDJAN", region: "ABIDJAN", ville: "Abidjan", commune: "Treichville" },
  { district: "DISTRICT AUTONOME D'ABIDJAN", region: "ABIDJAN", ville: "Abidjan", commune: "Yopougon" },
  { district: "DISTRICT AUTONOME D'ABIDJAN", region: "ABIDJAN", ville: "Abidjan", commune: "Anyama" },
  { district: "DISTRICT AUTONOME D'ABIDJAN", region: "ABIDJAN", ville: "Abidjan", commune: "Bingerville" },
  { district: "DISTRICT AUTONOME D'ABIDJAN", region: "ABIDJAN", ville: "Abidjan", commune: "Songon" },
  
  // DISTRICT AUTONOME DE YAMOUSSOUKRO
  { district: "DISTRICT AUTONOME DE YAMOUSSOUKRO", region: "YAMOUSSOUKRO", ville: "Yamoussoukro", commune: "Yamoussoukro" },
  
  // AGNÉBY-TIASSA
  { district: "DISTRICT DES LAGUNES", region: "AGNÉBY-TIASSA", ville: "Agboville", commune: "Agboville" },
  { district: "DISTRICT DES LAGUNES", region: "AGNÉBY-TIASSA", ville: "Adzopé", commune: "Adzopé" },
  { district: "DISTRICT DES LAGUNES", region: "AGNÉBY-TIASSA", ville: "Tiassalé", commune: "Tiassalé" },
  { district: "DISTRICT DES LAGUNES", region: "AGNÉBY-TIASSA", ville: "Sikensi", commune: "Sikensi" },
  { district: "DISTRICT DES LAGUNES", region: "AGNÉBY-TIASSA", ville: "Taabo", commune: "Taabo" },
  
  // GRANDS-PONTS
  { district: "DISTRICT DES LAGUNES", region: "GRANDS-PONTS", ville: "Dabou", commune: "Dabou" },
  { district: "DISTRICT DES LAGUNES", region: "GRANDS-PONTS", ville: "Grand-Lahou", commune: "Grand-Lahou" },
  { district: "DISTRICT DES LAGUNES", region: "GRANDS-PONTS", ville: "Jacqueville", commune: "Jacqueville" },
  
  // MÉ
  { district: "DISTRICT DES LAGUNES", region: "MÉ", ville: "Alépé", commune: "Alépé" },
  { district: "DISTRICT DES LAGUNES", region: "MÉ", ville: "Akoupé", commune: "Akoupé" },
  
  // SUD-COMOÉ
  { district: "DISTRICT DE LA COMOÉ", region: "SUD-COMOÉ", ville: "Aboisso", commune: "Aboisso" },
  { district: "DISTRICT DE LA COMOÉ", region: "SUD-COMOÉ", ville: "Grand-Bassam", commune: "Grand-Bassam" },
  { district: "DISTRICT DE LA COMOÉ", region: "SUD-COMOÉ", ville: "Bonoua", commune: "Bonoua" },
  { district: "DISTRICT DE LA COMOÉ", region: "SUD-COMOÉ", ville: "Adiaké", commune: "Adiaké" },
  { district: "DISTRICT DE LA COMOÉ", region: "SUD-COMOÉ", ville: "Tiapoum", commune: "Tiapoum" },
  
  // INDÉNIÉ-DJUABLIN
  { district: "DISTRICT DE LA COMOÉ", region: "INDÉNIÉ-DJUABLIN", ville: "Abengourou", commune: "Abengourou" },
  { district: "DISTRICT DE LA COMOÉ", region: "INDÉNIÉ-DJUABLIN", ville: "Agnibilékrou", commune: "Agnibilékrou" },
  { district: "DISTRICT DE LA COMOÉ", region: "INDÉNIÉ-DJUABLIN", ville: "Bettié", commune: "Bettié" },
  
  // BÉLIER
  { district: "DISTRICT DE LA VALLÉE DU BANDAMA", region: "BÉLIER", ville: "Toumodi", commune: "Toumodi" },
  { district: "DISTRICT DE LA VALLÉE DU BANDAMA", region: "BÉLIER", ville: "Tiébissou", commune: "Tiébissou" },
  { district: "DISTRICT DE LA VALLÉE DU BANDAMA", region: "BÉLIER", ville: "Didiévi", commune: "Didiévi" },
  { district: "DISTRICT DE LA VALLÉE DU BANDAMA", region: "BÉLIER", ville: "Djékanou", commune: "Djékanou" },
  
  // GBÊKÊ
  { district: "DISTRICT DE LA VALLÉE DU BANDAMA", region: "GBÊKÊ", ville: "Bouaké", commune: "Bouaké" },
  { district: "DISTRICT DE LA VALLÉE DU BANDAMA", region: "GBÊKÊ", ville: "Sakassou", commune: "Sakassou" },
  { district: "DISTRICT DE LA VALLÉE DU BANDAMA", region: "GBÊKÊ", ville: "Béoumi", commune: "Béoumi" },
  { district: "DISTRICT DE LA VALLÉE DU BANDAMA", region: "GBÊKÊ", ville: "Botro", commune: "Botro" },
  
  // HAMBOL
  { district: "DISTRICT DE LA VALLÉE DU BANDAMA", region: "HAMBOL", ville: "Katiola", commune: "Katiola" },
  { district: "DISTRICT DE LA VALLÉE DU BANDAMA", region: "HAMBOL", ville: "Dabakala", commune: "Dabakala" },
  { district: "DISTRICT DE LA VALLÉE DU BANDAMA", region: "HAMBOL", ville: "Niakara", commune: "Niakara" },
  
  // IFFOU
  { district: "DISTRICT DE LA VALLÉE DU BANDAMA", region: "IFFOU", ville: "Daoukro", commune: "Daoukro" },
  { district: "DISTRICT DE LA VALLÉE DU BANDAMA", region: "IFFOU", ville: "M'Bahiakro", commune: "M'Bahiakro" },
  { district: "DISTRICT DE LA VALLÉE DU BANDAMA", region: "IFFOU", ville: "Prikro", commune: "Prikro" },
  
  // MORONOU
  { district: "DISTRICT DE LA VALLÉE DU BANDAMA", region: "MORONOU", ville: "Bongouanou", commune: "Bongouanou" },
  { district: "DISTRICT DE LA VALLÉE DU BANDAMA", region: "MORONOU", ville: "M'Batto", commune: "M'Batto" },
  { district: "DISTRICT DE LA VALLÉE DU BANDAMA", region: "MORONOU", ville: "Arrah", commune: "Arrah" },
  
  // N'ZI
  { district: "DISTRICT DE LA VALLÉE DU BANDAMA", region: "N'ZI", ville: "Dimbokro", commune: "Dimbokro" },
  { district: "DISTRICT DE LA VALLÉE DU BANDAMA", region: "N'ZI", ville: "Bocanda", commune: "Bocanda" },
  { district: "DISTRICT DE LA VALLÉE DU BANDAMA", region: "N'ZI", ville: "Kouassi-Kouassikro", commune: "Kouassi-Kouassikro" },
  
  // BOUNKANI
  { district: "DISTRICT DU ZANZAN", region: "BOUNKANI", ville: "Bouna", commune: "Bouna" },
  { district: "DISTRICT DU ZANZAN", region: "BOUNKANI", ville: "Doropo", commune: "Doropo" },
  { district: "DISTRICT DU ZANZAN", region: "BOUNKANI", ville: "Nassian", commune: "Nassian" },
  { district: "DISTRICT DU ZANZAN", region: "BOUNKANI", ville: "Téhini", commune: "Téhini" },
  
  // GONTOUGO
  { district: "DISTRICT DU ZANZAN", region: "GONTOUGO", ville: "Bondoukou", commune: "Bondoukou" },
  { district: "DISTRICT DU ZANZAN", region: "GONTOUGO", ville: "Tanda", commune: "Tanda" },
  { district: "DISTRICT DU ZANZAN", region: "GONTOUGO", ville: "Transua", commune: "Transua" },
  { district: "DISTRICT DU ZANZAN", region: "GONTOUGO", ville: "Koun-Fao", commune: "Koun-Fao" },
  { district: "DISTRICT DU ZANZAN", region: "GONTOUGO", ville: "Sandégué", commune: "Sandégué" },
  
  // TCHOLOGO
  { district: "DISTRICT DES SAVANES", region: "TCHOLOGO", ville: "Ferkessédougou", commune: "Ferkessédougou" },
  { district: "DISTRICT DES SAVANES", region: "TCHOLOGO", ville: "Kong", commune: "Kong" },
  { district: "DISTRICT DES SAVANES", region: "TCHOLOGO", ville: "Ouangolodougou", commune: "Ouangolodougou" },
  
  // PORO
  { district: "DISTRICT DES SAVANES", region: "PORO", ville: "Korhogo", commune: "Korhogo" },
  { district: "DISTRICT DES SAVANES", region: "PORO", ville: "Sinématiali", commune: "Sinématiali" },
  { district: "DISTRICT DES SAVANES", region: "PORO", ville: "Dikodougou", commune: "Dikodougou" },
  { district: "DISTRICT DES SAVANES", region: "PORO", ville: "M'Bengué", commune: "M'Bengué" },
  
  // BAGOUÉ
  { district: "DISTRICT DES SAVANES", region: "BAGOUÉ", ville: "Boundiali", commune: "Boundiali" },
  { district: "DISTRICT DES SAVANES", region: "BAGOUÉ", ville: "Tengréla", commune: "Tengréla" },
  { district: "DISTRICT DES SAVANES", region: "BAGOUÉ", ville: "Kouto", commune: "Kouto" },
  
  // KABADOUGOU
  { district: "DISTRICT DU DENGUÉLÉ", region: "KABADOUGOU", ville: "Odienné", commune: "Odienné" },
  { district: "DISTRICT DU DENGUÉLÉ", region: "KABADOUGOU", ville: "Madinani", commune: "Madinani" },
  { district: "DISTRICT DU DENGUÉLÉ", region: "KABADOUGOU", ville: "Gbéléban", commune: "Gbéléban" },
  { district: "DISTRICT DU DENGUÉLÉ", region: "KABADOUGOU", ville: "Séguelon", commune: "Séguelon" },
  
  // FOLON
  { district: "DISTRICT DU DENGUÉLÉ", region: "FOLON", ville: "Minignan", commune: "Minignan" },
  { district: "DISTRICT DU DENGUÉLÉ", region: "FOLON", ville: "Kaniasso", commune: "Kaniasso" },
  
  // BAFING
  { district: "DISTRICT DU WOROBA", region: "BAFING", ville: "Touba", commune: "Touba" },
  { district: "DISTRICT DU WOROBA", region: "BAFING", ville: "Ouaninou", commune: "Ouaninou" },
  { district: "DISTRICT DU WOROBA", region: "BAFING", ville: "Koro", commune: "Koro" },
  
  // BÉRÉ
  { district: "DISTRICT DU WOROBA", region: "BÉRÉ", ville: "Mankono", commune: "Mankono" },
  { district: "DISTRICT DU WOROBA", region: "BÉRÉ", ville: "Kounahiri", commune: "Kounahiri" },
  { district: "DISTRICT DU WOROBA", region: "BÉRÉ", ville: "Dianra", commune: "Dianra" },
  
  // WORODOUGOU
  { district: "DISTRICT DU WOROBA", region: "WORODOUGOU", ville: "Séguéla", commune: "Séguéla" },
  { district: "DISTRICT DU WOROBA", region: "WORODOUGOU", ville: "Kani", commune: "Kani" },
  { district: "DISTRICT DU WOROBA", region: "WORODOUGOU", ville: "Massala", commune: "Massala" },
  
  // HAUT-SASSANDRA
  { district: "DISTRICT DU SASSANDRA-MARAHOUÉ", region: "HAUT-SASSANDRA", ville: "Daloa", commune: "Daloa" },
  { district: "DISTRICT DU SASSANDRA-MARAHOUÉ", region: "HAUT-SASSANDRA", ville: "Issia", commune: "Issia" },
  { district: "DISTRICT DU SASSANDRA-MARAHOUÉ", region: "HAUT-SASSANDRA", ville: "Vavoua", commune: "Vavoua" },
  { district: "DISTRICT DU SASSANDRA-MARAHOUÉ", region: "HAUT-SASSANDRA", ville: "Zoukougbeu", commune: "Zoukougbeu" },
  
  // MARAHOUÉ
  { district: "DISTRICT DU SASSANDRA-MARAHOUÉ", region: "MARAHOUÉ", ville: "Bouaflé", commune: "Bouaflé" },
  { district: "DISTRICT DU SASSANDRA-MARAHOUÉ", region: "MARAHOUÉ", ville: "Sinfra", commune: "Sinfra" },
  { district: "DISTRICT DU SASSANDRA-MARAHOUÉ", region: "MARAHOUÉ", ville: "Zuénoula", commune: "Zuénoula" },
  
  // SAN-PEDRO
  { district: "DISTRICT DU BAS-SASSANDRA", region: "SAN-PEDRO", ville: "San-Pédro", commune: "San-Pédro" },
  { district: "DISTRICT DU BAS-SASSANDRA", region: "SAN-PEDRO", ville: "Tabou", commune: "Tabou" },
  { district: "DISTRICT DU BAS-SASSANDRA", region: "SAN-PEDRO", ville: "Grand-Béréby", commune: "Grand-Béréby" },
  
  // NAWA
  { district: "DISTRICT DE LA NAWA", region: "NAWA", ville: "Soubré", commune: "Soubré" },
  { district: "DISTRICT DE LA NAWA", region: "NAWA", ville: "Buyo", commune: "Buyo" },
  { district: "DISTRICT DE LA NAWA", region: "NAWA", ville: "Guéyo", commune: "Guéyo" },
  { district: "DISTRICT DE LA NAWA", region: "NAWA", ville: "Méagui", commune: "Méagui" },
  
  // GBÔKLÉ
  { district: "DISTRICT DU BAS-SASSANDRA", region: "GBÔKLÉ", ville: "Sassandra", commune: "Sassandra" },
  { district: "DISTRICT DU BAS-SASSANDRA", region: "GBÔKLÉ", ville: "Fresco", commune: "Fresco" },
  
  // LÔH-DJIBOUA
  { district: "DISTRICT DU GÔH-DJIBOUA", region: "LÔH-DJIBOUA", ville: "Divo", commune: "Divo" },
  { district: "DISTRICT DU GÔH-DJIBOUA", region: "LÔH-DJIBOUA", ville: "Lakota", commune: "Lakota" },
  { district: "DISTRICT DU GÔH-DJIBOUA", region: "LÔH-DJIBOUA", ville: "Guitry", commune: "Guitry" },
  { district: "DISTRICT DU GÔH-DJIBOUA", region: "LÔH-DJIBOUA", ville: "Fresco", commune: "Fresco" },
  
  // GÔH
  { district: "DISTRICT DU GÔH-DJIBOUA", region: "GÔH", ville: "Gagnoa", commune: "Gagnoa" },
  { district: "DISTRICT DU GÔH-DJIBOUA", region: "GÔH", ville: "Oumé", commune: "Oumé" },
  
  // CAVALLY
  { district: "DISTRICT DES MONTAGNES", region: "CAVALLY", ville: "Guiglo", commune: "Guiglo" },
  { district: "DISTRICT DES MONTAGNES", region: "CAVALLY", ville: "Bloléquin", commune: "Bloléquin" },
  { district: "DISTRICT DES MONTAGNES", region: "CAVALLY", ville: "Toulépleu", commune: "Toulépleu" },
  { district: "DISTRICT DES MONTAGNES", region: "CAVALLY", ville: "Taï", commune: "Taï" },
  
  // GUÉMON
  { district: "DISTRICT DES MONTAGNES", region: "GUÉMON", ville: "Duékoué", commune: "Duékoué" },
  { district: "DISTRICT DES MONTAGNES", region: "GUÉMON", ville: "Bangolo", commune: "Bangolo" },
  { district: "DISTRICT DES MONTAGNES", region: "GUÉMON", ville: "Kouibly", commune: "Kouibly" },
  { district: "DISTRICT DES MONTAGNES", region: "GUÉMON", ville: "Facobly", commune: "Facobly" },
  
  // TONKPI
  { district: "DISTRICT DES MONTAGNES", region: "TONKPI", ville: "Man", commune: "Man" },
  { district: "DISTRICT DES MONTAGNES", region: "TONKPI", ville: "Danané", commune: "Danané" },
  { district: "DISTRICT DES MONTAGNES", region: "TONKPI", ville: "Biankouma", commune: "Biankouma" },
  { district: "DISTRICT DES MONTAGNES", region: "TONKPI", ville: "Zouan-Hounien", commune: "Zouan-Hounien" },
  { district: "DISTRICT DES MONTAGNES", region: "TONKPI", ville: "Sipilou", commune: "Sipilou" },
];

// Fonctions utilitaires
export const getDistrictList = (): string[] => {
  return [...new Set(locations.map((loc) => loc.district))];
};

export const getRegionsByDistrict = (district: string): string[] => {
  const regionSet = new Set(
    locations
      .filter((loc) => loc.district === district)
      .map((loc) => loc.region)
  );
  return [...regionSet];
};

export const getVillesByRegion = (region: string): string[] => {
  const villes = locations
    .filter((loc) => loc.region === region)
    .map((loc) => loc.ville);
  return [...new Set(villes)];
};

export const getCommunesByVille = (ville: string): string[] => {
  return locations.filter((loc) => loc.ville === ville).map((loc) => loc.commune);
};

export const getAllVilles = (): string[] => {
  return [...new Set(locations.map((loc) => loc.ville))].sort();
};

export const getAllCommunes = (): string[] => {
  return [...new Set(locations.map((loc) => loc.commune))].sort();
};

export const searchLocations = (query: string): Location[] => {
  const lowerQuery = query.toLowerCase();
  return locations.filter(
    (loc) =>
      loc.district.toLowerCase().includes(lowerQuery) ||
      loc.region.toLowerCase().includes(lowerQuery) ||
      loc.ville.toLowerCase().includes(lowerQuery) ||
      loc.commune.toLowerCase().includes(lowerQuery)
  );
};
