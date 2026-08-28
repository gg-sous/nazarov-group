export type Service = {
  id: string;
  title: string;
  description: string;
  priceFrom: string;
  duration: string;
  marker: string;
};

export const services: Service[] = [
  {
    id: "complex-detailing",
    marker: "01",
    title: "Комплексный детейлинг",
    description:
      "Глубокий уход за кузовом и салоном по единому технологическому процессу.",
    priceFrom: "от 25 000 ₽",
    duration: "от 2 дней",
  },
  {
    id: "body-polishing",
    marker: "02",
    title: "Полировка кузова",
    description:
      "Коррекция мелких дефектов и восстановление глубины заводского цвета.",
    priceFrom: "от 15 000 ₽",
    duration: "1–2 дня",
  },
  {
    id: "ceramic-coating",
    marker: "03",
    title: "Керамическое покрытие",
    description:
      "Защитный состав для выразительного блеска и упрощённого ухода за кузовом.",
    priceFrom: "от 18 000 ₽",
    duration: "от 1 дня",
  },
  {
    id: "interior-cleaning",
    marker: "04",
    title: "Химчистка салона",
    description:
      "Деликатная очистка материалов салона с вниманием к труднодоступным зонам.",
    priceFrom: "от 12 000 ₽",
    duration: "от 8 часов",
  },
  {
    id: "detail-wash",
    marker: "05",
    title: "Детейлинг-мойка",
    description:
      "Безопасная многоэтапная мойка кузова, дисков, проёмов и внешних деталей.",
    priceFrom: "от 3 500 ₽",
    duration: "от 2 часов",
  },
  {
    id: "protective-coatings",
    marker: "06",
    title: "Защитные покрытия",
    description: "Подбор составов для кузова, стекла, дисков, кожи и текстиля.",
    priceFrom: "от 5 000 ₽",
    duration: "от 3 часов",
  },
];
