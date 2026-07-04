import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { fetchListings, type ListingFilters } from "../lib/api";
import { RANKS, SORT_OPTIONS, type SortValue } from "../lib/constants";
import type { Category } from "../lib/database.types";
import { ListingCard } from "../components/ListingCard";
import { GridSkeleton, EmptyState, ErrorState, Spinner } from "../components/ui";
import { PageTransition } from "../components/Layout";
import { inputClass } from "../components/Field";
import { cn } from "../utils/cn";

export function BrowsePage() {
  const [params, setParams] = useSearchParams();
  const category = (params.get("category") as Category | null) ?? "all";

  const [search, setSearch] = useState(params.get("q") ?? "");
  const [debounced, setDebounced] = useState(search);
  const [rank, setRank] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minHeroes, setMinHeroes] = useState("");
  const [minSkins, setMinSkins] = useState("");
  const [sort, setSort] = useState<SortValue>("newest");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const filters: ListingFilters = useMemo(
    () => ({
      category,
      sort,
      search: debounced.trim() || undefined,
      rank: rank || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minHeroes: minHeroes ? Number(minHeroes) : undefined,
      minSkins: minSkins ? Number(minSkins) : undefined,
    }),
    [category, sort, debounced, rank, minPrice, maxPrice, minHeroes, minSkins],
  );

  const query = useInfiniteQuery({
    queryKey: ["listings", filters],
    queryFn: ({ pageParam }) => fetchListings(filters, pageParam),
    initialPageParam: 0,
    getNextPageParam: (last, pages) => (last.hasMore ? pages.length : undefined),
  });

  const items = query.data?.pages.flatMap((p) => p.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;

  const setCategory = (c: string) => {
    const next = new URLSearchParams(params);
    if (c === "all") next.delete("category");
    else next.set("category", c);
    setParams(next, { replace: true });
  };

  const activeFilters =
    rank || minPrice || maxPrice || minHeroes || minSkins ? true : false;

  const clearFilters = () => {
    setRank("");
    setMinPrice("");
    setMaxPrice("");
    setMinHeroes("");
    setMinSkins("");
  };

  const title =
    category === "sale"
      ? "Зарагдаж буй аккаунтууд"
      : category === "rental"
        ? "Аккаунт түрээс"
        : "Зах зээл үзэх";

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-5 py-12">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold">{title}</h1>
          <p className="mt-2 text-white/50">
            {query.isSuccess ? `${total} үр дүн` : "Ачаалж байна…"}
          </p>
        </div>

        {/* Category pills */}
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { key: "all", label: "Бүгд" },
            { key: "sale", label: "Зарна" },
            { key: "rental", label: "Түрээс" },
          ].map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={cn(
                "rounded-xl border px-4 py-2 text-sm transition",
                category === c.key
                  ? "border-white bg-white text-black"
                  : "border-line bg-white/[0.03] text-white/60 hover:text-white",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Search + sort bar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Гарчгаар хайх…"
              className={cn(inputClass, "pl-10")}
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortValue)}
            className={cn(inputClass, "sm:w-48")}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-surface">
                {o.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowFilters((s) => !s)}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition",
              showFilters || activeFilters
                ? "border-white/30 bg-white/[0.06] text-white"
                : "border-line bg-white/[0.03] text-white/60 hover:text-white",
            )}
          >
            <SlidersHorizontal className="h-4 w-4" /> Шүүлтүүр
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-8 overflow-hidden"
          >
            <div className="glass grid gap-4 rounded-[20px] p-5 sm:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-1.5">
                <label className="text-xs text-white/60">Ранк</label>
                <select
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  className={inputClass}
                >
                  <option value="" className="bg-surface">Хамаагүй</option>
                  {RANKS.map((r) => (
                    <option key={r} value={r} className="bg-surface">
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/60">Хамгийн бага үнэ</label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className={inputClass}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/60">Хамгийн их үнэ</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className={inputClass}
                  placeholder="9999"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/60">Хамгийн цөөн баатар</label>
                <input
                  type="number"
                  value={minHeroes}
                  onChange={(e) => setMinHeroes(e.target.value)}
                  className={inputClass}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/60">Хамгийн цөөн скин</label>
                <input
                  type="number"
                  value={minSkins}
                  onChange={(e) => setMinSkins(e.target.value)}
                  className={inputClass}
                  placeholder="0"
                />
              </div>
            </div>
            {activeFilters && (
              <button
                onClick={clearFilters}
                className="mt-3 inline-flex items-center gap-1 text-xs text-white/50 hover:text-white"
              >
                <X className="h-3.5 w-3.5" /> Шүүлтүүр цэвэрлэх
              </button>
            )}
          </motion.div>
        )}

        {/* Results */}
        {query.isLoading ? (
          <GridSkeleton />
        ) : query.isError ? (
          <ErrorState
            message={(query.error as Error).message}
            onRetry={() => query.refetch()}
          />
        ) : items.length === 0 ? (
          <EmptyState
            title="Тохирох үр дүн олдсонгүй"
            message="Хайлт эсвэл шүүлтүүрээ өөрчилж дахин оролдоно уу."
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((l, i) => (
                <ListingCard key={l.id} listing={l} index={i} />
              ))}
            </div>
            {query.hasNextPage && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={() => query.fetchNextPage()}
                  disabled={query.isFetchingNextPage}
                  className="flex items-center gap-2 rounded-xl border border-line bg-white/[0.03] px-8 py-3 text-sm font-medium text-white transition hover:bg-white/[0.07] disabled:opacity-50"
                >
                  {query.isFetchingNextPage ? <Spinner /> : null}
                  Цааш үзэх
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </PageTransition>
  );
}
