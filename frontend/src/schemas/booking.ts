import { z } from "zod";

export const bookingSchema = z.object({
  clientName: z
    .string()
    .trim()
    .min(2, "Укажите имя")
    .max(120, "Слишком длинное имя"),
  clientPhone: z
    .string()
    .trim()
    .min(10, "Укажите номер телефона")
    .regex(/^[+\d\s()-]+$/, "Проверьте формат телефона"),
  serviceId: z.string().min(1, "Выберите услугу"),
  date: z.string().min(1, "Выберите дату"),
  time: z.string().min(1, "Выберите время"),
  personalDataConsent: z
    .boolean()
    .refine((value) => value, "Нужно подтвердить согласие"),
});

export type BookingFormValues = z.infer<typeof bookingSchema>;
