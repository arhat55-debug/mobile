import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  LogOut,
  ShoppingBag,
  Timer,
  HandCoins,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import {
  fetchStats,
  fetchListings,
  deleteListing,
  fetchBuyRequests,
  updateBuyRequestStatus,
  deleteBuyRequest,
} from "../../lib/api";
import type { Listing } from "../../lib/database.types";
import { getSupabase } from "../../lib/supabase";
import { optimizedUrl } from "../../lib/cloudinary";
import { formatPrice, timeAgo, safeMessengerHref } from "../../lib/format";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../components/Toast";
import { ListingForm } from "./ListingForm";
import { Skeleton, EmptyState, Badge } from "../../components/ui";
import { PageTransition } from "../../components/Layout";
import { cn } from "../../utils/cn";

type Tab = "listings" | "requests";

export function AdminDashboard() {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("listings");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Listing | null>(null);

  const stats = useQuery({ queryKey: ["stats"], queryFn: fetchStats });
  const listings = useQuery({
    queryKey: ["admin-listings"],
    queryFn: () => fetchListings({ category: "all", sort: "newest" }, 0),
  });
  const requests = useQuery({ queryKey: ["buy-requests"], queryFn: fetchBuyRequests });

  // Realtime: refresh on any DB change
  useEffect(() => {
    const sb = getSupabase();
    const channel = sb
      .channel("admin-realtime")
      .on("postgres_changes", { event: "*", schema: "public" }, () => {
        qc.invalidateQueries({ queryKey: ["stats"] });
        qc.invalidateQueries({ queryKey: ["admin-listings"] });
        qc.invalidateQueries({ queryKey: ["buy-requests"] });
      })
      .subscribe();
    return () => {
      sb.removeChannel(channel);
    };
  }, [qc]);

  const refreshAll = () => {
    qc.invalidateQueries({ queryKey: ["stats"] });
    qc.invalidateQueries({ queryKey: ["admin-listings"] });
    qc.invalidateQueries({ queryKey: ["buy-requests"] });
    qc.invalidateQueries({ queryKey: ["listings"] });
    qc.invalidateQueries({ queryKey: ["featured"] });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    try {
      await deleteListing(id);
      toast("Listing deleted.", "success");
      refreshAll();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Delete failed", "error");
    }
  };

  const handleReqStatus = async (id: string, status: string) => {
    try {
      await updateBuyRequestStatus(id, status);
      refreshAll();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Update failed", "error");
    }
  };

  const handleReqDelete = async (id: string) => {
    if (!confirm("Delete this buy request?")) return;
    try {
      await deleteBuyRequest(id);
      toast("Request deleted.", "success");
      refreshAll();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Delete failed", "error");
    }
  };

  const statCards = [
    { label: "Accounts For Sale", value: stats.data?.sale, icon: ShoppingBag },
    { label: "Rental Listings", value: stats.data?.rental, icon: Timer },
    { label: "Buy Requests", value: stats.data?.buyRequests, icon: HandCoins },
  ];

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-white/50">Manage listings & buy requests in realtime.</p>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 rounded-xl border border-line bg-white/[0.03] px-4 py-2.5 text-sm text-white/70 transition hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>

        {/* Stats */}
        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass flex items-center justify-between rounded-[20px] p-6"
            >
              <div>
                <div className="text-xs uppercase tracking-wider text-white/40">{s.label}</div>
                <div className="mt-2 font-display text-4xl font-bold">
                  {s.value ?? <span className="text-white/30">—</span>}
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-white/[0.03]">
                <s.icon className="h-6 w-6 text-white/70" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex gap-2">
            {(["listings", "requests"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-xl border px-4 py-2 text-sm capitalize transition",
                  tab === t
                    ? "border-white bg-white text-black"
                    : "border-line bg-white/[0.03] text-white/60 hover:text-white",
                )}
              >
                {t === "listings" ? "Listings" : "Buy Requests"}
              </button>
            ))}
          </div>
          {tab === "listings" && (
            <button
              onClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              <Plus className="h-4 w-4" /> Add Listing
            </button>
          )}
        </div>

        {/* Listings tab */}
        {tab === "listings" &&
          (listings.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : !listings.data?.items.length ? (
            <EmptyState
              title="No listings yet"
              message="Create your first listing to populate the marketplace."
              action={
                <button
                  onClick={() => setShowForm(true)}
                  className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black"
                >
                  Add Listing
                </button>
              }
            />
          ) : (
            <div className="space-y-3">
              {listings.data.items.map((l) => (
                <motion.div
                  key={l.id}
                  layout
                  className="glass flex items-center gap-4 rounded-2xl p-3"
                >
                  <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl border border-line bg-white/[0.02]">
                    {l.images[0] && (
                      <img
                        src={optimizedUrl(l.images[0].image_url, { width: 160, height: 128 })}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-medium">{l.title}</h3>
                      <Badge>{l.category === "rental" ? "Rental" : "Sale"}</Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-white/40">
                      <span>
                        {l.category === "rental"
                          ? `${formatPrice(l.rental_price)}/${l.rental_duration ?? ""}`
                          : formatPrice(l.price)}
                      </span>
                      <span>{l.rank}</span>
                      <span>{l.heroes}H · {l.skins}S</span>
                      <span>{timeAgo(l.updated_at)}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => {
                        setEditing(l);
                        setShowForm(true);
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-white/60 transition hover:text-white"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(l.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-white/60 transition hover:border-red-500/40 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ))}

        {/* Requests tab */}
        {tab === "requests" &&
          (requests.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full" />
              ))}
            </div>
          ) : !requests.data?.length ? (
            <EmptyState
              title="No buy requests"
              message="Submissions from the 'We Buy Accounts' form will appear here."
            />
          ) : (
            <div className="space-y-3">
              {requests.data.map((r) => {
                const href = safeMessengerHref(r.messenger_link);
                return (
                  <motion.div key={r.id} layout className="glass rounded-2xl p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{r.title}</h3>
                          <Badge className="capitalize">{r.status}</Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-3 text-xs text-white/40">
                          <span className="text-white/70">{formatPrice(r.offered_price)}</span>
                          <span>{r.rank}</span>
                          <span>{r.heroes}H · {r.skins}S</span>
                          <span>{timeAgo(r.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={r.status}
                          onChange={(e) => handleReqStatus(r.id, e.target.value)}
                          className="rounded-lg border border-line bg-white/[0.03] px-2 py-1.5 text-xs"
                        >
                          {["pending", "reviewing", "accepted", "declined"].map((s) => (
                            <option key={s} value={s} className="bg-surface">
                              {s}
                            </option>
                          ))}
                        </select>
                        {href && (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-8 items-center gap-1 rounded-lg border border-line px-2.5 text-xs text-white/70 transition hover:text-white"
                          >
                            <MessageCircle className="h-3.5 w-3.5" /> Chat
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        <button
                          onClick={() => handleReqDelete(r.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-white/60 transition hover:border-red-500/40 hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    {r.description && (
                      <p className="mt-3 text-sm text-white/60">{r.description}</p>
                    )}
                    {r.images?.length > 0 && (
                      <div className="mt-3 flex gap-2 overflow-x-auto">
                        {r.images.map((img, i) => (
                          <img
                            key={i}
                            src={optimizedUrl(img, { width: 120, height: 120 })}
                            alt=""
                            loading="lazy"
                            className="h-16 w-16 shrink-0 rounded-lg border border-line object-cover"
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ))}
      </div>

      {showForm && (
        <ListingForm
          listing={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            refreshAll();
          }}
        />
      )}
    </PageTransition>
  );
}
