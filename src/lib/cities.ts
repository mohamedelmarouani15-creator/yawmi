export interface City {
  name: string;
  lat:  number;
  lng:  number;
}

export const CITIES: City[] = [
  { name: "Paris",       lat: 48.8566,  lng:  2.3522  },
  { name: "Lyon",        lat: 45.7640,  lng:  4.8357  },
  { name: "Marseille",   lat: 43.2965,  lng:  5.3698  },
  { name: "Bordeaux",    lat: 44.8378,  lng: -0.5792  },
  { name: "Toulouse",    lat: 43.6047,  lng:  1.4442  },
  { name: "Strasbourg",  lat: 48.5734,  lng:  7.7521  },
  { name: "Bruxelles",   lat: 50.8503,  lng:  4.3517  },
  { name: "Genève",      lat: 46.2044,  lng:  6.1432  },
  { name: "Montréal",    lat: 45.5017,  lng: -73.5673 },
  { name: "Casablanca",  lat: 33.5731,  lng: -7.5898  },
  { name: "Rabat",       lat: 34.0209,  lng: -6.8416  },
  { name: "Alger",       lat: 36.7372,  lng:  3.0864  },
  { name: "Tunis",       lat: 36.8190,  lng: 10.1658  },
  { name: "Istanbul",    lat: 41.0082,  lng: 28.9784  },
  { name: "Le Caire",    lat: 30.0444,  lng: 31.2357  },
  { name: "Dubaï",       lat: 25.2048,  lng: 55.2708  },
  { name: "Londres",     lat: 51.5074,  lng: -0.1278  },
];
