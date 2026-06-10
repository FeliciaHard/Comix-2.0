"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import Viewer from 'viewerjs';
import 'viewerjs/dist/viewer.css';
import JSZip from 'jszip';
import NextImage from 'next/image';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

type Props = { strippyFolder: string, strippyName: string, strippyTitle: string };

export default function StrippyViewer({ strippyFolder, strippyName, strippyTitle }: Props) {
  const outputRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);

  const [strippyPages, setStrippyPages] = useState<{ name: string; fullUrl: string; compressedUrl: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 40;
  const totalPages = Math.ceil(strippyPages.length / pageSize);

  const host = process.env.NEXT_PUBLIC_BLOB_IP;
  const port = process.env.NEXT_PUBLIC_BLOB_PORT;
  const domain = process.env.NEXT_PUBLIC_IMAGE_DOMAIN;

  // Thumbnail resolution settings - adjust these values to change thumbnail size
  const thumbnailMaxWidth = 500; // Change this to adjust thumbnail width
  const thumbnailMaxHeight = 500; // Change this to adjust thumbnail height

  // Wrap openStrippy with useCallback
  const openStrippy = useCallback(
    (file: File) => {
      const out = outputRef.current;
      if (!out) return;

      out.innerHTML = '';
      out.style.display = 'none';

      archiveOpenFile(file, async (archive?: JSZip, err?: string) => {
        if (archive) {
          await readContents(archive);
        } else {
          out.innerHTML = `<font color='red'>${err}</font><br>`;
          out.style.display = 'block';
          setLoading(false);
        }
      });
    },
    [outputRef]
  );

  // Include openStrippy as a dependency
  const loadStrippy = useCallback(
    async (title: string) => {
      setLoading(true);
    
      const encodedTitle = encodeURIComponent(title);
    
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
          console.warn(
            "Primary URL failed, trying fallback...",
            primaryError
          );
    
          resp = await fetch(fallbackUrl);
    
          if (!resp.ok) {
            throw new Error(`Fallback request failed: ${resp.status}`);
          }
        }
    
        const blob = await resp.blob();
    
        const file = new File([blob], title, {
          type: blob.type || "application/octet-stream",
        });
    
        openStrippy(file);
      } catch (error) {
        console.error("Fetching strippy error:", error);
      } finally {
        setLoading(false);
      }
    }, [host, port, domain, strippyFolder, openStrippy]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
      loadStrippy(strippyTitle);
    }, [strippyTitle, loadStrippy]);

    useEffect(() => {
      setCurrentPage(1);
    }, [strippyPages]);

  async function readContents(archive: JSZip) {
    const entries = Object.values(archive.files).filter((file) => {
      const ext = getExt(file.name);
      return ext && ext !== 'db' && ext !== 'html' && !file.name.endsWith('/');
    });

    entries.sort((a, b) => sortNames(a, b));

    const imageBlobs: { name: string; fullUrl: string; compressedUrl: string }[] = [];
    const seenNames = new Set<string>();

    for (const entry of entries) {
      if (seenNames.has(entry.name)) continue;
      seenNames.add(entry.name);

      try {
        const data = await entry.async('uint8array');
        const fullBlob = new Blob([data], { type: getMIME(entry.name) });
        const fullUrl = URL.createObjectURL(fullBlob);
        const compressedBlob = await compressImage(fullBlob, thumbnailMaxWidth, thumbnailMaxHeight);
        const compressedUrl = URL.createObjectURL(compressedBlob);
        imageBlobs.push({ name: entry.name, fullUrl, compressedUrl });
      } catch (err) {
        console.error(`Error reading ${entry.name}:`, err);
      }
    }

    const uniqueSortedImages = [...new Map(imageBlobs.map(i => [i.name, i])).values()]
      .sort((a, b) => sortNames({ name: a.name }, { name: b.name }));

    setStrippyPages(uniqueSortedImages);
    setLoading(false);

    setTimeout(() => {
      initViewer();
    }, 100);
  }

  function compressImage(blob: Blob, maxWidth: number, maxHeight: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        let { width, height } = img;
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((b) => {
          if (!b) return reject(new Error('Image compression failed'));
          resolve(b);
        }, 'image/jpeg', 0.8);
      };
      img.onerror = (e) => reject(e);
      img.src = URL.createObjectURL(blob);
    });
  }

  function initViewer() {
    if (!galleryRef.current) return;

    if (viewerRef.current) {
      viewerRef.current.destroy();
      viewerRef.current = null;
    }

    viewerRef.current = new Viewer(galleryRef.current, {
      inline: false,
      button: true,
      navbar: true,
      title: false,
      toolbar: true,
      url: (img: HTMLImageElement) => img.dataset.original || img.src,
    });
  }

  function getExt(name: string) {
    const ext = name.split('.').pop()?.toLowerCase() ?? '';
    return ext === name || ext === 'db' ? '' : ext;
  }

  function getMIME(name: string) {
    const ext = getExt(name);
    return {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      bmp: 'image/bmp',
      webp: 'image/webp',
    }[ext] || 'image/jpeg';
  }

  // Replace explicit any with proper type JSZip.JSZipObject for sorting
  function sortNames(a: { name: string }, b: { name: string }) {
    const ap = a.name.match(/(\D+|\d+)/g) || [];
    const bp = b.name.match(/(\D+|\d+)/g) || [];
    for (let i = 0; i < Math.min(ap.length, bp.length); i++) {
      if (ap[i] !== bp[i]) {
        const ai = parseInt(ap[i], 10),
          bi = parseInt(bp[i], 10);
        if (!isNaN(ai) && !isNaN(bi)) return ai - bi;
        return ap[i].localeCompare(bp[i]);
      }
    }
    return ap.length - bp.length;
  }

  function archiveOpenFile(file: File, callback: (archive?: JSZip, err?: string) => void) {
    const ext = file.name.split('.').pop()?.toLowerCase() as string;
    if (ext === 'cbz' || ext === 'zip') {
      loadZipFile(file, callback);
    } else {

      if (ext === '') {
        callback(undefined, '');
      } else {
        callback(undefined, 'Unsupported file format');
      }
    }
  }

  function loadZipFile(file: File, callback: (archive?: JSZip, err?: string) => void) {
    const zip = new JSZip();
    zip.loadAsync(file)
      .then((archive) => callback(archive))
      .catch((err) => callback(undefined, err.message));
  }

  // Slice the pages to current page size
  const pagedImages = strippyPages.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    if (!loading && pagedImages.length) {
      requestAnimationFrame(() => {
        initViewer();
      });
    }
  }, [pagedImages, loading]);

  // Handle page click function for pagination
  function handlePageClick(page: number) {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      galleryRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  interface PaginationProps {
    currentPage: number;
    totalPages: number;
    handlePageClick: (page: number) => void;
  }

  const PaginationComponent: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    handlePageClick,
  }) => {
    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === totalPages;
  
    return (
      <Pagination className="flex justify-center overflow-x-auto px-2 text-sm">
        <PaginationContent className="flex flex-wrap gap-2 items-center">
          {/* Previous Button */}
          <PaginationItem>
            <PaginationPrevious
              onClick={() => {
                if (!isFirstPage) handlePageClick(currentPage - 1);
              }}
              className={`cursor-pointer px-2 py-1 transition 
                ${isFirstPage ? 'bg-black text-gray-500' : 'bg-black text-white'}`}
            />
          </PaginationItem>
  
          {/* First Page */}
          <PaginationItem>
            <PaginationLink
              onClick={() => handlePageClick(1)}
              className={`min-w-[32px] text-center cursor-pointer px-2 py-1 ${
                currentPage === 1 ? 'bg-white text-black font-bold' : 'bg-black text-white'
              }`}
            >
              1
            </PaginationLink>
          </PaginationItem>
  
          {/* Left Ellipsis */}
          {currentPage > 4 && <PaginationEllipsis />}
  
          {/* Pages around current */}
          {[currentPage - 1, currentPage, currentPage + 1].map((page) =>
            page > 1 && page < totalPages ? (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => handlePageClick(page)}
                  className={`min-w-[32px] text-center cursor-pointer px-2 py-1 ${
                    page === currentPage
                      ? 'bg-white text-black font-bold'
                      : 'bg-black text-white'
                  }`}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ) : null
          )}
  
          {/* Right Ellipsis */}
          {currentPage < totalPages - 3 && <PaginationEllipsis />}
  
          {/* Last Page */}
          {totalPages > 1 && (
            <PaginationItem>
              <PaginationLink
                onClick={() => handlePageClick(totalPages)}
                className={`min-w-[32px] text-center cursor-pointer px-2 py-1 ${
                  currentPage === totalPages
                    ? 'bg-white text-black font-bold'
                    : 'bg-black text-white'
                }`}
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          )}
  
          {/* Next Button */}
          <PaginationItem>
            <PaginationNext
              onClick={() => {
                if (!isLastPage) handlePageClick(currentPage + 1);
              }}
              className={`cursor-pointer px-2 py-1 transition 
                ${isLastPage ? 'bg-black text-gray-500' : 'bg-black text-white'}`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div
      ref={galleryRef}
      className="max-h-[85vh] overflow-y-auto"
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      <div ref={outputRef} style={{ display: 'none' }} />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="inline-block w-12 h-12 border-4 border-fuchsia-800 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-black dark:text-white text-lg text-center font-semibold mt-6">
            Loading &quot;{strippyName}&quot; pages...
          </span>
        </div>
      ) : (
        <>
          {/* Sticky Top Pagination */}
          {totalPages > 1 && (
            <div className="sticky top-0 z-10 pt-2 pb-2">
              <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                handlePageClick={handlePageClick}
              />
            </div>
          )}

          {/* Image Grid */}
          <div className="mt-4 grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 justify-items-center">
            {pagedImages.map(({ name, fullUrl, compressedUrl }, index) => (
              <div
                key={index}
                className="group flex flex-col items-center w-full cursor-pointer select-none"
              >
                <NextImage
                  src={compressedUrl}
                  alt={`Page ${(currentPage - 1) * pageSize + index + 1}`}
                  width={100}
                  height={100}
                  className="w-full h-full object-cover rounded-xl shadow-md transition-transform duration-300 ease-in-out group-hover:scale-105"
                  loading="lazy"
                  draggable={false}
                  data-action="zoom"
                  data-original={fullUrl}
                />
                <div className="mt-2 h-5 overflow-hidden relative max-w-[120px] w-full">
                  <span className="hidden absolute w-full whitespace-nowrap text-sm text-black dark:text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span
                      className="scrolling-text w-full"
                      style={{
                        display: 'inline-block',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {name}
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Pagination (optional) */}
          {/* {totalPages > 1 && (
            <div className="mt-4">
              <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                handlePageClick={handlePageClick}
              />
            </div>
          )} */}
        </>
      )}
    </div>
  );
}