"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import {
  AdminButton,
  AdminCard,
  AdminPageHeader,
  AdminShell,
  AdminStatusBadge,
} from "@/components/admin/admin-shell";
import { useAuthToken } from "@/hooks/use-auth-token";
import { ApiError } from "@/lib/http-client";
import {
  createAdminBanner,
  deleteAdminBanner,
  fetchAdminBlobUrl,
  getAdminBannerSettings,
  getAdminBanners,
  updateAdminBanner,
  updateAdminBannerSettings,
} from "@/services/admin-service";
import type { AdminBanner } from "@/types/admin";

export default function AdminBannersPage() {
  const { token } = useAuthToken();
  const [banners, setBanners] = useState<AdminBanner[]>([]);
  const [previewUrls, setPreviewUrls] = useState<Record<number, string>>({});
  const [bannerLimit, setBannerLimit] = useState(2);
  const [altText, setAltText] = useState("NearFix banner");
  const [images, setImages] = useState<File[]>([]);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  function loadBanners() {
    if (!token) {
      return;
    }
    setIsLoading(true);
    Promise.all([getAdminBanners(token), getAdminBannerSettings(token)])
      .then(([nextBanners, settings]) => {
        setBanners(nextBanners);
        setBannerLimit(settings.bannerLimit);
        setError("");
        return Promise.all(
          nextBanners.map((banner) =>
            fetchAdminBlobUrl(token, banner.imageUrl)
              .then((url) => [banner.id, url] as const)
              .catch(() => null),
          ),
        );
      })
      .then((entries) => {
        const nextUrls: Record<number, string> = {};
        entries?.forEach((entry) => {
          if (entry) {
            nextUrls[entry[0]] = entry[1];
          }
        });
        setPreviewUrls((currentUrls) => {
          Object.values(currentUrls).forEach((url) => URL.revokeObjectURL(url));
          return nextUrls;
        });
      })
      .catch((caughtError) => {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "Unable to load banners.",
        );
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    const timer = window.setTimeout(loadBanners, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setImages(Array.from(event.target.files ?? []));
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || images.length === 0) {
      setError("Choose at least one banner image first.");
      return;
    }
    setIsUploading(true);
    setError("");
    try {
      for (const image of images) {
        const formData = new FormData();
        formData.append("image", image);
        formData.append("altText", altText);
        await createAdminBanner(token, formData);
      }
      setImages([]);
      setFileInputKey((current) => current + 1);
      setAltText("NearFix banner");
      setMessage(
        images.length === 1
          ? "Banner uploaded."
          : `${images.length} banners uploaded.`,
      );
      loadBanners();
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to upload banner.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function saveLimit() {
    if (!token) {
      return;
    }
    try {
      const settings = await updateAdminBannerSettings(token, bannerLimit);
      setBannerLimit(settings.bannerLimit);
      setMessage("Banner display count updated.");
      setError("");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to update banner count.",
      );
    }
  }

  async function toggleBanner(banner: AdminBanner) {
    if (!token) {
      return;
    }
    const updated = await updateAdminBanner(token, banner.id, {
      isActive: !banner.isActive,
    });
    setBanners((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    );
  }

  async function removeBanner(banner: AdminBanner) {
    if (!token || !window.confirm("Delete this banner?")) {
      return;
    }
    await deleteAdminBanner(token, banner.id);
    setBanners((current) => current.filter((item) => item.id !== banner.id));
    setMessage("Banner deleted.");
  }

  async function updateOrder(banner: AdminBanner, displayOrder: number) {
    if (!token) {
      return;
    }
    const updated = await updateAdminBanner(token, banner.id, { displayOrder });
    setBanners((current) =>
      current
        .map((item) => (item.id === updated.id ? updated : item))
        .sort((a, b) => a.displayOrder - b.displayOrder),
    );
  }

  return (
    <AdminShell>
      <AdminPageHeader
        subtitle="Upload customer home banners, control active state, and choose how many rotate."
        title="Banners"
      />

      {error ? (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-[14px] text-red-600">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mb-4 rounded-lg bg-[#defde7] px-4 py-3 text-[14px] text-[#2aa946]">
          {message}
        </p>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="grid gap-5">
          <AdminCard>
            <h2 className="text-[20px] font-extrabold text-black">Upload Banners</h2>
            <form className="mt-4 grid gap-4" onSubmit={handleCreate}>
              <label className="text-[14px] font-semibold text-[#2f3338]">
                Alt text
                <input
                  className="mt-2 h-11 w-full rounded-lg border border-[#e7ecef] px-4 text-[14px] outline-none focus:border-[#f9a21a]"
                  onChange={(event) => setAltText(event.target.value)}
                  value={altText}
                />
              </label>
              <label className="text-[14px] font-semibold text-[#2f3338]">
                Images
                <input
                  accept="image/jpeg,image/png,image/webp"
                  className="mt-2 block w-full text-[14px] text-[#6d737c]"
                  key={fileInputKey}
                  multiple
                  onChange={handleFileChange}
                  type="file"
                />
              </label>
              {images.length > 0 ? (
                <p className="text-[13px] font-medium text-[#6d737c]">
                  {images.length} file{images.length === 1 ? "" : "s"} selected
                </p>
              ) : null}
              <AdminButton disabled={isUploading} type="submit">
                {isUploading ? "Uploading..." : "Upload Banners"}
              </AdminButton>
            </form>
          </AdminCard>

          <AdminCard>
            <h2 className="text-[20px] font-extrabold text-black">Display Count</h2>
            <div className="mt-4 flex gap-3">
              <input
                className="h-11 w-24 rounded-lg border border-[#e7ecef] px-4 text-[14px] outline-none focus:border-[#f9a21a]"
                max={10}
                min={1}
                onChange={(event) => setBannerLimit(Number(event.target.value))}
                type="number"
                value={bannerLimit}
              />
              <AdminButton onClick={saveLimit}>Save</AdminButton>
            </div>
          </AdminCard>
        </div>

        <div className="grid gap-4">
          {isLoading ? (
            <AdminCard>Loading banners...</AdminCard>
          ) : banners.length === 0 ? (
            <AdminCard>No uploaded banners yet.</AdminCard>
          ) : (
            banners.map((banner) => (
              <AdminCard key={banner.id}>
                <div className="grid gap-4 md:grid-cols-[180px_1fr] md:items-center">
                  <div className="aspect-[2.3/1] overflow-hidden rounded-lg bg-slate-100">
                    {previewUrls[banner.id] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        alt={banner.altText}
                        className="h-full w-full object-cover"
                        src={previewUrls[banner.id]}
                      />
                    ) : null}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[17px] font-extrabold text-black">
                        {banner.altText}
                      </h3>
                      <AdminStatusBadge status={banner.isActive ? "active" : "blocked"} />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <label className="text-[13px] font-semibold text-[#6d737c]">
                        Order
                        <input
                          className="ml-2 h-9 w-20 rounded-lg border border-[#e7ecef] px-3 text-[13px]"
                          min={0}
                          onBlur={(event) =>
                            updateOrder(banner, Number(event.target.value))
                          }
                          type="number"
                          defaultValue={banner.displayOrder}
                        />
                      </label>
                      <AdminButton onClick={() => toggleBanner(banner)} tone="secondary">
                        {banner.isActive ? "Deactivate" : "Activate"}
                      </AdminButton>
                      <AdminButton onClick={() => removeBanner(banner)} tone="danger">
                        Delete
                      </AdminButton>
                    </div>
                  </div>
                </div>
              </AdminCard>
            ))
          )}
        </div>
      </div>
    </AdminShell>
  );
}
