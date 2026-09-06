import { normalizeWord, type SignEntry } from "@/model/sign.schema";

/** catálogo estático del flujo "Texto -> Seña"  */
export const SIGN_DICTIONARY: SignEntry[] = [
  {
    id: "hola",
    word: "Hola",
    aliases: ["saludo", "saludar", "buenas"],
    videoUrl: "/videos/hola.mp4",
    description:
      "Mano abierta a la altura de la sien, palma al frente, con un movimiento breve hacia afuera.",
    modelAction: "hello",
  },
  {
    id: "gracias",
    word: "Gracias",
    aliases: ["agradecer", "agradecimiento", "muchas gracias"],
    videoUrl: "/videos/gracias.mp4",
    description:
      "Dedos juntos tocando el mentón y la mano desciende hacia adelante abriéndose.",
    modelAction: "thanks",
  },
  {
    id: "te-amo",
    word: "Te amo",
    aliases: ["te quiero", "amor", "amar"],
    videoUrl: "/videos/te-amo.mp4",
    description:
      "Mano al frente con pulgar, índice y meñique extendidos, palma hacia el interlocutor.",
    modelAction: "iloveyou",
  },
  {
    id: "por-favor",
    word: "Por favor",
    aliases: ["porfavor", "favor"],
    videoUrl: "/videos/por-favor.mp4",
    description:
      "Palma abierta sobre el pecho describiendo un movimiento circular.",
    modelAction: null,
  },
  {
    id: "si",
    word: "Sí",
    aliases: ["afirmativo", "claro", "correcto"],
    videoUrl: "/videos/si.mp4",
    description:
      "Puño cerrado que sube y baja desde la muñeca, imitando el asentir de la cabeza.",
    modelAction: null,
  },
  {
    id: "no",
    word: "No",
    aliases: ["negativo", "nunca"],
    videoUrl: "/videos/no.mp4",
    description:
      "Índice y medio extendidos que se cierran sobre el pulgar en un solo movimiento.",
    modelAction: null,
  },
  {
    id: "buenos-dias",
    word: "Buenos días",
    aliases: ["buen dia", "buenos dias", "buenos días"],
    videoUrl: "/videos/buenos-dias.mp4",
    description:
      "Seña de saludo seguida del antebrazo que se eleva desde el codo, como un amanecer.",
    modelAction: null,
  },
  {
    id: "adios",
    word: "Adiós",
    aliases: ["chao", "chau", "hasta luego", "despedida"],
    videoUrl: "/videos/adios.mp4",
    description:
      "Mano abierta a la altura del hombro con los dedos moviéndose hacia arriba y abajo.",
    modelAction: null,
  },
  {
    id: "perdon",
    word: "Perdón",
    aliases: ["disculpa", "disculpe", "lo siento", "perdona"],
    videoUrl: "/videos/perdon.mp4",
    description: "Puño cerrado que gira sobre el pecho en movimiento circular.",
    modelAction: null,
  },
  {
    id: "ayuda",
    word: "Ayuda",
    aliases: ["ayudar", "auxilio", "socorro"],
    videoUrl: "/videos/ayuda.mp4",
    description:
      "Puño con pulgar arriba apoyado sobre la palma contraria; ambas manos suben juntas.",
    modelAction: null,
  },
];


const signIndex = new Map<string, SignEntry>();

for (const entry of SIGN_DICTIONARY) {
  for (const key of [entry.word, ...entry.aliases]) {
    signIndex.set(normalizeWord(key), entry);
  }
}

export function getSignByWord(word: string): SignEntry | null {
  const key = normalizeWord(word);

  if (!key) {
    return null;
  }

  return signIndex.get(key) ?? null;
}

export function searchSigns(term: string, limit = 6): SignEntry[] {
  const key = normalizeWord(term);

  if (!key) {
    return [];
  }

  const startsWith: SignEntry[] = [];
  const contains: SignEntry[] = [];

  for (const entry of SIGN_DICTIONARY) {
    const haystack = [entry.word, ...entry.aliases].map(normalizeWord);

    if (haystack.some((value) => value.startsWith(key))) {
      startsWith.push(entry);
    } else if (haystack.some((value) => value.includes(key))) {
      contains.push(entry);
    }
  }

  return [...startsWith, ...contains].slice(0, limit);
}

export function listSigns(): SignEntry[] {
  return SIGN_DICTIONARY;
}
