'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Comic {
  id_comix: string | number;
  name_comix: string;
  dis_comix?: string;
}

interface Props {
  relatedComics: Comic[];
  itemsPerPage?: number;
}

const RelatedComicsWithPagination: React.FC<Props> = ({
  relatedComics,
  itemsPerPage = 24,
}) => {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [comicData, setComicData] = useState<Comic[]>([]);

  // Simulate async fetch on mount
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setComicData(relatedComics); // Simulate loading delay (1s)
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [relatedComics]);

  const totalPages = Math.ceil(comicData.length / itemsPerPage);

  const pagedComics = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return comicData.slice(start, start + itemsPerPage);
  }, [comicData, currentPage, itemsPerPage]);

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const [message, setMessage] = useState(
    'No related comixs found. Please wait...'
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessage('No results found!');
    }, 10000); // 10 seconds

    return () => clearTimeout(timer); // clean up
  }, []);

  // Spinner UI
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="inline-block w-12 h-12 border-4 border-fuchsia-800 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-black dark:text-white text-lg text-center font-semibold mt-4">
          Loading related comixs...
        </span>
      </div>
    );
  }

  return (
    <div className="mt-4 order-3 md:order-none md:col-span-3 rounded-xl">
      {comicData.length === 0 ? (
        <p className="mt-4 text-sm text-center text-gray-500 dark:text-gray-400">
          {message}
        </p>
      ) : (
        <>
          <ScrollArea className="h-[500px] md:h-[700px] lg:h-[900px] pr-2 rounded-lg">
            <div className="grid gap-4 grid-cols-3 md:grid-cols-5 lg:grid-cols-7 justify-items-center">
              {pagedComics.map((comic) => (
                <a
                  key={comic.id_comix}
                  href={`/comic-page/${comic.id_comix}`}
                  className="group flex flex-col items-center w-full cursor-pointer select-none"
                >
                  {comic.dis_comix && (
                    <Image
                      src={comic.dis_comix}
                      alt={comic.name_comix}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover rounded-xl shadow-md transition-transform duration-300 ease-in-out group-hover:scale-105"
                      loading="lazy"
                      draggable={false}
                      data-action="zoom"
                    />
                  )}
                  <div className="mt-2 h-5 overflow-hidden relative max-w-[120px] w-full">
                    <span className="absolute w-full whitespace-nowrap text-sm text-black dark:text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span
                        className="scrolling-text w-full text-center"
                        style={{ display: 'inline-block', whiteSpace: 'nowrap' }}
                      >
                        {comic.name_comix}
                      </span>
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </ScrollArea>

          {totalPages > 1 && (
            <div className="mt-2 flex justify-center overflow-x-auto px-2 text-sm">
              <Pagination className="flex justify-center overflow-x-auto px-2 text-sm">
                <PaginationContent className="flex flex-wrap gap-2 items-center">
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageClick(Math.max(1, currentPage - 1))}
                    />
                  </PaginationItem>

                  <PaginationItem>
                    <PaginationLink
                      onClick={() => handlePageClick(1)}
                      isActive={currentPage === 1}
                      className="min-w-[32px] text-center"
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
                          className="min-w-[32px] text-center"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ) : null
                  )}

                  {currentPage < totalPages - 3 && <PaginationEllipsis />}

                  <PaginationItem>
                    <PaginationLink
                      onClick={() => handlePageClick(totalPages)}
                      isActive={currentPage === totalPages}
                      className="min-w-[32px] text-center"
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageClick(Math.min(totalPages, currentPage + 1))}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RelatedComicsWithPagination;
