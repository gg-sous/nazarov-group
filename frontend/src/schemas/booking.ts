import { z } from "zod";
import { vehicleColors } from "@/data/vehicles";

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
  vehicleModel: z
    .string()
    .trim()
    .min(2, "Укажите марку и модель автомобиля")
    .max(160, "Слишком длинное название автомобиля"),
  vehicleColor: z
    .string()
    .min(1, "Выберите цвет автомобиля")
    .refine(
      (value) => vehicleColors.some((color) => color === value),
      "Выберите цвет из списка",
    ),
  serviceId: z.string().min(1, "Выберите услугу"),
  date: z.string().min(1, "Выберите дату"),
  time: z.string().min(1, "Выберите время"),
  personalDataConsent: z
    .boolean()
    .refine((value) => value, "Нужно подтвердить согласие"),
});

export type BookingFormValues = z.infer<typeof bookingSchema>;
