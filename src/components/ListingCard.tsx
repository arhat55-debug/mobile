import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Crown, Shield, Sparkles, ArrowUpRight, ImageOff } from "lucide-react";
import type { Listing } from "../lib/database.types";
import { optimizedUrl } from "../lib/cloudinary";
import { formatPrice, timeAgo } from "../lib/format";
import { Badge } from "./ui";

export function ListingCard({ listing, index = 0 }: { listing: Listing; index?: number }) {
  const cover = listing.images[0]?.image_url;
  const isRental = listing.category === "rental";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 9) * 0.05 }}
    >
      <Link
        to={`/listing/${listing.id}`}
        className="group block overflow-hidden rounded-[20px] border border-line bg-card transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:card-shadow"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-black">
          {cover ? (
            <img
              src={optimizedUrl(cover, { width: 640, height: 400, crop: "fit" })}
              alt={listing.title}
              loading="lazy"
              className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageOff className="h-8 w-8 text-white/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute left-3 top-3">
            <Badge className="border-white/20 bg-black/50 text-white backdrop-blur">
              {isRental ? "ТҮРЭЭС" : "ЗАРНА"}
            </Badge>
          </div>
          <div className="absolute bottom-3 left-3">
            <span className="font-display text-2xl font-bold text-white drop-shadow">
              {isRental ? formatPrice(listing.rental_price) : formatPrice(listing.price)}
              {isRental && listing.rental_duration && (
                <span className="ml-1 text-sm font-normal text-white/70">
                  /{listing.rental_duration}
                </span>
              )}
            </span>
          </div>
          <div className="absolute bottom-3 right-3 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white opacity-0 backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>

        <div className="space-y-4 p-5">
          <h3 className="line-clamp-1 font-display text-lg font-semibold text-white">
            {listing.title}
          </h3>

          <div className="flex flex-wrap gap-2">
            <Badge>
              <Crown className="h-3 w-3" /> {listing.rank}
            </Badge>
            <Badge>
              <Shield className="h-3 w-3" /> {listing.heroes} Баатар
            </Badge>
            <Badge>
              <Sparkles className="h-3 w-3" /> {listing.skins} Скин
            </Badge>
          </div>

          <div className="flex items-center justify-between border-t border-line pt-3">
            <span className="flex items-center gap-1.5 text-xs text-white/40">
              <Clock className="h-3 w-3" /> {timeAgo(listing.updated_at)}
            </span>
            <span className="text-xs font-medium text-white/80 transition group-hover:text-white">
              Дэлгэрэнгүй →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
