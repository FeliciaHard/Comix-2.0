'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import Image from 'next/image';
import { DashCards } from './dashCards';
import SlidePerView from '@/components/swiperjs/SlidePerView';
import { FiRefreshCw } from 'react-icons/fi';
import ScrollUpDown from '@/components/ui/scroll-up-down';
import { ScrollArea } from '@/components/ui/scroll-area';

type BgImage = {
  image: string;
};

type Dash = {
  id_comix: string;
  name_comix: string;
  dis_comix: string;
};

export default function Dashboard() {
  const [bgimage, setBgImage] = useState<BgImage[]>([]);
  const [dashDatas, setDashData] = useState<Dash[]>([]);
  const [totalComix, setTotalComix] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [appName, setAppName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [shuffleKey, setShuffleKey] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [headerOpacity, setHeaderOpacity] = useState(1);

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
    fetch('/api/mysql-config/route_bg')
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to fetch');
        }
        return res.json();
      })
      .then((data: BgImage[]) => setBgImage(data))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    fetch('/api/mysql-config/route_dash')
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to fetch');
        }
        return res.json();
      })
      .then((dataDash) => {
        setDashData(dataDash.data);
        setTotalComix(dataDash.total_comix);
        setTotalUsers(dataDash.total_users);
      })
      .catch((err) => setError(err.message));
  }, []);

  const backgroundImage = bgimage.find((bg) => bg.image)?.image;
  const totalPages = Math.ceil(dashDatas.length / itemsPerPage);

  // Memoized random data
  const randomizedComix = useMemo(() => {
    return [...dashDatas].sort(() => Math.random() - 0.5);
  }, [dashDatas, shuffleKey]);

  // Memoized paged data
  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return randomizedComix.slice(start, start + itemsPerPage);
  }, [randomizedComix, currentPage]);

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const filteredComics = useMemo(() => {
    return dashDatas.filter((comic) =>
      comic.name_comix.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [dashDatas, searchTerm]);

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
          Dashboard
        </h1>
      </div>

      <div className="z-1 mt-20 px-4 sm:px-6 md:px-8">
        <p className="mb-4 text-sm md:text-base text-white flex items-center gap-2">
          <span>Welcome to {appName}.</span>
        </p>

        {error && <p className="text-red-500 mb-4">Error loading comics: {error}</p>}

        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <DashCards total_com={totalComix.toString()} total_users={totalUsers.toString()} />
            </div>
          </div>
        </div>

        <div className="@container/main grid grid-cols-1 gap-4 px-4 lg:px-6 md:grid-cols-3 md:gap-6">
          <div className="bg-transparent md:col-span-3 rounded-xl p-4">
            <div className="overflow-hidden">
              {dashDatas.length > 0 && (
                <SlidePerView
                  slides={dashDatas.slice(-7).reverse().map((dataDash) => ({
                    id: dataDash.id_comix,
                    image: dataDash.dis_comix,
                    label: dataDash.name_comix,
                    isNew : true,
                  }))}
                />
              )}
            </div>
          </div>
        </div>

        <div className="@container/main grid grid-cols-1 gap-4 px-4 lg:px-6 py-4 md:grid-cols-3 md:gap-6">
          {/* Box One */}
          <div className="order-2 md:order-none bg-[rgba(255,255,255,0.85)] dark:bg-[rgba(0,0,0,0.85)] md:col-span-2 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Randomize Comixs</h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">Hope You Cum A Lot 😍!</p>

            {/* Optional Randomize Button */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setIsSpinning(true);
                  setShuffleKey((prev) => prev + 1);
                  setCurrentPage(1);

                  // Stop spinning after 1 second
                  setTimeout(() => setIsSpinning(false), 1000);
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-pink-950 to-fuchsia-950 text-white hover:bg-blue-700 cursor-pointer transition"
                title="Randomize"
              >
                <FiRefreshCw className={`text-lg transition-transform duration-500 ${isSpinning ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Pagination Top */}
            <Pagination className="mt-6 flex justify-center overflow-x-auto px-2 text-sm">
              <PaginationContent className="flex flex-wrap gap-2 items-center">
                <PaginationItem>
                  <PaginationPrevious
                    className='cursor-pointer'
                    onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                  />
                </PaginationItem>

                <PaginationItem>
                  <PaginationLink
                    onClick={() => handlePageClick(1)}
                    isActive={currentPage === 1}
                    className="min-w-[32px] text-center cursor-pointer"
                  >
                    1
                  </PaginationLink>
                </PaginationItem>

                {currentPage > 4 && <PaginationEllipsis />}

                {[currentPage - 1, currentPage, currentPage + 1].map((page) =>
                  page > 1 && page < totalPages ? (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageClick(page)}
                        isActive={page === currentPage}
                        className="min-w-[32px] text-center cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ) : null
                )}

                {currentPage < totalPages - 3 && <PaginationEllipsis />}

                {totalPages > 1 && (
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => handlePageClick(totalPages)}
                      isActive={currentPage === totalPages}
                      className="min-w-[32px] text-center cursor-pointer"
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationNext
                    className='cursor-pointer'
                    onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>

            <div className="mt-8 grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 justify-items-center">
              {pagedData.map((dataDash, index) =>
                dataDash.dis_comix ? (
                  <a
                    key={index}
                    // href={`http://192.168.1.240:2405/test-site/main/php/dashboard/display-comixs/page/page.php?idCom=${dataDash.id_comix}`}
                    href={`/comic-page/${dataDash.id_comix}`}
                    className="group flex flex-col items-center w-full"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image
                      src={dataDash.dis_comix}
                      alt={`Comix ${index + 1}`}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover rounded-lg shadow-md transition-transform duration-300 ease-in-out group-hover:scale-105"
                      loading="lazy"
                      draggable={false}
                    />
                    <div className="mt-2 h-5 overflow-hidden relative max-w-[120px] w-full">
                      <span className="absolute w-full whitespace-nowrap text-sm text-black dark:text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span
                          className="scrolling-text w-full"
                          style={{
                            display: 'inline-block',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {dataDash.name_comix || `Comix ${index + 1}`}
                        </span>
                      </span>
                    </div>
                  </a>
                ) : null
              )}
            </div>

            {/* Pagination Bottom — Reuse same component */}
            <Pagination className="mt-2 flex justify-center overflow-x-auto px-2 text-sm">
              <PaginationContent className="flex flex-wrap gap-2 items-center">
                <PaginationItem>
                  <PaginationPrevious
                    className='cursor-pointer'
                    onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    onClick={() => handlePageClick(1)}
                    isActive={currentPage === 1}
                    className="min-w-[32px] text-center cursor-pointer"
                  >
                    1
                  </PaginationLink>
                </PaginationItem>

                {currentPage > 4 && <PaginationEllipsis />}
                {[currentPage - 1, currentPage, currentPage + 1].map((page) =>
                  page > 1 && page < totalPages ? (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageClick(page)}
                        isActive={page === currentPage}
                        className="min-w-[32px] text-center cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ) : null
                )}
                {currentPage < totalPages - 3 && <PaginationEllipsis />}
                {totalPages > 1 && (
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => handlePageClick(totalPages)}
                      isActive={currentPage === totalPages}
                      className="min-w-[32px] text-center cursor-pointer"
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationNext
                    className='cursor-pointer'
                    onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>

          {/* Box Two - Search Box */}
          <div className="order-1 md:order-none bg-[rgba(255,255,255,0.85)] dark:bg-[rgba(0,0,0,0.85)] md:col-span-1 rounded-xl p-6 flex flex-col h-full max-h-screen">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Search Comix</h2>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter comic name..."
                className="w-full px-3 py-2 text-sm border border-gray-300 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-fuchsia-800 dark:bg-black dark:text-white dark:border-gray-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="px-3 py-2 text-sm bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition cursor-pointer"
                  title="Clear search"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Make ScrollArea fill space with max height */}
            <ScrollArea className="mt-4 rounded-xl" style={{ maxHeight: "calc(100vh - 145px)" }}>
              {searchTerm ? (
                filteredComics.length > 0 ? (
                  filteredComics.map((comic) => (
                    <a
                      key={comic.id_comix}
                      href={`/comic-page/${comic.id_comix}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 group hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-xl transition w-full"
                    >
                      {comic.dis_comix && (
                        <Image
                          src={comic.dis_comix}
                          alt={comic.name_comix}
                          width={100}
                          height={100}
                          className="w-12 h-16 object-cover rounded-md shadow-md"
                          loading="lazy"
                        />
                      )}
                      <span className="text-sm text-gray-900 dark:text-white group-hover:underline line-clamp-2">
                        {comic.name_comix}
                      </span>
                    </a>
                  ))
                ) : (
                  <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                    No results found.
                  </p>
                )
              ) : null}
            </ScrollArea>
          </div>

          {/* Box Three */}
          <div className="order-3 md:order-none bg-[rgba(255,255,255,0.85)] dark:bg-[rgba(0,0,0,0.85)] md:col-span-3 aspect-video rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Box Three</h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              And this is the third one — responsive and styled for both light and dark mode.
            </p>
          </div>
        </div>
      </div>

      {/* Scroll to Top/Bottom Buttons */}
      <ScrollUpDown />
    </div>
  );
}
