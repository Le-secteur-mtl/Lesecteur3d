export const VIEWS = {
  overview: {
    label: "Plan 3D",
    camera: [18, 13, 20],
    target: [0, 3, 0],
    copy: "Vue globale du Secteur MTL : rez-de-chaussée vivant, mezzanine calme, promenade centrale."
  },
  accueil: {
    label: "Accueil",
    camera: [-10, 4.8, 12],
    target: [-8, 1.6, 4],
    copy: "Accueil fermé et humain, premier contact avec le lieu."
  },
  cantine: {
    label: "Cantine",
    camera: [-12, 4.4, 3],
    target: [-6, 1.4, -2],
    copy: "Grande cantine communautaire, support à l'expérience étudiante."
  },
  podcast: {
    label: "Podcast",
    camera: [12, 4.6, 9],
    target: [8, 1.4, 4],
    copy: "Grand studio podcast, crédible et traité acoustiquement."
  },
  mezzanine: {
    label: "Mezzanine",
    camera: [2, 8, 0],
    target: [4, 5, -6],
    copy: "Zones de travail et mentorat derrière cloisons vitrées acoustiques."
  }
};

export const ZONES = [
  { name: "GLASS_RECEPTION_MAIN", view: "accueil", label: "Accueil fermé" },
  { name: "CANTINE_COUNTER_MAIN", view: "cantine", label: "Cantine communautaire" },
  { name: "FURN_LOUNGE_GROUP", view: "overview", label: "Lounge" },
  { name: "PODCAST_ROOM_MAIN", view: "podcast", label: "Studio podcast" },
  { name: "GLASS_EVENT_ROOM", view: "overview", label: "Salle événement / conférence" },
  { name: "GLASS_STUDY_ROOMS", view: "mezzanine", label: "Mezzanine calme" }
];
