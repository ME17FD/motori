import type { NavCategory } from "../types";

export const MOCK_CATEGORIES: NavCategory[] = [
  {
    id: 68,
    label: "ENTRETIEN & PIÈCES D'USURE",
    href: "/shop/category/entretien-pieces-d-usure-68",
    children: [
      {
        id: 69,
        label: "Huiles & lubrifiants",
        href: "/shop/category/entretien-pieces-d-usure-huiles-lubrifiants-69",
        children: [
          { id: 70, label: "Huiles moteur",          href: "/shop/category/entretien-pieces-d-usure-huiles-lubrifiants-huiles-moteur-70" },
          { id: 72, label: "Huile de fourche",        href: "/shop/category/entretien-pieces-d-usure-huiles-lubrifiants-huile-de-fourche-72" },
          { id: 73, label: "Huile de transmission",   href: "/shop/category/entretien-pieces-d-usure-huiles-lubrifiants-huile-de-transmission-73" },
          { id: 74, label: "Liquide de frein",        href: "/shop/category/entretien-pieces-d-usure-huiles-lubrifiants-liquide-de-frein-74" },
          { id: 75, label: "Liquide de refroidissement", href: "/shop/category/entretien-pieces-d-usure-huiles-lubrifiants-liquide-de-refroidissement-75" },
          { id: 76, label: "Additifs",                href: "/shop/category/entretien-pieces-d-usure-huiles-lubrifiants-additifs-76" },
          { id: 77, label: "Graisses",                href: "/shop/category/entretien-pieces-d-usure-huiles-lubrifiants-graisses-77" },
        ],
      },
      {
        id: 78,
        label: "Entretien général",
        href: "/shop/category/entretien-pieces-d-usure-entretien-general-78",
        children: [
          { id: 79, label: "Entretien des filtres",       href: "/shop/category/entretien-pieces-d-usure-entretien-general-entretien-des-filtres-79" },
          { id: 80, label: "Produits spéciaux",           href: "/shop/category/entretien-pieces-d-usure-entretien-general-produits-speciaux-80" },
          { id: 81, label: "Entretien du kit chaine",     href: "/shop/category/entretien-pieces-d-usure-entretien-general-entretien-du-kit-chaine-81" },
          { id: 82, label: "Entretien de l'équipement",   href: "/shop/category/entretien-pieces-d-usure-entretien-general-entretien-de-l-equipement-82" },
          { id: 83, label: "Nettoyage de la moto",        href: "/shop/category/entretien-pieces-d-usure-entretien-general-nettoyage-de-la-moto-83" },
        ],
      },
      {
        id: 84,
        label: "Filtres",
        href: "/shop/category/entretien-pieces-d-usure-filtres-84",
        children: [
          { id: 89, label: "Filtres à essence",    href: "/shop/category/entretien-pieces-d-usure-filtres-filtres-a-essence-89" },
          { id: 90, label: "Filtres à air",        href: "/shop/category/entretien-pieces-d-usure-filtres-filtres-a-air-90" },
          { id: 91, label: "Filtres à huile",      href: "/shop/category/entretien-pieces-d-usure-filtres-filtres-a-huile-91" },
          { id: 92, label: "Filtres à air Racing", href: "/shop/category/entretien-pieces-d-usure-filtres-filtres-a-air-racing-92" },
        ],
      },
      {
        id: 103,
        label: "Transmission",
        href: "/shop/category/entretien-pieces-d-usure-transmission-103",
        children: [
          { id: 104, label: "Pignon sortie de boite",          href: "/shop/category/entretien-pieces-d-usure-transmission-pignon-sortie-de-boite-104" },
          { id: 105, label: "Couronnes de transmission",        href: "/shop/category/entretien-pieces-d-usure-transmission-couronnes-de-transmission-105" },
          { id: 107, label: "Chaines de transmission",          href: "/shop/category/entretien-pieces-d-usure-transmission-chaines-de-transmission-107" },
          { id: 108, label: "Courroies de transmission",        href: "/shop/category/entretien-pieces-d-usure-transmission-courroies-de-transmission-108" },
          { id: 149, label: "Galets et glissières de variateur", href: "/shop/category/entretien-pieces-d-usure-transmission-galets-et-glissieres-de-variateur-149" },
        ],
      },
      {
        id: 109,
        label: "Freinage",
        href: "/shop/category/entretien-pieces-d-usure-freinage-109",
        children: [
          { id: 110, label: "Plaquettes de freins", href: "/shop/category/entretien-pieces-d-usure-freinage-plaquettes-de-freins-110" },
          { id: 143, label: "Disques de frein",     href: "/shop/category/entretien-pieces-d-usure-freinage-disques-de-frein-143" },
        ],
      },
      {
        id: 111,
        label: "Allumage",
        href: "/shop/category/entretien-pieces-d-usure-allumage-111",
        children: [
          { id: 112, label: "Batteries",               href: "/shop/category/batteries-112" },
          { id: 145, label: "Bougies d'allumage",      href: "/shop/category/entretien-pieces-d-usure-allumage-bougies-d-allumage-145" },
          { id: 146, label: "Autres pièces électriques", href: "/shop/category/entretien-pieces-d-usure-allumage-autres-pieces-electriques-146" },
        ],
      },
      {
        id: 135,
        label: "Moteur & câbles",
        href: "/shop/category/entretien-pieces-d-usure-moteur-cables-135",
        children: [
          { id: 136, label: "Câbles",             href: "/shop/category/entretien-pieces-d-usure-moteur-cables-cables-136" },
          { id: 144, label: "Disques d'embrayage", href: "/shop/category/entretien-pieces-d-usure-moteur-cables-disques-d-embrayage-144" },
          { id: 148, label: "Kit de joints",       href: "/shop/category/entretien-pieces-d-usure-moteur-cables-kit-de-joints-148" },
          { id: 152, label: "Groupes & cylindres", href: "/shop/category/entretien-pieces-d-usure-moteur-cables-groupes-cylindres-152" },
        ],
      },
      {
        id: 139,
        label: "Partie cycle",
        href: "/shop/category/entretien-pieces-d-usure-partie-cycle-139",
        children: [
          { id: 140, label: "Joints spy de fourche", href: "/shop/category/entretien-pieces-d-usure-partie-cycle-joints-spy-de-fourche-140" },
          { id: 141, label: "Roulements",            href: "/shop/category/entretien-pieces-d-usure-partie-cycle-roulements-141" },
          { id: 142, label: "Amortisseurs",          href: "/shop/category/entretien-pieces-d-usure-partie-cycle-amortisseurs-142" },
        ],
      },
    ],
  },
  {
    id: 93,
    label: "PNEUMATIQUE",
    href: "/shop/category/pneumatique-93",
    children: [
      { id: 94,  label: "Routier",          href: "/shop/category/pneumatique-routier-94" },
      { id: 95,  label: "Hyper-sport",      href: "/shop/category/pneumatique-hyper-sport-95" },
      { id: 96,  label: "Scooter & ville",  href: "/shop/category/pneumatique-scooter-ville-96" },
      { id: 97,  label: "Trail & adventure",href: "/shop/category/pneumatique-trail-adventure-97" },
      { id: 98,  label: "Custom",           href: "/shop/category/pneumatique-custom-98" },
      { id: 99,  label: "Enduro & cross",   href: "/shop/category/pneumatique-enduro-cross-99" },
      { id: 100, label: "Quad & buggy",     href: "/shop/category/pneumatique-quad-buggy-100" },
      { id: 101, label: "Chambre à air",    href: "/shop/category/pneumatique-chambre-a-air-101" },
    ],
  },
  {
    id: 113,
    label: "ÉQUIPEMENTS",
    href: "/shop/category/equipements-113",
    children: [
      {
        id: 114,
        label: "Garage",
        href: "/shop/category/equipements-garage-114",
        children: [
          { id: 115, label: "Diabolos", href: "/shop/category/equipements-garage-diabolos-115" },
          { id: 132, label: "Viserie",  href: "/shop/category/equipements-garage-viserie-132" },
        ],
      },
      {
        id: 116,
        label: "Accessoires",
        href: "/shop/category/equipements-accessoires-116",
        children: [
          { id: 117, label: "Caches",                    href: "/shop/category/equipements-accessoires-caches-117" },
          { id: 137, label: "Bulles & sauts de vent",    href: "/shop/category/equipements-accessoires-bulles-sauts-de-vent-137" },
          { id: 157, label: "Caches mains & protections",href: "/shop/category/equipements-accessoires-caches-mains-protections-157" },
          { id: 161, label: "Contact & clé",             href: "/shop/category/equipements-accessoires-contact-cle-161" },
          { id: 164, label: "Extensions de béquilles",   href: "/shop/category/equipements-accessoires-extensions-de-bequilles-164" },
          { id: 165, label: "Protections du réservoir",  href: "/shop/category/equipements-accessoires-protections-du-reservoir-165" },
          { id: 167, label: "Carénage & autres",         href: "/shop/category/equipements-accessoires-carenage-autres-167" },
        ],
      },
      {
        id: 118,
        label: "Sécurité & extérieur",
        href: "/shop/category/equipements-securite-exterieur-118",
        children: [
          { id: 119, label: "Baches & housses", href: "/shop/category/equipements-securite-exterieur-baches-housses-119" },
          { id: 150, label: "Antivols",         href: "/shop/category/equipements-securite-exterieur-antivols-150" },
        ],
      },
      {
        id: 120,
        label: "Éléments de montage",
        href: "/shop/category/equipements-elements-de-montage-120",
        children: [
          { id: 121, label: "Reposes pieds & adaptateurs", href: "/shop/category/equipements-elements-de-montage-reposes-pieds-adaptateurs-121" },
          { id: 122, label: "Poignées & leviers",          href: "/shop/category/equipements-elements-de-montage-poignees-leviers-122" },
          { id: 133, label: "Bouchons",                    href: "/shop/category/equipements-elements-de-montage-bouchons-133" },
          { id: 163, label: "Rétroviseurs",                href: "/shop/category/equipements-elements-de-montage-retroviseurs-163" },
          { id: 173, label: "Guidons et accessoires",      href: "/shop/category/equipements-elements-de-montage-guidons-et-accessoires-173" },
        ],
      },
      {
        id: 123,
        label: "Protection de la moto",
        href: "/shop/category/equipements-protection-de-la-moto-123",
        children: [
          { id: 124, label: "Crashbars & top blocs",   href: "/shop/category/equipements-protection-de-la-moto-crashbars-top-blocs-124" },
          { id: 125, label: "Protection des optiques", href: "/shop/category/equipements-protection-de-la-moto-protection-des-optiques-125" },
          { id: 153, label: "Protection du radiateur", href: "/shop/category/equipements-protection-de-la-moto-protection-du-radiateur-153" },
          { id: 158, label: "Protection du moteur",    href: "/shop/category/equipements-protection-de-la-moto-protection-du-moteur-158" },
        ],
      },
      {
        id: 126,
        label: "Bagagerie",
        href: "/shop/category/equipements-bagagerie-126",
        children: [
          { id: 127, label: "Top-cases",                    href: "/shop/category/equipements-bagagerie-top-cases-127" },
          { id: 129, label: "Side-cases & sacoches latérales", href: "/shop/category/equipements-bagagerie-side-cases-sacoches-laterales-129" },
          { id: 162, label: "Sac de jambes",                href: "/shop/category/equipements-bagagerie-sac-de-jambes-162" },
        ],
      },
      {
        id: 130,
        label: "Eclairage",
        href: "/shop/category/equipements-eclairage-130",
        children: [
          { id: 131, label: "Feux additionnels",       href: "/shop/category/equipements-eclairage-feux-additionnels-131" },
          { id: 151, label: "Lampes",                  href: "/shop/category/equipements-eclairage-lampes-151" },
          { id: 155, label: "Clignotants customisés",  href: "/shop/category/equipements-eclairage-clignotants-customises-155" },
          { id: 156, label: "Feux d'origine",          href: "/shop/category/equipements-eclairage-feux-d-origine-156" },
        ],
      },
      {
        id: 159,
        label: "Pilote",
        href: "/shop/category/equipements-pilote-159",
        children: [
          { id: 175, label: "Casque intégral",      href: "/shop/category/equipements-pilote-casque-integral-175" },
          { id: 177, label: "Casque Open face",     href: "/shop/category/equipements-pilote-casque-open-face-177" },
          { id: 178, label: "Casque Cross - Enduro",href: "/shop/category/equipements-pilote-casque-cross-enduro-178" },
        ],
      },
    ],
  },
];
