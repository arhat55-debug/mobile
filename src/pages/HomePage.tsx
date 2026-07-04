import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  ShoppingBag,
  Timer,
  HandCoins,
  Sparkles,
} from "lucide-react";
import { fetchListings, fetchStats } from "../lib/api";
import { ListingCard } from "../components/ListingCard";
import { GridSkeleton, EmptyState } from "../components/ui";
import { PageTransition } from "../components/Layout";

const CATEGORIES = [
  {
    key: "sale",
    title: "Зарагдаж буй аккаунтууд",
    desc: "Бүрэн дүүрэн аккаунт эзэмш. Баталгаажсан ранк, баатар, скинтэй.",
    to: "/browse?category=sale",
    icon: ShoppingBag,
  },
  {
    key: "rental",
    title: "Аккаунт түрээслэх",
    desc: "Шилдэг аккаунтуудыг цаг, өдөр, эсвэл долоо хоногоор тоглоорой.",
    to: "/browse?category=rental",
    icon: Timer,
  },
  {
    key: "buy",
    title: "Бид аккаунт худалдаж авна",
    desc: "Аккаунтаа хурдан бидэнд зараарай. Санал хүсэлт илгээгээд шууд үнэ аваарай.",
    to: "/sell",
    icon: HandCoins,
  },
];

export function HomePage() {
  const { data: stats } = useQuery({ queryKey: ["stats"], queryFn: fetchStats });
  const featured = useQuery({
    queryKey: ["featured"],
    queryFn: () => fetchListings({ category: "all", sort: "newest" }, 0),
  });

  return (
    <PageTransition>
      {/* HERO */}
      <section className="grid-noise relative overflow-hidden border-b border-line">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: "url(/images/hero.jpg)" }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-bg via-bg/80 to-transparent" />
        <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-white/[0.04] blur-[120px]" />
        <div className="mx-auto max-w-7xl px-5 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3 py-1.5 text-xs text-white/60">
              <Sparkles className="h-3.5 w-3.5" /> Тэргүүлэх MLBB зах зээл
            </span>
            <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight text-balance md:text-7xl">
              Mobile Legends аккаунт
              <br />
              <span className="text-white/30">худалдаж авах, түрээслэх, зарах.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/50">
              Mythic Glory ранктай, ховор скинтэй, баталгаажсан түрээсийн сонгомол сан —
              бүхэлдээ бодит цагийн мэдээллээр ажилладаг.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/browse?category=sale"
                className="group flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Аккаунт үзэх
                <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                to="/sell"
                className="rounded-xl border border-line bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.07]"
              >
                Аккаунтаа зарах
              </Link>
            </div>

            <div className="mt-14 flex gap-8">
              {[
                { label: "Аккаунт", value: stats?.sale },
                { label: "Түрээс", value: stats?.rental },
                { label: "Худалдан авах хүсэлт", value: stats?.buyRequests },
              ].map((s) => (
                <div key={s.label}>
                  <div className="font-display text-3xl font-bold">
                    {s.value ?? "—"}
                  </div>
                  <div className="text-xs uppercase tracking-wider text-white/40">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        <div className="mb-10">
          <h2 className="font-display text-3xl font-bold">Тоглох гурван арга</h2>
          <p className="mt-2 text-white/50">Тулааны талбарт орох замаа сонго.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {CATEGORIES.map((c, i) => (
            <motion.div
              key={c.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={c.to}
                className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[20px] border border-line bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:card-shadow"
              >
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/[0.03] blur-3xl transition group-hover:bg-white/[0.06]" />
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-white/[0.04] transition group-hover:bg-white group-hover:text-black">
                    <c.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 font-display text-2xl font-bold">{c.title}</h3>
                  <p className="mt-2 text-sm text-white/50">{c.desc}</p>
                </div>
                <div className="mt-8 flex items-center gap-1.5 text-sm font-medium text-white/70 transition group-hover:text-white">
                  Нэвтрэх
                  <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto max-w-7xl px-5 pb-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold">Сүүлийн бараа</h2>
            <p className="mt-2 text-white/50">Шинээр нэмэгдсэн аккаунт болон түрээсүүд.</p>
          </div>
          <Link
            to="/browse"
            className="hidden items-center gap-1 text-sm text-white/60 transition hover:text-white sm:flex"
          >
            Бүгдийг үзэх <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {featured.isLoading ? (
          <GridSkeleton />
        ) : featured.data && featured.data.items.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.data.items.slice(0, 6).map((l, i) => (
              <ListingCard key={l.id} listing={l} index={i} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Одоогоор зар алга"
            message="Админ хэсгээс зар нэмэнгүүт энд шууд харагдана."
          />
        )}
      </section>
    </PageTransition>
  );
}
