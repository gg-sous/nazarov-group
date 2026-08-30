import type { BookingFormValues } from "@/schemas/booking";

const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "/api").replace(/\/$/, "");

export type BookingResponse = {
  id: string;
  status: "confirmed";
  service_name: string;
  vehicle_model: string;
  vehicle_color: string;
  date: string;
  start_time: string;
  end_time: string;
};

export async function createBooking(
  values: BookingFormValues,
): Promise<BookingResponse> {
  const response = await fetch(`${apiUrl}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_name: values.clientName,
      client_phone: values.clientPhone,
      vehicle_model: values.vehicleModel,
      vehicle_color: values.vehicleColor,
      service_id: values.serviceId,
      date: values.date,
      start_time: values.time,
      personal_data_consent: values.personalDataConsent,
    }),
  });

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error("Это время уже занято. Выберите другое время.");
    }
    if (response.status === 429) {
      throw new Error(
        "Слишком много попыток. Попробуйте через несколько минут.",
      );
    }
    throw new Error(
      "Не удалось оформить запись. Проверьте данные и попробуйте ещё раз.",
    );
  }

  return (await response.json()) as BookingResponse;
}

export async function getBookingAvailability(
  serviceId: string,
  date: string,
): Promise<string[]> {
  const params = new URLSearchParams({ service_id: serviceId, date });
  const response = await fetch(
    `${apiUrl}/bookings/availability?${params.toString()}`,
  );
  if (!response.ok) throw new Error("Не удалось загрузить свободное время");
  const payload = (await response.json()) as { slots: string[] };
  return payload.slots;
}
