/* eslint-disable @next/next/no-img-element */

'use client';

import { useEffect, useState, useCallback } from 'react';
import JSZip from 'jszip';

type Props = {
  strippyFolder: string;
  strippyTitle: string;
};

export default function StrippyCoverFirstImage({
  strippyFolder,
  strippyTitle,
}: Props) {
  const [firstImage, setFirstImage] = useState<{ name: string; url: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const host = process.env.NEXT_PUBLIC_BLOB_IP;
  const port = process.env.NEXT_PUBLIC_BLOB_PORT;
  const domain = process.env.NEXT_PUBLIC_IMAGE_DOMAIN;

  const loadStrippy = useCallback(async () => {
    setLoading(true);
    setError(null);
      
    const encodedTitle = encodeURIComponent(strippyTitle);
      
    const primaryUrl =
      `http://${host}:${port}/test-site/main/php/dashboard/display-comixs/page/content/Strippy/${strippyFolder}/${encodedTitle}`;
      
    const fallbackUrl =
      `https://${domain}/Strippy/${strippyFolder}/${encodedTitle}`;
      
    try {
      let resp: Response;
      
      try {
        resp = await fetch(primaryUrl);
      
        if (!resp.ok) {
          throw new Error(`Primary request failed: ${resp.status}`);
        }
      } catch (primaryError) {
        console.warn("Primary URL failed, trying fallback...", primaryError);
      
        resp = await fetch(fallbackUrl);
      
        if (!resp.ok) {
          throw new Error(`Fallback request failed: ${resp.status}`);
        }
      }
      
      const blob = await resp.blob();
      
      const file = new File([blob], strippyTitle, { type: blob.type });

      const zip = await JSZip.loadAsync(file);

      await readFirstImage(zip);
    } catch (error) {
      console.error("Strippy cover error:", error);
    } finally {
      setLoading(false);
    }
  }, [host, port, domain, strippyFolder, strippyTitle]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    loadStrippy();

    return () => {
      if (firstImage?.url) {
        URL.revokeObjectURL(firstImage.url);
      }
    };
  }, [loadStrippy]);

  async function readFirstImage(archive: JSZip) {
    const entries = Object.values(archive.files)
      .filter((file) => {
        const ext = getExt(file.name);
        return ext && ext !== 'db' && ext !== 'html' && !file.name.endsWith('/');
      })
      .sort((a, b) => sortNames(a, b));

    if (entries.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const firstEntry = entries[0];
      const originalBlob = await firstEntry.async('blob');

      const compressedBlob = await compressImageSmart(originalBlob);
      const url = URL.createObjectURL(compressedBlob);

      setFirstImage({ name: firstEntry.name, url });
    } catch (err) {
      console.error('Cover read error:', err);
    }

    setLoading(false);
  }

  function getExt(name: string) {
    const ext = name.split('.').pop()?.toLowerCase() ?? '';
    return ext === name || ext === 'db' ? '' : ext;
  }

  function sortNames(a: { name: string }, b: { name: string }) {
    const ap = a.name.match(/(\D+|\d+)/g) || [];
    const bp = b.name.match(/(\D+|\d+)/g) || [];
    for (let i = 0; i < Math.min(ap.length, bp.length); i++) {
      if (ap[i] !== bp[i]) {
        const ai = parseInt(ap[i], 10);
        const bi = parseInt(bp[i], 10);
        if (!isNaN(ai) && !isNaN(bi)) return ai - bi;
        return ap[i].localeCompare(bp[i]);
      }
    }
    return ap.length - bp.length;
  }

  async function compressImageSmart(blob: Blob): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(blob);

      img.onload = () => {
        URL.revokeObjectURL(url);

        const MIN = 200;
        const MAX = 300;

        let targetWidth = img.width;
        if (img.width > MAX) targetWidth = MAX;
        else if (img.width < MIN) targetWidth = img.width;

        const scale = targetWidth / img.width;
        const targetHeight = Math.round(img.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('No canvas context');

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        canvas.toBlob(
          (compressed) => {
            if (!compressed) return reject('Compression failed');
            resolve(compressed);
          },
          'image/webp',
          0.6
        );
      };

      img.onerror = reject;
      img.src = url;
    });
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-fuchsia-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !firstImage) {
    return <div className="text-red-600 text-sm">No cover found</div>;
  }

  return (
    <div className="flex flex-col items-center">
      <img
        src={firstImage.url}
        alt={firstImage.name}
        className="cursor-pointer rounded-xl shadow-md object-contain max-w-[300px] transition-transform duration-300 ease-in-out group-hover:scale-105"
        loading="lazy"
        draggable={false}
      />
      <span className="mt-2 text-xs font-medium truncate max-w-[280px]">
        {/* {firstImage.name} */}
      </span>
    </div>
  );
}
