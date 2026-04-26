'use client';

import { useEffect, useState } from 'react';
import VideoPlayer from '@/components/player/video/videoPlayer';

interface VideoItem {
  title: string;
  filename: string;
}

interface StrippyVPlayerProps {
  strippyFolder: string;
  loading?: boolean;
}

export default function StrippyVPlayer({
  strippyFolder,
  loading = false,
}: StrippyVPlayerProps) {
  const host = process.env.NEXT_PUBLIC_BLOB_IP;
  const port = process.env.NEXT_PUBLIC_BLOB_PORT;

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [internalLoading, setInternalLoading] = useState(true);

  useEffect(() => {
    if (!strippyFolder || strippyFolder === 'Not Available!') return;

    async function fetchVideos() {
      setInternalLoading(true);

      try {
        const res = await fetch(
          `http://${host}:${port}/test-site/main/php/dashboard/display-comixs/page/content/Strippy/${strippyFolder}/Footage/Temp/`
        );

        const text = await res.text();

        const mp4Files = Array.from(
          text.matchAll(/href="([^"]+\.mp4)"/gi)
        ).map((m) => m[1]);

        const videoItems: VideoItem[] = mp4Files.map((f) => ({
          title: f,
          filename: f,
        }));

        setVideos(videoItems);
      } catch (err) {
        console.error('Failed to load videos', err);
        setVideos([]);
      } finally {
        setInternalLoading(false);
      }
    }

    fetchVideos();
  }, [strippyFolder, host, port]);

  function formatVideoTitle(title: string) {
    if (!title) return '';
    let clean = title.replace(/\.mp4$/i, '');
    clean = clean.replace(/%20/g, ' ');
    return clean;
  }

  if (loading || internalLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="inline-block w-12 h-12 border-4 border-fuchsia-800 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-black dark:text-white text-lg text-center font-semibold mt-4">
          Loading videos...
        </span>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <p className="text-center text-gray-500">
        No videos available.
      </p>
    );
  }

  return (
    <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center auto-rows-fr">
      {videos.map((video, index) => {
        const videoUrl = `http://${host}:${port}/test-site/main/php/dashboard/display-comixs/page/content/Strippy/${strippyFolder}/Footage/Temp/${video.filename}`;

        return (
          <div
            key={index}
            className="group flex flex-col w-full min-w-[150px] bg-black rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden"
          >
            <div className="aspect-video w-full bg-black">
              <VideoPlayer src={videoUrl} />
            </div>

            <div className="p-2 text-center">
              <p
                className="text-sm font-bold text-white truncate uppercase"
                title={video.title}
              >
                {formatVideoTitle(video.title)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}