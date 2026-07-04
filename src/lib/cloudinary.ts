import { getConfig } from "./config";
import { getSupabase } from "./supabase";

export interface UploadResult {
  url: string;
  publicId: string;
}

/**
 * Upload a single file to Cloudinary using an unsigned upload preset.
 * Reports progress via the onProgress callback (0-100).
 */
export function uploadToCloudinary(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<UploadResult> {
  const cloudName = getConfig("CLOUDINARY_CLOUD_NAME");
  const preset = getConfig("CLOUDINARY_UPLOAD_PRESET");

  if (!cloudName || !preset) {
    return Promise.reject(new Error("Cloudinary тохиргоо хийгдээгүй байна."));
  }

  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", preset);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          resolve({ url: res.secure_url as string, publicId: res.public_id as string });
        } catch {
          reject(new Error("Cloudinary-ийн хариуг уншиж чадсангүй."));
        }
      } else {
        reject(new Error(`Байршуулалт амжилтгүй боллоо (${xhr.status}). Upload preset-ээ шалгана уу.`));
      }
    };

    xhr.onerror = () => reject(new Error("Байршуулах үед сүлжээний алдаа гарлаа."));
    xhr.send(form);
  });
}

/**
 * Build an optimized, responsive Cloudinary URL by injecting transformations.
 */
export function optimizedUrl(
  url: string,
  opts: { width?: number; height?: number; crop?: string } = {},
): string {
  if (!url.includes("/upload/")) return url;
  const { width, height, crop = "fill" } = opts;
  const parts = [`f_auto`, `q_auto`];
  if (width) parts.push(`w_${width}`);
  if (height) parts.push(`h_${height}`);
  if (width || height) parts.push(`c_${crop}`);
  return url.replace("/upload/", `/upload/${parts.join(",")}/`);
}

/**
 * Delete one or more images from Cloudinary via the delete-cloudinary-image
 * Edge Function (keeps the Cloudinary API secret off the client).
 * Failures are swallowed (logged only) so a Cloudinary hiccup never blocks
 * deleting the underlying database record.
 */
export async function deleteFromCloudinary(urls: string[]): Promise<void> {
  const cleanUrls = urls.filter(Boolean);
  if (cleanUrls.length === 0) return;

  try {
    const sb = getSupabase();
    const { error } = await sb.functions.invoke("delete-cloudinary-image", {
      body: { urls: cleanUrls },
    });
    if (error) {
      console.error("Cloudinary delete failed:", error);
    }
  } catch (err) {
    console.error("Cloudinary delete failed:", err);
  }
}
