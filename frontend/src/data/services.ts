export type Service = {
  id: string;
  title: string;
  description: string;
  priceFrom: string;
  marker: string;
  image_url?: string | null;
};

export const services: Service[] = [
  {
    id: "complex-detailing",
    marker: "01",
    title: "Комплексный детейлинг",
    description:
      "Глубокий уход за кузовом и салоном по единому технологическому процессу.",
    priceFrom: "от 25 000 ₽",
  },
  {
    id: "body-polishing",
    marker: "02",
    title: "Полировка кузова",
    description:
      "Коррекция мелких дефектов и восстановление глубины заводского цвета.",
    priceFrom: "от 15 000 ₽",
  },
  {
    id: "ceramic-coating",
    marker: "03",
    title: "Керамическое покрытие",
    description:
      "Защитный состав для выразительного блеска и упрощённого ухода за кузовом.",
    priceFrom: "от 18 000 ₽",
  },
  {
    id: "interior-cleaning",
    marker: "04",
    title: "Химчистка салона",
    description:
      "Деликатная очистка материалов салона с вниманием к труднодоступным зонам.",
    priceFrom: "от 12 000 ₽",
  },
  {
    id: "detail-wash",
    marker: "05",
    title: "Детейлинг-мойка",
    description:
      "Безопасная многоэтапная мойка кузова, дисков, проёмов и внешних деталей.",
    priceFrom: "от 3 500 ₽",
  },
  {
    id: "protective-coatings",
    marker: "06",
    title: "Защитные покрытия",
    description: "Подбор составов для кузова, стекла, дисков, кожи и текстиля.",
    priceFrom: "от 5 000 ₽",
  },
];
