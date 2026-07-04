import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Crown,
  Shield,
  Sparkles,
  Clock,
  MessageCircle,
  ImageOff,
  AlertTriangle,
} from "lucide-react";
import { fetchListingById } from "../lib/api";
import { optimizedUrl } from "../lib/cloudinary";
import { formatPrice, timeAgo, safeMessengerHref } from "../lib/format";
import { Skeleton, ErrorState, EmptyState, Badge } from "../components/ui";
import { PageTransition } from "../components/Layout";

export function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [active, setActive] = useState(0);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["listing", id],
    queryFn: () => fetchListingById(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (data) document.title = `${data.title} — NEXUS MLBB`;
    return () => {
      document.title = "NEXUS MLBB — Mobile Legends-ийн тэргүүлэх зах зээл";
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-[4/3] w-full rounded-[20px]" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-12 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20">
        <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20">
        <EmptyState
          title="Зар олдсонгүй"
          message="Энэ зар устгагдсан эсвэл зарагдсан байж болзошгүй."
          action={
            <Link
              to="/browse"
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black"
            >
              Буцаж үзэх
            </Link>
          }
        />
      </div>
    );
  }

  const isRental = data.category === "rental";
  const images = data.images;
  const messengerHref = safeMessengerHref(data.messenger_link);

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl px-5 py-8">
        <Link
          to={isRental ? "/browse?category=rental" : "/browse?category=sale"}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/50 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Зах зээл рүү буцах
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] border border-line bg-black">
              {images.length ? (
                <AnimatePresence mode="wait">
                  <motion.img
                    key={images[active].id}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    src={optimizedUrl(images[active].image_url, { width: 1000, crop: "fit" })}
                    alt={data.title}
                    className="h-full w-full object-contain"
                  />
                </AnimatePresence>
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImageOff className="h-10 w-10 text-white/20" />
                </div>
              )}
              <Badge className="absolute left-3 top-3 border-white/20 bg-black/50 text-white backdrop-blur">
                {isRental ? "ТҮРЭЭС" : "ЗАРНА"}
              </Badge>
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActive(i)}
                    className={`aspect-square overflow-hidden rounded-xl border transition ${
                      i === active
                        ? "border-white"
                        : "border-line opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={optimizedUrl(img.image_url, { width: 160, height: 160 })}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <h1 className="font-display text-3xl font-bold leading-tight md:text-4xl">
              {data.title}
            </h1>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-display text-4xl font-bold">
                {isRental ? formatPrice(data.rental_price) : formatPrice(data.price)}
              </span>
              {isRental && data.rental_duration && (
                <span className="text-white/50">/ {data.rental_duration}</span>
              )}
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { icon: Crown, label: "Ранк", value: data.rank },
                { icon: Shield, label: "Баатар", value: data.heroes },
                { icon: Sparkles, label: "Скин", value: data.skins },
              ].map((s) => (
                <div
                  key={s.label}
                  className="glass rounded-2xl p-4 text-center"
                >
                  <s.icon className="mx-auto h-5 w-5 text-white/60" />
                  <div className="mt-2 font-display text-lg font-bold">{s.value}</div>
                  <div className="text-xs text-white/40">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">
                Тайлбар
              </h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-white/70">
                {data.description || "Тайлбар оруулаагүй байна."}
              </p>
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-xs text-white/40">
              <Clock className="h-3.5 w-3.5" /> Шинэчлэгдсэн: {timeAgo(data.updated_at)}
            </div>

            {messengerHref ? (
              <a
                href={messengerHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-base font-semibold text-black transition hover:bg-white/90"
              >
                <MessageCircle className="h-5 w-5" /> Зарагчид бичих
              </a>
            ) : (
              <div className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-line bg-white/[0.03] px-6 py-4 text-sm text-white/50">
                <AlertTriangle className="h-4 w-4" /> Холбоо барих боломжгүй
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
