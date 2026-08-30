"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Download,
  ExternalLink,
  ImagePlus,
  LogOut,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

import { adminNavigation } from "@/data/admin";
import { MediaImage } from "@/components/ui/media-image";
import type {
  AdminBooking,
  BookingStatus,
  ContactsContent,
  HeroContent,
  LegalContent,
  PortfolioContent,
  ServiceContent,
  SiteContentBundle,
} from "@/types/content";

const inputClass =
  "min-h-11 w-full rounded-lg border border-white/10 bg-[#090909] px-3.5 text-sm text-white outline-none focus:border-[#d71920]";

type MediaUploadResult = {
  url: string;
  width: number;
  height: number;
  original_bytes: number;
  optimized_bytes: number;
};

function formatFileSize(bytes: number) {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} МБ`
    : `${Math.max(1, Math.round(bytes / 1024))} КБ`;
}

async function readUploadError(response: Response) {
  const body = (await response.json().catch(() => null)) as {
    detail?: string;
  } | null;
  return body?.detail ?? "Не удалось обработать изображение";
}

function Field({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={wide ? "md:col-span-2" : ""}>
      <span className="mb-2 block text-xs font-medium text-[#8d8d8d]">
        {label}
      </span>
      {children}
    </label>
  );
}

function Section({
  id,
  index,
  title,
  description,
  children,
}: {
  id: string;
  index: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-6">
      <p className="text-[11px] font-semibold tracking-[0.2em] text-[#d71920] uppercase">
        {index}
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-1.5 text-sm text-[#777]">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function AdminDashboard({
  initialContent,
  initialBookings,
}: {
  initialContent: SiteContentBundle;
  initialBookings: AdminBooking[];
}) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [bookings, setBookings] = useState(initialBookings);
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeSection, setActiveSection] = useState("overview");
  const mobileNavigationRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sectionIds = adminNavigation
      .slice(0, 7)
      .map(({ href }) => href.slice(1));
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);
    let frame = 0;

    const updateActiveSection = () => {
      frame = 0;
      const marker = Math.min(220, window.innerHeight * 0.3);
      let current = sections[0]?.id ?? "overview";
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= marker) {
          current = section.id;
        }
      }
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4
      ) {
        current = sections.at(-1)?.id ?? current;
      }
      setActiveSection((previous) =>
        previous === current ? previous : current,
      );
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (window.innerWidth >= 1024) return;
    const activeLink = mobileNavigationRef.current?.querySelector<HTMLElement>(
      `[data-admin-section="${activeSection}"]`,
    );
    activeLink?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeSection]);

  function updateHero(field: keyof HeroContent, value: string) {
    setContent((current) => ({
      ...current,
      hero: { ...current.hero, [field]: value },
    }));
  }
  function updateContacts(field: keyof ContactsContent, value: string) {
    setContent((current) => ({
      ...current,
      contacts: { ...current.contacts, [field]: value },
    }));
  }
  function updateService(index: number, patch: Partial<ServiceContent>) {
    setContent((current) => ({
      ...current,
      services: current.services.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    }));
  }
  function updatePortfolio(index: number, patch: Partial<PortfolioContent>) {
    setContent((current) => ({
      ...current,
      portfolio: current.portfolio.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    }));
  }
  function updateLegal(index: number, patch: Partial<LegalContent>) {
    setContent((current) => ({
      ...current,
      legal: current.legal.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    }));
  }

  async function save() {
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      if (response.status === 401) {
        router.push("/admin/login");
        router.refresh();
        return;
      }
      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as {
          detail?: string;
        } | null;
        throw new Error(error?.detail ?? "Не удалось сохранить данные");
      }
      setContent((await response.json()) as SiteContentBundle);
      setMessage(
        "Изменения сохранены. Они появятся на сайте после обновления страницы.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ошибка сохранения");
    } finally {
      setPending(false);
    }
  }

  async function uploadHeroImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage("");
    const formData = new FormData();
    formData.append("image", file);
    try {
      const response = await fetch("/api/admin/media", {
        method: "POST",
        credentials: "same-origin",
        body: formData,
      });
      if (!response.ok) throw new Error(await readUploadError(response));
      const result = (await response.json()) as MediaUploadResult;
      updateHero("image_url", result.url);
      setMessage(
        `Hero обработан автоматически: ${result.width}×${result.height}, ${formatFileSize(result.original_bytes)} → ${formatFileSize(result.optimized_bytes)}. Нажмите «Сохранить изменения».`,
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ошибка загрузки");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function uploadPortfolioImage(
    index: number,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage("");
    const formData = new FormData();
    formData.append("image", file);
    try {
      const response = await fetch("/api/admin/media", {
        method: "POST",
        credentials: "same-origin",
        body: formData,
      });
      if (!response.ok) throw new Error(await readUploadError(response));
      const result = (await response.json()) as MediaUploadResult;
      updatePortfolio(index, { image_url: result.url });
      setMessage(
        `Фотография обработана: ${result.width}×${result.height}, ${formatFileSize(result.original_bytes)} → ${formatFileSize(result.optimized_bytes)}. Нажмите «Сохранить изменения».`,
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ошибка загрузки");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function uploadServiceImage(
    index: number,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage("");
    const formData = new FormData();
    formData.append("image", file);
    try {
      const response = await fetch("/api/admin/media", {
        method: "POST",
        credentials: "same-origin",
        body: formData,
      });
      if (!response.ok) throw new Error(await readUploadError(response));
      const result = (await response.json()) as MediaUploadResult;
      updateService(index, { image_url: result.url });
      setMessage(
        `Изображение услуги обработано: ${result.width}×${result.height}, ${formatFileSize(result.original_bytes)} → ${formatFileSize(result.optimized_bytes)}. Нажмите «Сохранить изменения».`,
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ошибка загрузки");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", {
      method: "POST",
      credentials: "same-origin",
    });
    router.push("/admin/login");
    router.refresh();
  }

  async function changeBookingStatus(bookingId: string, status: BookingStatus) {
    setMessage("");
    const response = await fetch(`/api/admin/bookings/${bookingId}/status`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      setMessage("Не удалось изменить статус записи.");
      return;
    }
    const updated = (await response.json()) as AdminBooking;
    setBookings((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    );
    setMessage("Статус записи обновлён.");
  }

  return (
    <div className="min-h-screen bg-[#090909] text-[#f5f5f5]">
      <aside className="border-b border-white/8 bg-[#0c0c0c] lg:fixed lg:inset-y-0 lg:w-64 lg:border-r lg:border-b-0">
        <div className="flex h-16 items-center gap-3 px-4 sm:h-20 sm:px-5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-[#d71920] text-xs font-black">
            NG
          </span>
          <div>
            <p className="text-sm font-semibold">NazarovGroup</p>
            <p className="text-[10px] tracking-[0.2em] text-[#666] uppercase">
              Admin
            </p>
          </div>
        </div>
        <nav
          ref={mobileNavigationRef}
          className="flex snap-x gap-1 overflow-x-auto px-3 pb-3 lg:block lg:overflow-visible lg:py-3"
          aria-label="Разделы управления"
        >
          {adminNavigation.slice(0, 7).map(({ label, href, icon: Icon }) => {
            const sectionId = href.slice(1);
            const isActive = activeSection === sectionId;
            return (
              <a
                key={href}
                href={href}
                data-admin-section={sectionId}
                aria-current={isActive ? "location" : undefined}
                onClick={() => setActiveSection(sectionId)}
                className={`flex shrink-0 snap-start items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors ${isActive ? "border-white/10 bg-white/[0.07] text-white" : "border-transparent text-[#888] hover:bg-white/[0.03] hover:text-[#ccc]"}`}
              >
                <Icon
                  className={`size-4 ${isActive ? "text-[#d71920]" : "text-[#666]"}`}
                />
                {label}
              </a>
            );
          })}
        </nav>
        <button
          onClick={logout}
          className="mx-4 mb-4 inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2.5 text-sm text-[#999] sm:mx-5 lg:absolute lg:inset-x-0 lg:bottom-3 lg:m-3"
        >
          <LogOut className="size-4" />
          Выйти
        </button>
      </aside>

      <main className="lg:ml-64">
        <header className="border-b border-white/8 px-4 py-5 sm:px-6 lg:px-10">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-[#777]">Панель управления</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                Контент сайта
              </h1>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <Link
                href="/"
                target="_blank"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/10 bg-[#111] px-3 text-center text-sm sm:px-4"
              >
                Открыть сайт
                <ExternalLink className="size-4" />
              </Link>
              <button
                onClick={save}
                disabled={pending}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#d71920] px-3 text-center text-sm font-semibold disabled:opacity-60 sm:px-4"
              >
                <Save className="size-4" />
                {pending ? "Сохраняем…" : "Сохранить изменения"}
              </button>
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-7xl space-y-14 px-4 py-8 sm:px-6 lg:px-10">
          {message ? (
            <div
              role="status"
              className="rounded-lg border border-white/10 bg-[#111] px-4 py-3 text-sm text-[#cfcfcf]"
            >
              {message}
            </div>
          ) : null}

          <section id="overview" className="scroll-mt-6">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Записи", bookings.length],
                ["Услуги", content.services.length],
                ["Работы", content.portfolio.length],
                ["Документы", content.legal.length],
              ].map(([label, value]) => (
                <article
                  key={label}
                  className="rounded-xl border border-white/8 bg-[#111] p-5"
                >
                  <p className="text-xs text-[#777]">{label}</p>
                  <p className="mt-3 text-3xl font-semibold">{value}</p>
                </article>
              ))}
            </div>
          </section>

          <Section
            id="bookings"
            index="01 / Заявки"
            title="Записи клиентов"
            description="Новые заявки, контактные данные и рабочие статусы без оплаты."
          >
            <div className="mb-3 flex justify-end">
              <a
                href="/api/admin/bookings/export.xlsx"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/10 bg-[#111] px-4 text-sm transition-colors hover:border-white/25 hover:bg-[#181818]"
              >
                <Download className="size-4 text-[#d71920]" />
                Выгрузить Excel
              </a>
            </div>
            <div className="overflow-hidden rounded-xl border border-white/8 bg-[#111]">
              {bookings.length ? (
                <div
                  className={`divide-y divide-white/8 ${bookings.length > 5 ? "max-h-[570px] overflow-y-auto overscroll-contain" : ""}`}
                >
                  {bookings.map((booking) => (
                    <article
                      key={booking.id}
                      className="grid gap-4 p-5 lg:grid-cols-[1fr_1fr_150px_180px] lg:items-center"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {booking.client_name}
                        </p>
                        <a
                          href={`tel:${booking.client_phone}`}
                          className="mt-1 block text-xs text-[#d71920]"
                        >
                          {booking.client_phone}
                        </a>
                        <p className="mt-2 text-xs text-[#999]">
                          {booking.vehicle_model} · {booking.vehicle_color}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-[#ddd]">
                          {booking.service_name}
                        </p>
                        <p className="mt-1 text-xs text-[#777]">
                          {booking.date} · {booking.start_time.slice(0, 5)}–
                          {booking.end_time.slice(0, 5)}
                        </p>
                      </div>
                      <p className="text-xs text-[#777]">
                        #{booking.id.slice(0, 8)}
                      </p>
                      <select
                        aria-label={`Статус записи ${booking.client_name}`}
                        className={inputClass}
                        value={booking.status}
                        onChange={(event) =>
                          changeBookingStatus(
                            booking.id,
                            event.target.value as BookingStatus,
                          )
                        }
                      >
                        <option value="confirmed">Подтверждена</option>
                        <option value="completed">Выполнена</option>
                        <option value="cancelled">Отменена</option>
                        <option value="no_show">Не приехал</option>
                      </select>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="p-8 text-center text-sm text-[#777]">
                  Записей пока нет.
                </p>
              )}
            </div>
          </Section>

          <Section
            id="hero"
            index="01 / Главный экран"
            title="Hero-блок"
            description="Текст и основное изображение первой секции сайта."
          >
            <div className="grid overflow-hidden rounded-xl border border-white/8 bg-[#111] xl:grid-cols-[0.8fr_1.2fr]">
              <div className="border-b border-white/8 p-5 xl:border-r xl:border-b-0">
                <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-black">
                  <MediaImage
                    src={content.hero.image_url}
                    alt="Hero"
                    fill
                    sizes="(max-width: 1280px) 100vw, 40vw"
                    className="object-cover opacity-80"
                  />
                </div>
                <label className="mt-3 flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 text-sm">
                  <ImagePlus className="size-4 text-[#d71920]" />
                  {uploading ? "Загрузка…" : "Заменить изображение"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={uploadHeroImage}
                    disabled={uploading}
                    className="sr-only"
                  />
                </label>
                <p className="mt-3 text-xs leading-5 text-[#777]">
                  JPG, PNG или WebP до 8 МБ. Сайт сам исправит ориентацию,
                  удалит метаданные и подготовит три WebP-размера.
                </p>
              </div>
              <div className="grid gap-5 p-5 md:grid-cols-2">
                <Field label="Надзаголовок">
                  <input
                    className={inputClass}
                    value={content.hero.eyebrow}
                    onChange={(e) => updateHero("eyebrow", e.target.value)}
                  />
                </Field>
                <Field label="Бренд">
                  <input
                    className={inputClass}
                    value={content.hero.accent}
                    onChange={(e) => updateHero("accent", e.target.value)}
                  />
                </Field>
                <Field label="Заголовок" wide>
                  <input
                    className={inputClass}
                    value={content.hero.title}
                    onChange={(e) => updateHero("title", e.target.value)}
                  />
                </Field>
                <Field label="Описание" wide>
                  <textarea
                    className={`${inputClass} min-h-28 py-3`}
                    value={content.hero.description}
                    onChange={(e) => updateHero("description", e.target.value)}
                  />
                </Field>
                <Field label="Основная кнопка">
                  <input
                    className={inputClass}
                    value={content.hero.primary_button}
                    onChange={(e) =>
                      updateHero("primary_button", e.target.value)
                    }
                  />
                </Field>
                <Field label="Вторая кнопка">
                  <input
                    className={inputClass}
                    value={content.hero.secondary_button}
                    onChange={(e) =>
                      updateHero("secondary_button", e.target.value)
                    }
                  />
                </Field>
              </div>
            </div>
          </Section>

          <Section
            id="services"
            index="02 / Каталог"
            title="Услуги"
            description="Редактируйте карточки, цены, сроки и видимость."
          >
            <div
              className={`space-y-3 ${content.services.length > 5 ? "max-h-[980px] overflow-y-auto overscroll-contain pr-2" : ""}`}
            >
              {content.services.map((service, index) => (
                <article
                  key={service.id}
                  className="rounded-xl border border-white/8 bg-[#111] p-5"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#d71920]">
                      {service.marker}
                    </span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-xs text-[#999]">
                        <input
                          type="checkbox"
                          checked={service.is_active}
                          onChange={(e) =>
                            updateService(index, {
                              is_active: e.target.checked,
                            })
                          }
                          className="accent-[#d71920]"
                        />
                        Опубликована
                      </label>
                      <label className="flex items-center gap-2 text-xs text-[#999]">
                        <input
                          type="checkbox"
                          checked={service.is_featured}
                          onChange={(e) =>
                            updateService(index, {
                              is_featured: e.target.checked,
                            })
                          }
                          className="accent-[#d71920]"
                        />
                        На главной
                      </label>
                      <button
                        onClick={() =>
                          setContent((current) => ({
                            ...current,
                            services: current.services.filter(
                              (_, i) => i !== index,
                            ),
                          }))
                        }
                        aria-label="Удалить услугу"
                        className="text-[#777]"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mb-5 grid gap-3 sm:grid-cols-[220px_1fr] sm:items-center">
                    {service.image_url ? (
                      <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
                        <MediaImage
                          src={service.image_url}
                          alt={service.title}
                          fill
                          sizes="220px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="grid aspect-video place-items-center rounded-lg border border-dashed border-white/10 bg-[#090909] text-xs text-[#666]">
                        Изображение не загружено
                      </div>
                    )}
                    <label className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 text-sm">
                      <ImagePlus className="size-4 text-[#d71920]" />
                      {uploading ? "Загрузка…" : "Загрузить изображение услуги"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(event) => uploadServiceImage(index, event)}
                        disabled={uploading}
                        className="sr-only"
                      />
                    </label>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Field label="Название">
                      <input
                        className={inputClass}
                        value={service.title}
                        onChange={(e) =>
                          updateService(index, { title: e.target.value })
                        }
                      />
                    </Field>
                    <Field label="Цена">
                      <input
                        className={inputClass}
                        value={service.price_from}
                        onChange={(e) =>
                          updateService(index, { price_from: e.target.value })
                        }
                      />
                    </Field>
                    <Field label="Срок">
                      <input
                        className={inputClass}
                        value={service.duration}
                        onChange={(e) =>
                          updateService(index, { duration: e.target.value })
                        }
                      />
                    </Field>
                    <Field label="Маркер">
                      <input
                        className={inputClass}
                        value={service.marker}
                        onChange={(e) =>
                          updateService(index, { marker: e.target.value })
                        }
                      />
                    </Field>
                    <Field label="Длительность, минут">
                      <input
                        className={inputClass}
                        type="number"
                        min={30}
                        max={2880}
                        value={service.duration_minutes}
                        onChange={(e) =>
                          updateService(index, {
                            duration_minutes: Number(e.target.value),
                          })
                        }
                      />
                    </Field>
                    <Field label="Порядок">
                      <input
                        className={inputClass}
                        type="number"
                        min={0}
                        max={10000}
                        value={service.sort_order}
                        onChange={(e) =>
                          updateService(index, {
                            sort_order: Number(e.target.value),
                          })
                        }
                      />
                    </Field>
                    <Field label="Описание" wide>
                      <textarea
                        className={`${inputClass} min-h-20 py-3`}
                        value={service.description}
                        onChange={(e) =>
                          updateService(index, { description: e.target.value })
                        }
                      />
                    </Field>
                  </div>
                </article>
              ))}
            </div>
            <button
              onClick={() =>
                setContent((current) => ({
                  ...current,
                  services: [
                    ...current.services,
                    {
                      id: `service-${Date.now()}`,
                      marker: String(current.services.length + 1).padStart(
                        2,
                        "0",
                      ),
                      title: "Новая услуга",
                      description: "Добавьте описание новой услуги",
                      price_from: "от 0 ₽",
                      duration: "уточняется",
                      duration_minutes: 120,
                      is_active: false,
                      is_featured: false,
                      sort_order: (current.services.length + 1) * 10,
                      image_url: null,
                    },
                  ],
                }))
              }
              className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/10 bg-[#111] px-4 text-sm"
            >
              <Plus className="size-4 text-[#d71920]" />
              Добавить услугу
            </button>
          </Section>

          <Section
            id="portfolio"
            index="03 / Портфолио"
            title="Работы"
            description="Названия, категории и визуальный тон карточек."
          >
            <div
              className={`grid gap-3 lg:grid-cols-3 ${content.portfolio.length > 5 ? "max-h-[760px] overflow-y-auto overscroll-contain pr-2" : ""}`}
            >
              {content.portfolio.map((item, index) => (
                <article
                  key={item.id}
                  className="rounded-xl border border-white/8 bg-[#111] p-5"
                >
                  <div className="mb-4 flex justify-between">
                    <span className="text-xs text-[#777]">
                      Работа {index + 1}
                    </span>
                    <button
                      onClick={() =>
                        setContent((current) => ({
                          ...current,
                          portfolio: current.portfolio.filter(
                            (_, i) => i !== index,
                          ),
                        }))
                      }
                      aria-label="Удалить работу"
                    >
                      <Trash2 className="size-4 text-[#777]" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {item.image_url ? (
                      <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
                        <MediaImage
                          src={item.image_url}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : null}
                    <label className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 text-sm">
                      <ImagePlus className="size-4 text-[#d71920]" />
                      {uploading ? "Загрузка…" : "Загрузить фотографию"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(event) => uploadPortfolioImage(index, event)}
                        disabled={uploading}
                        className="sr-only"
                      />
                    </label>
                    <Field label="Название">
                      <input
                        className={inputClass}
                        value={item.title}
                        onChange={(e) =>
                          updatePortfolio(index, { title: e.target.value })
                        }
                      />
                    </Field>
                    <Field label="Категория">
                      <input
                        className={inputClass}
                        value={item.category}
                        onChange={(e) =>
                          updatePortfolio(index, { category: e.target.value })
                        }
                      />
                    </Field>
                    <Field label="Работы">
                      <input
                        className={inputClass}
                        value={item.treatment}
                        onChange={(e) =>
                          updatePortfolio(index, { treatment: e.target.value })
                        }
                      />
                    </Field>
                    <Field label="Тон">
                      <select
                        className={inputClass}
                        value={item.tone}
                        onChange={(e) =>
                          updatePortfolio(index, {
                            tone: e.target.value as PortfolioContent["tone"],
                          })
                        }
                      >
                        <option value="black">Чёрный</option>
                        <option value="graphite">Графит</option>
                        <option value="silver">Серебро</option>
                      </select>
                    </Field>
                  </div>
                </article>
              ))}
            </div>
            <button
              onClick={() =>
                setContent((current) => ({
                  ...current,
                  portfolio: [
                    ...current.portfolio,
                    {
                      id: `work-${Date.now()}`,
                      title: "Новая работа",
                      category: "Категория",
                      treatment: "Выполненные работы",
                      tone: "graphite",
                      image_url: null,
                    },
                  ],
                }))
              }
              className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/10 bg-[#111] px-4 text-sm"
            >
              <Plus className="size-4 text-[#d71920]" />
              Добавить работу
            </button>
          </Section>

          <Section
            id="contacts"
            index="04 / Информация"
            title="Контакты"
            description="Единые данные для контактного блока и футера."
          >
            <div className="grid gap-5 rounded-xl border border-white/8 bg-[#111] p-5 md:grid-cols-2">
              {(
                [
                  ["phone", "Телефон"],
                  ["phone_href", "Ссылка телефона"],
                  ["email", "Email"],
                  ["address", "Адрес"],
                  ["schedule", "График"],
                  ["telegram", "Telegram"],
                  ["vk", "VK"],
                ] as [keyof ContactsContent, string][]
              ).map(([field, label]) => (
                <Field key={field} label={label} wide={field === "address"}>
                  <input
                    className={inputClass}
                    value={content.contacts[field]}
                    onChange={(e) => updateContacts(field, e.target.value)}
                  />
                </Field>
              ))}
            </div>
          </Section>

          <Section
            id="legal"
            index="05 / Документы"
            title="Юридические страницы"
            description="Публикуйте только тексты, проверенные юристом."
          >
            <div className="space-y-3">
              {content.legal.map((document, index) => (
                <article
                  key={document.slug}
                  className="rounded-xl border border-white/8 bg-[#111] p-5"
                >
                  <Field label="Заголовок">
                    <input
                      className={inputClass}
                      value={document.title}
                      onChange={(e) =>
                        updateLegal(index, { title: e.target.value })
                      }
                    />
                  </Field>
                  <div className="mt-4">
                    <Field label="Текст">
                      <textarea
                        className={`${inputClass} min-h-44 py-3`}
                        value={document.body}
                        onChange={(e) =>
                          updateLegal(index, { body: e.target.value })
                        }
                      />
                    </Field>
                  </div>
                </article>
              ))}
            </div>
          </Section>
        </div>
      </main>
    </div>
  );
}
