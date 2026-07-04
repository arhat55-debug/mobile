import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircle2, HandCoins, Send } from "lucide-react";
import { buyRequestSchema, type BuyRequestFormValues } from "../lib/validation";
import { createBuyRequest } from "../lib/api";
import { RANKS } from "../lib/constants";
import { ImageUploader } from "../components/ImageUploader";
import { Field, inputClass } from "../components/Field";
import { Spinner } from "../components/ui";
import { useToast } from "../components/Toast";
import { PageTransition } from "../components/Layout";

export function SellPage() {
  const { toast } = useToast();
  const [images, setImages] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BuyRequestFormValues>({
    resolver: zodResolver(buyRequestSchema),
    defaultValues: { rank: "" },
  });

  const onSubmit = async (values: BuyRequestFormValues) => {
    try {
      await createBuyRequest({
        title: values.title,
        description: values.description,
        offered_price: Number(values.offered_price),
        rank: values.rank,
        heroes: Number(values.heroes),
        skins: Number(values.skins),
        messenger_link: values.messenger_link,
        images,
      });
      toast("Аккаунт амжилттай илгээгдлээ! Бид тантай холбогдох болно.", "success");
      reset();
      setImages([]);
      setDone(true);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Илгээхэд алдаа гарлаа", "error");
    }
  };

  if (done) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-xl px-5 py-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass flex flex-col items-center gap-4 rounded-[20px] p-12 text-center"
          >
            <CheckCircle2 className="h-14 w-14 text-white" />
            <h1 className="font-display text-2xl font-bold">Хүсэлт хүлээн авлаа</h1>
            <p className="text-sm text-white/50">
              Баярлалаа! Манай баг таны аккаунтыг шалгаад Messenger-ээр санал
              илгээх болно.
            </p>
            <button
              onClick={() => setDone(false)}
              className="mt-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              Өөр аккаунт илгээх
            </button>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl px-5 py-12">
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3 py-1.5 text-xs text-white/60">
            <HandCoins className="h-3.5 w-3.5" /> Бид аккаунт худалдаж авна
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold">Аккаунтаа бидэнд зараарай</h1>
          <p className="mt-2 text-white/50">
            Доор аккаунтынхаа мэдээллийг оруулна уу, манай баг Messenger-ээр санал илгээх болно.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="glass space-y-5 rounded-[20px] p-6">
          <Field label="Аккаунтын гарчиг" error={errors.title?.message}>
            <input
              {...register("title")}
              className={inputClass}
              placeholder="ж/нь. Mythic Glory 150 скинтэй аккаунт"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Таны хүссэн үнэ (₮)" error={errors.offered_price?.message}>
              <input
                type="number"
                step="0.01"
                {...register("offered_price")}
                className={inputClass}
                placeholder="700000"
              />
            </Field>
            <Field label="Ранк" error={errors.rank?.message}>
              <select {...register("rank")} className={inputClass}>
                <option value="" className="bg-surface">Ранк сонгох</option>
                {RANKS.map((r) => (
                  <option key={r} value={r} className="bg-surface">
                    {r}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Баатрын тоо" error={errors.heroes?.message}>
              <input type="number" {...register("heroes")} className={inputClass} placeholder="0" />
            </Field>
            <Field label="Скины тоо" error={errors.skins?.message}>
              <input type="number" {...register("skins")} className={inputClass} placeholder="0" />
            </Field>
          </div>

          <Field label="Тайлбар" error={errors.description?.message}>
            <textarea
              {...register("description")}
              rows={5}
              className={inputClass}
              placeholder="Аккаунтынхаа тухай бичнэ үү — холбогдсон эрхүүд, эмблем, ховор скинс гэх мэт."
            />
          </Field>

          <Field label="Facebook Messenger холбоос" error={errors.messenger_link?.message}>
            <input
              {...register("messenger_link")}
              className={inputClass}
              placeholder="https://m.me/hэрэглэгчийн-нэр"
            />
          </Field>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/70">Аккаунтын зурагнууд</label>
            <ImageUploader value={images} onChange={setImages} />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-base font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
          >
            {isSubmitting ? <Spinner className="text-black" /> : <Send className="h-5 w-5" />}
            Аккаунт илгээх
          </button>
        </form>
      </div>
    </PageTransition>
  );
}

