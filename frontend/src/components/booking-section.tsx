"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { ServiceContent } from "@/types/content";
import { createBooking, getBookingAvailability } from "@/services/booking-api";
import { bookingSchema, type BookingFormValues } from "@/schemas/booking";
import { Container } from "@/components/ui/container";
import { vehicleColors } from "@/data/vehicles";

const fieldClass =
  "mt-2 h-14 w-full rounded-none border border-white/15 bg-[#111] px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#d71920]";

export function BookingSection({
  services: serviceOptions,
}: {
  services: ServiceContent[];
}) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      clientName: "",
      clientPhone: "",
      vehicleModel: "",
      vehicleColor: "",
      serviceId: "",
      date: "",
      time: "",
      personalDataConsent: false,
    },
  });

  const mutation = useMutation({
    mutationFn: createBooking,
    onSuccess: () => reset(),
  });
  const [selectedService, selectedDate] = useWatch({
    control,
    name: ["serviceId", "date"],
  });
  useEffect(() => {
    setValue("time", "");
  }, [selectedDate, selectedService, setValue]);
  const availability = useQuery({
    queryKey: ["booking-availability", selectedService, selectedDate],
    queryFn: () => getBookingAvailability(selectedService, selectedDate),
    enabled: Boolean(selectedService && selectedDate),
    staleTime: 15_000,
  });

  const today = new Date().toISOString().slice(0, 10);

  return (
    <section
      id="booking"
      className="scroll-mt-16 border-y border-white/10 bg-[#111] py-20 sm:py-32"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
          <div>
            <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.25em] text-zinc-500 uppercase">
              <span className="h-px w-7 bg-[#d71920]" /> Запись
            </p>
            <h2 className="mt-7 text-[2.2rem] leading-[0.98] font-semibold tracking-[-0.04em] uppercase sm:mt-8 sm:text-6xl sm:leading-[0.94]">
              Обсудим ваш автомобиль
            </h2>
            <p className="mt-6 max-w-md leading-7 text-zinc-400">
              Выберите услугу и удобное время. После отправки запись появится у
              администратора, а менеджер получит уведомление в Telegram.
            </p>
            <div className="mt-8 border-l-2 border-[#d71920] pl-5 sm:mt-12">
              <p className="text-sm text-zinc-500">Без предоплаты</p>
              <p className="mt-1 font-semibold">Запись подтверждается сразу</p>
            </div>
          </div>

          <form
            className="grid gap-x-4 gap-y-6 sm:grid-cols-2"
            noValidate
            onSubmit={handleSubmit((values) => mutation.mutate(values))}
          >
            <Field label="ФИО" error={errors.clientName?.message}>
              <input
                className={fieldClass}
                autoComplete="name"
                placeholder="Как к вам обращаться"
                {...register("clientName")}
              />
            </Field>
            <Field label="Номер телефона" error={errors.clientPhone?.message}>
              <input
                className={fieldClass}
                autoComplete="tel"
                inputMode="tel"
                placeholder="+7 (___) ___-__-__"
                {...register("clientPhone")}
              />
            </Field>
            <Field
              label="Марка и модель автомобиля"
              error={errors.vehicleModel?.message}
            >
              <input
                className={fieldClass}
                autoComplete="off"
                placeholder="Например, BMW X5"
                {...register("vehicleModel")}
              />
            </Field>
            <Field label="Цвет автомобиля" error={errors.vehicleColor?.message}>
              <select
                className={fieldClass}
                defaultValue=""
                {...register("vehicleColor")}
              >
                <option value="" disabled>
                  Выберите цвет
                </option>
                {vehicleColors.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Услуга"
              error={errors.serviceId?.message}
              className="sm:col-span-2"
            >
              <select
                className={fieldClass}
                defaultValue=""
                {...register("serviceId")}
              >
                <option value="" disabled>
                  Выберите услугу
                </option>
                {serviceOptions.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.title}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Дата" error={errors.date?.message}>
              <input
                className={fieldClass}
                type="date"
                min={today}
                {...register("date")}
              />
            </Field>
            <Field label="Время" error={errors.time?.message}>
              <select
                className={fieldClass}
                disabled={
                  !selectedService || !selectedDate || availability.isPending
                }
                defaultValue=""
                {...register("time")}
              >
                <option value="" disabled>
                  {availability.isPending
                    ? "Загружаем…"
                    : !selectedService || !selectedDate
                      ? "Сначала выберите услугу и дату"
                      : availability.data?.length
                        ? "Выберите свободное время"
                        : "Свободного времени нет"}
                </option>
                {availability.data?.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </Field>
            <div className="sm:col-span-2">
              <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-zinc-400">
                <input
                  className="mt-1 size-4 shrink-0 accent-[#d71920]"
                  type="checkbox"
                  {...register("personalDataConsent")}
                />
                <span>
                  Даю{" "}
                  <Link
                    className="text-zinc-200 underline decoration-zinc-600 underline-offset-4 hover:decoration-[#d71920]"
                    href="/legal/personal-data-consent"
                  >
                    согласие на обработку персональных данных
                  </Link>
                </span>
              </label>
              {errors.personalDataConsent ? (
                <p className="mt-2 text-xs text-red-400">
                  {errors.personalDataConsent.message}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col items-start gap-4 sm:col-span-2 sm:flex-row sm:items-center">
              <button
                className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-[#d71920] px-8 font-semibold transition hover:-translate-y-0.5 hover:bg-[#bd141b] disabled:cursor-wait disabled:opacity-60 sm:w-auto"
                disabled={mutation.isPending}
                type="submit"
              >
                {mutation.isPending ? "Проверяем..." : "Оставить заявку"}{" "}
                <ArrowRight size={18} />
              </button>
              {mutation.isSuccess ? (
                <p className="flex items-center gap-2 text-sm text-zinc-300">
                  <CheckCircle2 className="text-emerald-400" size={18} /> Запись
                  подтверждена. Менеджер получил заявку.
                </p>
              ) : null}
              {mutation.isError ? (
                <p role="alert" className="text-sm text-red-400">
                  {mutation.error.message}
                </p>
              ) : null}
            </div>
          </form>
        </div>
      </Container>
    </section>
  );
}

function Field({
  label,
  error,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block text-sm text-zinc-400 ${className}`}>
      <span>{label}</span>
      {children}
      {error ? (
        <span className="mt-2 block text-xs text-red-400">{error}</span>
      ) : null}
    </label>
  );
}
