export type PortfolioItem = {
  id: string;
  title: string;
  category: string;
  treatment: string;
  tone: "graphite" | "silver" | "black";
  image_url: string | null;
};

export const portfolioItems: PortfolioItem[] = [
  {
    id: "body",
    title: "Глубина цвета",
    category: "Кузов",
    treatment: "Полировка + защита",
    tone: "black",
    image_url: null,
  },
  {
    id: "interior",
    title: "Чистая фактура",
    category: "Салон",
    treatment: "Деликатная химчистка",
    tone: "silver",
    image_url: null,
  },
  {
    id: "finish",
    title: "Защищённый блеск",
    category: "Покрытие",
    treatment: "Керамический состав",
    tone: "graphite",
    image_url: null,
  },
];
