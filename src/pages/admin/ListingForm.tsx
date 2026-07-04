import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { listingSchema, type ListingFormValues } from "../../lib/validation";
import { saveListing } from "../../lib/api";
import { RANKS } from "../../lib/constants";
import type { Listing } from "../../lib/database.types";
import { ImageUploader } from "../../components/ImageUploader";
import { Field, inputClass } from "../../components/Field";
import { Spinner } from "../../components/ui";
import { useToast } from "../../components/Toast";

export function ListingForm({
  listing,
  onClose,
  onSaved,
}: {
  listing?: Listing | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [images, setImages] = useState<string[]>(
    listing?.images.map((i) => i.image_url) ?? [],
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: listing
      ? {
          category: listing.category,
          title: listing.title,
          description: listing.description,
          price: listing.price ?? undefined,
          rental_price: listing.rental_price ?? undefined,
          rental_duration: listing.rental_duration ?? "",
          rank: listing.rank,
          heroes: listing.heroes,
          skins: listing.skins,
          messenger_link: listing.messenger_link,
        }
      : { category: "sale", rank: "", heroes: 0, skins: 0 },
  });

  const category = watch("category");

  const onSubmit = async (values: ListingFormValues) => {
    try {
      await saveListing({
        id: listing?.id,
        category: values.category,
        title: values.title,
        description: values.description,
        price: values.category === "sale" ? Number(values.price) : null,
        rental_price: values.category === "rental" ? Number(values.rental_price) : null,
        rental_duration: values.category === "rental" ? values.rental_duration || null : null,
        rank: values.rank,
        heroes: Number(values.heroes),
        skins: Number(values.skins),
        messenger_link: values.messenger_link,
        imageUrls: images,
      });
      toast(listing ? "Listing updated." : "Listing created.", "success");
      onSaved();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Save failed", "error");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          onClick={(e) => e.stopPropagation()}
          className="my-8 w-full max-w-2xl rounded-[20px] border border-line bg-surface card-shadow"
        >
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 className="font-display text-xl font-bold">
              {listing ? "Edit Listing" : "New Listing"}
            </h2>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-white/60 transition hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-6">
            <Field label="Category" error={errors.category?.message}>
              <select {...register("category")} className={inputClass}>
                <option value="sale" className="bg-surface">Account For Sale</option>
                <option value="rental" className="bg-surface">Account Rental</option>
              </select>
            </Field>

            <Field label="Title" error={errors.title?.message}>
              <input {...register("title")} className={inputClass} placeholder="Listing title" />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              {category === "sale" ? (
                <Field label="Price (USD)" error={errors.price?.message}>
                  <input
                    type="number"
                    step="0.01"
                    {...register("price")}
                    className={inputClass}
                    placeholder="200"
                  />
                </Field>
              ) : (
                <>
                  <Field label="Rental Price (USD)" error={errors.rental_price?.message}>
                    <input
                      type="number"
                      step="0.01"
                      {...register("rental_price")}
                      className={inputClass}
                      placeholder="10"
                    />
                  </Field>
                  <Field label="Rental Duration" error={errors.rental_duration?.message}>
                    <input
                      {...register("rental_duration")}
                      className={inputClass}
                      placeholder="e.g. day, week, 24h"
                    />
                  </Field>
                </>
              )}
              <Field label="Rank" error={errors.rank?.message}>
                <select {...register("rank")} className={inputClass}>
                  <option value="" className="bg-surface">Select rank</option>
                  {RANKS.map((r) => (
                    <option key={r} value={r} className="bg-surface">
                      {r}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Heroes" error={errors.heroes?.message}>
                <input type="number" {...register("heroes")} className={inputClass} />
              </Field>
              <Field label="Skins" error={errors.skins?.message}>
                <input type="number" {...register("skins")} className={inputClass} />
              </Field>
            </div>

            <Field label="Description" error={errors.description?.message}>
              <textarea {...register("description")} rows={4} className={inputClass} />
            </Field>

            <Field label="Messenger Link" error={errors.messenger_link?.message}>
              <input
                {...register("messenger_link")}
                className={inputClass}
                placeholder="https://m.me/username"
              />
            </Field>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/70">Images</label>
              <ImageUploader value={images} onChange={setImages} />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-line bg-white/[0.03] px-5 py-3 text-sm font-medium text-white/70 transition hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
              >
                {isSubmitting ? <Spinner className="text-black" /> : null}
                {listing ? "Save Changes" : "Create Listing"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
