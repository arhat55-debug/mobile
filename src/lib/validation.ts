import { z } from "zod";

const messengerLink = z
  .string()
  .trim()
  .min(1, "Messenger холбоос заавал шаардлагатай")
  .url("Зөв URL хаяг оруулна уу")
  .refine(
    (v) => /^(https?:\/\/)(m\.me|www\.messenger\.com|messenger\.com|facebook\.com|www\.facebook\.com|fb\.com)\//i.test(v),
    "Зөв Facebook / Messenger холбоос байх ёстой (m.me, messenger.com, facebook.com)",
  );

export const listingSchema = z
  .object({
    category: z.enum(["sale", "rental"]),
    title: z.string().trim().min(3, "Гарчиг хэт богино байна").max(120, "Гарчиг хэт урт байна"),
    description: z.string().trim().min(10, "Тайлбар хэт богино байна").max(4000),
    price: z.coerce.number().min(0).optional().nullable(),
    rental_price: z.coerce.number().min(0).optional().nullable(),
    rental_duration: z.string().trim().max(60).optional().nullable(),
    rank: z.string().trim().min(1, "Ранк заавал шаардлагатай"),
    heroes: z.coerce.number().int().min(0).max(300),
    skins: z.coerce.number().int().min(0).max(2000),
    messenger_link: messengerLink,
  })
  .superRefine((data, ctx) => {
    if (data.category === "sale" && (data.price == null || data.price <= 0)) {
      ctx.addIssue({ code: "custom", path: ["price"], message: "Зарах үнэ заавал шаардлагатай" });
    }
    if (data.category === "rental") {
      if (data.rental_price == null || data.rental_price <= 0) {
        ctx.addIssue({ code: "custom", path: ["rental_price"], message: "Түрээсийн үнэ заавал шаардлагатай" });
      }
      if (!data.rental_duration) {
        ctx.addIssue({ code: "custom", path: ["rental_duration"], message: "Хугацаа заавал шаардлагатай" });
      }
    }
  });

export type ListingFormValues = z.input<typeof listingSchema>;

export const buyRequestSchema = z.object({
  title: z.string().trim().min(3, "Гарчиг хэт богино байна").max(120),
  description: z.string().trim().min(10, "Аккаунтаа тодорхойлно уу").max(4000),
  offered_price: z.coerce.number().min(1, "Үнэ оруулна уу"),
  rank: z.string().trim().min(1, "Ранк заавал шаардлагатай"),
  heroes: z.coerce.number().int().min(0).max(300),
  skins: z.coerce.number().int().min(0).max(2000),
  messenger_link: messengerLink,
});

export type BuyRequestFormValues = z.input<typeof buyRequestSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Зөв имэйл хаяг оруулна уу"),
  password: z.string().min(6, "Нууц үг хэт богино байна"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

/** Basic XSS-safe text sanitizer for display of user text. */
export function sanitizeText(input: string): string {
  return input.replace(/[<>]/g, (c) => (c === "<" ? "&lt;" : "&gt;"));
}
