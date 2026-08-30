import {
  CircleCheck,
  Focus,
  Handshake,
  Layers3,
  ReceiptText,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

const advantages = [
  {
    title: "Профессиональные материалы",
    text: "Подбираем составы под материал, состояние и ожидаемый результат.",
    icon: Layers3,
  },
  {
    title: "Аккуратная работа",
    text: "Соблюдаем технологию и уделяем внимание зонам, которые легко упустить.",
    icon: Focus,
  },
  {
    title: "Индивидуальный подход",
    text: "Не навязываем лишнее: предлагаем решение под задачи автомобиля.",
    icon: Handshake,
  },
  {
    title: "Прозрачная стоимость",
    text: "Согласовываем состав работ и цену до начала выполнения.",
    icon: ReceiptText,
  },
  {
    title: "Осмотр по времени",
    text: "Принимаем на первичный осмотр в выбранный свободный час без очереди.",
    icon: CircleCheck,
  },
];

export function AdvantagesSection() {
  return (
    <section
      id="about"
      className="scroll-mt-20 border-y border-white/10 bg-[#0d0d0d] py-20 sm:py-32"
    >
      <Container>
        <SectionHeading
          eyebrow="Подход"
          title="Спокойный сервис без лишних обещаний"
          description="NazarovGroup строит процесс вокруг качества исполнения, понятной коммуникации и бережного отношения к автомобилю."
        />
        <div className="grid border-t border-white/10 md:grid-cols-2 lg:grid-cols-5">
          {advantages.map(({ title, text, icon: Icon }, index) => (
            <article
              className="border-b border-white/10 py-7 md:px-6 md:first:pl-0 lg:border-r lg:last:border-r-0"
              key={title}
            >
              <div className="flex items-center justify-between">
                <Icon size={22} strokeWidth={1.5} className="text-zinc-400" />
                <span className="text-xs text-zinc-700">0{index + 1}</span>
              </div>
              <h3 className="mt-7 leading-6 font-semibold sm:mt-10">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-500">{text}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
