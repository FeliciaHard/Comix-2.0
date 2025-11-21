'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
// import {
//   Pagination,
//   PaginationContent,
//   PaginationEllipsis,
//   PaginationItem,
//   PaginationLink,
//   PaginationNext,
//   PaginationPrevious,
// } from '@/components/ui/pagination';
// import { FiRefreshCw } from 'react-icons/fi';
import ScrollUpDown from '@/components/ui/scroll-up-down';
import ComicViewer from './comicViewer';
import ComicCover from './comicCover';
import RelatedComicsWithPagination from './relatedComic';

type BgImage = {
  image: string;
};

type ComicPage = {
  id_comix: string;
  name_comix: string;
  tol_page: string;
  dis_comix: string;
  audio_path: string;
  filename: string;
  cover_page: string;
};

export default function ComicClient({ comicId }: { comicId: string }) {
  const [bgimage, setBgImage] = useState<BgImage[]>([]);
  const [cpDatas, setCPData] = useState<ComicPage[]>([]);
  const [singleComic, setSingleComic] = useState<ComicPage | null>(null);
  const [error, setError] = useState<string>('');
  const [appName, setAppName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [shuffleKey, setShuffleKey] = useState(0);
  // const [isSpinning, setIsSpinning] = useState(false);
  const [loading, setLoading] = useState(true);

  const host = process.env.NEXT_PUBLIC_BLOB_IP;
  const port = process.env.NEXT_PUBLIC_BLOB_PORT;

  const [comicMetadata, setComicMetadata] = useState<{
    title: string;
    description: string;
  }>({ title: '', description: '' });

  const itemsPerPage = 24;

  function capitalizeFirstLetter(word?: string) {
    if (typeof word !== 'string' || word.length === 0) {
      return '';
    }
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  useEffect(() => {
    const envAppName = capitalizeFirstLetter(process.env.NEXT_PUBLIC_APP_NAME || 'DefaultAppName');
    localStorage.setItem('appName', envAppName);
    setAppName(envAppName);
  }, []);

  useEffect(() => {
    fetch('/api/mysql-config/route_comicPage/bg')
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to fetch background images');
        }
        return res.json();
      })
      .then((data: BgImage[]) => setBgImage(data))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    fetch('/api/mysql-config/route_comicPage')
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to fetch comics');
        }
        return res.json();
      })
      .then((dataCP) => {
        setCPData(dataCP.data);
      })
      .catch((err) => setError(err.message));
  }, []);

  // Fetch single comic by ID from params.id
  useEffect(() => {
    async function fetchComicById(id: string) {
      if (!comicId.trim()) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/mysql-config/route_comicPage?id=${comicId.trim()}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to fetch comic');
        }
        const json = await res.json();
        setSingleComic(json.data.length > 0 ? json.data[0] : null);
        setError('');
        // Set dynamic metadata here
        if (json.data.length > 0) {
          const comic = json.data[0];
          setComicMetadata({
            title: comic.name_comix,
            description: comic.dis_comix,
          });
        }
      } catch (error: any) {
        setError(error.message);
        setSingleComic(null);
      } finally {
        setLoading(false);
      }
    }
    fetchComicById(comicId);
  }, [comicId]);

  const backgroundImage = bgimage.find((bg) => bg.image)?.image;
  const totalPages = Math.ceil(cpDatas.length / itemsPerPage);

  // Memoized random data (reshuffle on shuffleKey)
  const randomizedComix = useMemo(() => {
    return [...cpDatas].sort(() => Math.random() - 0.5);
  }, [cpDatas, shuffleKey]);

  // Memoized paged data
  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return randomizedComix.slice(start, start + itemsPerPage);
  }, [randomizedComix, currentPage]);

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  // Search filtered comics (unshuffled for predictable filtering)
  const filteredComics = useMemo(() => {
    return cpDatas.filter((comic) =>
      comic.name_comix.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cpDatas, searchTerm]);

  // The metadata is available for use here
  useEffect(() => {
    if (singleComic) {
      // Set the document title dynamically (e.g., "Comic Title | My App")
      document.title = `${comicMetadata.title} | ${appName}`;

      // Update the meta description tag
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', comicMetadata.description);
      }
    }
  }, [singleComic, comicMetadata, appName]);

  const [relatedComics, setRelatedComics] = useState<ComicPage[]>([]);

  const getFilteredComics = (term: string): ComicPage[] => {
    const lowerTerm = term.toLowerCase().trim();
    return cpDatas.filter((comic) =>
      comic.name_comix.toLowerCase().includes(lowerTerm)
    );
  };    

  useEffect(() => {
    if (singleComic?.name_comix) {
      const term = singleComic.name_comix.split(" ")[0];
      // const term = "spider";
      const filtered = getFilteredComics(term);
      const filteredWithoutSelf = filtered.filter(
        (c) => c.id_comix !== singleComic.id_comix
      );
      setRelatedComics(filteredWithoutSelf);
    }
  }, [singleComic, cpDatas]);     

  const [headerOpacity, setHeaderOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const fadeStart = 0;
      const fadeUntil = 100;
      const opacity = Math.max(0, 1 - scrollY / (fadeUntil - fadeStart));
      setHeaderOpacity(opacity);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div
      className="bg-cover bg-black min-h-screen text-gray-900 dark:text-white transition-colors duration-300 z-0"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url(${backgroundImage})`,
        backgroundSize: '35%',
        backgroundAttachment: 'fixed',
        overflowX: 'hidden',
      }}
    >
      <div
        className="fixed z-20 flex justify-between items-center w-full py-4"
        style={{
          background: 'linear-gradient(to bottom, black, transparent 100%)',
        }}
      >
        <h1
          className="text-2xl md:text-3xl font-semibold text-white px-4 md:px-6 transition-opacity duration-300"
          style={{ opacity: headerOpacity }}
        >
          Comix ID: {singleComic?.id_comix || '0'}
        </h1>
      </div>

      <div className="z-1 mt-20 px-4 sm:px-6 md:px-8">
        {error && <p className="text-red-500 mb-4">Error loading comixs: {error}</p>}

        {loading && (
          <div className="flex items-center justify-center fixed inset-0 bg-white dark:bg-black bg-opacity-70 z-50">
            <div className="flex flex-col items-center">
              <div className="inline-block w-12 h-12 border-4 border-fuchsia-800 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-black dark:text-white text-lg font-semibold mt-4">Loading comix data...</span>
            </div>
          </div>
        )}

        {!loading && !singleComic && !error && (
          <p className="text-center text-white text-lg">Comix not found. Please check the ID.</p>
        )}

        {!loading && singleComic && (
          <div className="@container/main grid grid-cols-1 gap-4 px-4 lg:px-6 py-4 md:grid-cols-3 md:gap-6">
            {/* Comic Detail Section */}
            <section className="order-1 md:order-none bg-[rgba(255,255,255,0.85)] dark:bg-[rgba(0,0,0,0.85)] md:col-span-3 rounded-xl p-6 flex flex-col md:flex-row gap-6">
              {/* Comic Cover */}
              <div className="flex-shrink-0 w-full md:w-auto">
                <Image
                  src={singleComic?.dis_comix || "https://i.ebayimg.com/images/g/fXIAAOSwWu9icvVG/s-l1200.jpg"}
                  alt={singleComic?.name_comix || "Comic Cover"}
                  width={100}
                  height={100}
                  className="w-full max-w-full md:max-w-[320px] lg:max-w-[400px] h-auto box a rounded-3xl shadow-md"
                />
              </div>

              {/* Metadata */}
              <div className="flex flex-col justify-start w-full max-w-full md:max-w-[600px]">
                <label className="text-xl md:text-3xl lg:text-3xl font-semibold text-wrap text-gray-900 dark:text-white mb-4 text-center md:text-left lg:text-left break-words">
                  {singleComic?.name_comix || 'Amazing Spider-Man #1'}
                </label>
                <ul className="text-sm text-gray-800 dark:text-gray-300 space-y-1">
                  <li><strong>Pages:</strong> {singleComic?.tol_page || '0'}</li>
                  {/* Add more metadata if you want */}
                </ul>
                {singleComic?.filename && (
                  <a
                    href={`http://${host}:${port}/test-site/main/php/dashboard/display-comixs/page/comix_content/TracyScops_Arc/${singleComic.filename}`}
                    download
                    className="mt-10 md:mt-10 lg:mt-10 text-sm w-full px-4 py-2 text-center text-white bg-gradient-to-r from-pink-950 to-fuchsia-950 rounded-full hover:bg-blue-700 transition transform active:scale-95 duration-150 ease-in-out"
                  >
                    Download Comix
                  </a>
                )}
              </div>
            </section>

            {/* Box One */}
            <div className="order-2 md:order-none bg-[rgba(255,255,255,0.85)] dark:bg-[rgba(0,0,0,0.85)] md:col-span-3 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Comix Pages</h2>
              {singleComic?.audio_path ? (
                <div>
                  <audio
                    controls
                    className="mt-4 w-full rounded"
                    src={`http://${host}:${port}/test-site/main/php/dashboard/display-comixs/page/audio/${singleComic.audio_path}`}
                    preload="metadata"
                  >
                  </audio>
                </div>
              ) : null}
              <div className='mt-4'>
                <ComicViewer comicTitle={singleComic?.filename || 'EMPTY'} />
              </div>
            </div>
            
            {/* Box Three */}
            <div className="order-3 md:order-none bg-[rgba(255,255,255,0.85)] dark:bg-[rgba(0,0,0,0.85)] md:col-span-3 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Related Comixs</h2>
              <RelatedComicsWithPagination relatedComics={relatedComics} />
            </div>

            {/* Box Four */}
            <div className="order-3 md:order-none bg-[rgba(255,255,255,0.85)] dark:bg-[rgba(0,0,0,0.85)] md:col-span-3 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Comix Cover</h2>
              <ComicCover driveUrl={singleComic?.cover_page ?? 'NULL'} />
            </div>
          </div>
        )}
      </div>

      {/* Scroll to Top/Bottom Buttons */}
      <ScrollUpDown />
    </div>
  );
}
