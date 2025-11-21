'use client';

import { useEffect, useRef, useState } from 'react';
import Viewer from 'viewerjs';
import 'viewerjs/dist/viewer.css';
import Image from 'next/image';

type ComicCoverProps = {
  driveUrl: string;
};

const ComicCover: React.FC<ComicCoverProps> = ({ driveUrl }) => {
  const [coverSrc, setCoverSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchBase64() {
      if (!driveUrl) return;

      setLoading(true);
      try {
        const res = await fetch(`/api/drive-image?url=${encodeURIComponent(driveUrl)}`);
        const data = await res.json();
        if (data.base64) {
          setCoverSrc(data.base64);
        } else {
          console.error('Error fetching base64:', data.error);
          setCoverSrc(null);
        }
      } catch (e) {
        console.error('Network error fetching base64:', e);
        setCoverSrc(null);
      } finally {
        setLoading(false);
      }
    }

    fetchBase64();
  }, [driveUrl]);

  useEffect(() => {
    if (containerRef.current && coverSrc) {
      new Viewer(containerRef.current, {
        inline: false,
        button: true,
        navbar: false,
        title: false,
        toolbar: true,
      });
    }
  }, [coverSrc]);

  return (
    <div className="card mt-4">
      <div ref={containerRef}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="inline-block w-12 h-12 border-4 border-fuchsia-800 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-black dark:text-white text-lg text-center font-semibold mt-4">
              Loading cover page...
            </span>
          </div>
        ) : coverSrc ? (
          <Image
            src={coverSrc}
            alt="Comic Cover"
            width={100}
            height={100}
            className="img-fluid w-full card-img-top rounded-xl"
          />
        ) : (
          <p className="text-center text-red-600 dark:text-red-400 font-semibold">
            Failed to load image.
          </p>
        )}
      </div>
    </div>
  );
};

export default ComicCover;
