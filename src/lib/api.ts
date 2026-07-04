import { getSupabase } from "./supabase";
import { deleteFromCloudinary } from "./cloudinary";
import type { Listing, ListingRow, BuyRequestRow, Category } from "./database.types";
import type { SortValue } from "./constants";

// Untyped accessor for write operations to avoid over-strict generic inference.
function sbw(): any {
  return getSupabase() as any;
}

export interface ListingFilters {
  category?: Category | "all";
  rank?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minHeroes?: number;
  minSkins?: number;
  sort?: SortValue;
}

const PAGE_SIZE = 9;

function attachImages(rows: any[]): Listing[] {
  return (rows || []).map((r) => ({
    ...r,
    images: (r.listing_images || []).sort(
      (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    ),
  }));
}

export async function fetchListings(
  filters: ListingFilters,
  page = 0,
): Promise<{ items: Listing[]; hasMore: boolean; total: number }> {
  const sb = getSupabase();
  let query = sb.from("listings").select("*, listing_images(*)", { count: "exact" });

  if (filters.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
  }
  if (filters.rank) query = query.eq("rank", filters.rank);
  if (filters.search) query = query.ilike("title", `%${filters.search}%`);
  if (filters.minHeroes != null) query = query.gte("heroes", filters.minHeroes);
  if (filters.minSkins != null) query = query.gte("skins", filters.minSkins);

  const priceCol = filters.category === "rental" ? "rental_price" : "price";
  if (filters.minPrice != null) query = query.gte(priceCol, filters.minPrice);
  if (filters.maxPrice != null) query = query.lte(priceCol, filters.maxPrice);

  switch (filters.sort) {
    case "oldest":
      query = query.order("created_at", { ascending: true });
      break;
    case "price_low":
      query = query.order(priceCol, { ascending: true, nullsFirst: false });
      break;
    case "price_high":
      query = query.order(priceCol, { ascending: false, nullsFirst: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data, error, count } = await query.range(from, to);
  if (error) throw error;

  const items = attachImages(data as any[]);
  return { items, hasMore: (count ?? 0) > to + 1, total: count ?? 0 };
}

export async function fetchListingById(id: string): Promise<Listing | null> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("listings")
    .select("*, listing_images(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return attachImages([data])[0];
}

export interface SaveListingInput
  extends Omit<ListingRow, "id" | "created_at" | "updated_at"> {
  id?: string;
  imageUrls: string[];
}

export async function saveListing(input: SaveListingInput): Promise<Listing> {
  const sb = sbw();
  const { imageUrls, id, ...fields } = input;

  let listingId = id;
  if (id) {
    const { error } = await sb
      .from("listings")
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  } else {
    const { data, error } = await sb.from("listings").insert(fields).select("id").single();
    if (error) throw error;
    listingId = data.id;
  }

  // Sync images: fetch existing, delete removed, insert new.
  const { data: existing } = await sb
    .from("listing_images")
    .select("*")
    .eq("listing_id", listingId!);

  const existingUrls = new Set((existing || []).map((e: any) => e.image_url));
  const targetUrls = new Set(imageUrls);

  const toDelete = (existing || []).filter((e: any) => !targetUrls.has(e.image_url));
  if (toDelete.length) {
    await sb
      .from("listing_images")
      .delete()
      .in(
        "id",
        toDelete.map((d: any) => d.id),
      );
    await deleteFromCloudinary(toDelete.map((d: any) => d.image_url));
  }

  const toInsert = imageUrls
    .filter((u) => !existingUrls.has(u))
    .map((image_url) => ({ listing_id: listingId!, image_url }));
  if (toInsert.length) {
    const { error } = await sb.from("listing_images").insert(toInsert);
    if (error) throw error;
  }

  const result = await fetchListingById(listingId!);
  return result!;
}

export async function deleteListing(id: string): Promise<void> {
  const sb = getSupabase();

  const { data: images } = await sb
    .from("listing_images")
    .select("image_url")
    .eq("listing_id", id);

  const { error } = await sb.from("listings").delete().eq("id", id);
  if (error) throw error;

  if (images?.length) {
    await deleteFromCloudinary(images.map((i: { image_url: string }) => i.image_url));
  }
}

export async function deleteListingImage(imageId: string): Promise<void> {
  const sb = getSupabase();

  const { data: image } = await sb
    .from("listing_images")
    .select("image_url")
    .eq("id", imageId)
    .maybeSingle();

  const { error } = await sb.from("listing_images").delete().eq("id", imageId);
  if (error) throw error;

  if (image?.image_url) {
    await deleteFromCloudinary([image.image_url]);
  }
}

// ---------- Buy Requests ----------

export async function createBuyRequest(
  input: Omit<BuyRequestRow, "id" | "created_at" | "status">,
): Promise<void> {
  const sb = sbw();
  const { error } = await sb.from("buy_requests").insert(input);
  if (error) throw error;
}

export async function fetchBuyRequests(): Promise<BuyRequestRow[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("buy_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as BuyRequestRow[];
}

export async function updateBuyRequestStatus(id: string, status: string): Promise<void> {
  const sb = sbw();
  const { error } = await sb.from("buy_requests").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function deleteBuyRequest(id: string): Promise<void> {
  const sb = getSupabase();

  const { data: request } = await sb
    .from("buy_requests")
    .select("images")
    .eq("id", id)
    .maybeSingle();

  const { error } = await sb.from("buy_requests").delete().eq("id", id);
  if (error) throw error;

  if (request?.images?.length) {
    await deleteFromCloudinary(request.images as string[]);
  }
}

// ---------- Stats ----------

export interface Stats {
  sale: number;
  rental: number;
  buyRequests: number;
}

export async function fetchStats(): Promise<Stats> {
  const sb = getSupabase();
  const [sale, rental, buys] = await Promise.all([
    sb.from("listings").select("id", { count: "exact", head: true }).eq("category", "sale"),
    sb.from("listings").select("id", { count: "exact", head: true }).eq("category", "rental"),
    sb.from("buy_requests").select("id", { count: "exact", head: true }),
  ]);
  return {
    sale: sale.count ?? 0,
    rental: rental.count ?? 0,
    buyRequests: buys.count ?? 0,
  };
}

