'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useTheme } from 'next-themes';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';

import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import telegramData from '../models.json';

const POSTS_PER_PAGE = 32;

function binaryToString(binary: string): string {
  let str = '';
  for (let i = 0; i < binary.length; i += 8) {
    str += String.fromCharCode(parseInt(binary.slice(i, i + 8), 2));
  }
  return str;
}

const TelegramPostViewer: React.FC = () => {
  const params = useParams();
  const modelId = params?.id as string;

  const model = telegramData.models?.find((m) => String(m.model_id) === modelId);
  const TELEGRAM_CHANNEL_BINARY = model?.channel?.binary || '0000';

  const [channelName, setChannelName] = useState('');
  const [maxPost, setMaxPost] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const topPaginationRef = useRef<HTMLDivElement>(null);

  // FIX: Detect theme only after hydration
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // now theme is available
  }, []);

  const isDark = theme === 'dark';
  const isDarkValue = isDark ? '1' : '0';

  useEffect(() => {
    const name = binaryToString(TELEGRAM_CHANNEL_BINARY);
    setChannelName(name);
  }, [TELEGRAM_CHANNEL_BINARY]);

  useEffect(() => {
    if (!channelName) return;
    setLoading(true);

    fetch(`/api/model/telegram/max-post?channel=${channelName}`)
      .then(async (res) => {
        if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
          const text = await res.text();
          throw new Error(`Unexpected response: ${res.status} ${text}`);
        }
        return res.json();
      })
      .then((data) => {
        setMaxPost(data.maxPost);
        setLoading(false);
        setCurrentPage(1);
      })
      .catch((err) => {
        console.error('Failed to load max post:', err);
        setMaxPost(0);
        setLoading(false);
      });
  }, [channelName]);

  const totalPages = Math.ceil(maxPost / POSTS_PER_PAGE);
  const startPost = maxPost - (currentPage - 1) * POSTS_PER_PAGE;
  const endPost = Math.max(1, startPost - POSTS_PER_PAGE + 1);

  const renderPosts = useCallback(() => {
    if (!mounted || !containerRef.current || maxPost === 0) return;

    containerRef.current.innerHTML = '';

    const width = window.innerWidth;
    const scale = width < 640 ? 0.8 : width < 1024 ? 0.9 : 1;

    for (let i = startPost; i >= endPost; i--) {
      const wrapper = document.createElement('div');
      wrapper.classList.add(
        'mb-[-25%]',
        'md:mb-[-10%]',
        'lg:mb-2',
        'w-full',
        'break-words',
        'relative',
        'bg-transparent'
      );
      wrapper.style.transformOrigin = 'top left';
      wrapper.style.transition = 'transform 0.3s ease';
      wrapper.style.transform = `scale(${scale})`;

      const overlay = document.createElement('div');
      overlay.classList.add(
        'absolute',
        'bg-transparent',
        'inset-0',
        'z-10',
        'cursor-zoom-in'
      );
      overlay.onclick = () => setSelectedPostId(`${channelName}/${i}`);
      wrapper.appendChild(overlay);

      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      script.setAttribute('data-telegram-post', `${channelName}/${i}`);
      script.setAttribute('data-width', '100%');
      script.setAttribute('data-dark', isDarkValue);
      script.setAttribute('data-color', 'F600FA');
      script.setAttribute('data-userpic', 'true');
      script.setAttribute('data-single', 'true');

      wrapper.appendChild(script);
      containerRef.current.appendChild(wrapper);
    }
  }, [channelName, maxPost, startPost, endPost, isDarkValue, mounted]);

  useEffect(() => {
    renderPosts();
  }, [renderPosts]);

  useEffect(() => {
    const onResize = () => renderPosts();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [renderPosts]);

  const onPageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
    topPaginationRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderPaginationItems = () => {
    const pages: (number | 'ellipsis')[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 4) pages.push('ellipsis');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 3) pages.push('ellipsis');
      pages.push(totalPages);
    }

    return pages.map((page, idx) =>
      page === 'ellipsis' ? (
        <PaginationEllipsis key={`ellipsis-${idx}`} className="text-black dark:text-white" />
      ) : (
        <PaginationItem
          key={`page-${page}`}
          aria-disabled={page === currentPage}
          className={
            page === currentPage
              ? 'text-black dark:text-white pointer-events-none opacity-50'
              : 'text-black dark:text-white cursor-pointer'
          }
          onClick={() => onPageChange(page)}
        >
          <PaginationLink isActive={page === currentPage}>{page}</PaginationLink>
        </PaginationItem>
      )
    );
  };

  // PREVENT white flash — wait until theme is actually known
  if (!mounted) return null;

  return (
    <div className="w-full px-4 sm:px-6 py-6 bg-transparent text-white">
      <h2 ref={topPaginationRef} className="text-black dark:text-white text-2xl text-center font-bold mt-10 mb-14">
        Latest Posts from{' '}
        <a
          href={`https://t.me/${channelName}`}
          className="text-fuchsia-600 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          @{channelName}
        </a>
      </h2>

      {loading ? (
        <div className="flex items-center justify-center mb-6">
          <div className="inline-block w-6 h-6 border-4 border-fuchsia-800 border-t-transparent rounded-full animate-spin mr-4"></div>
          <span className="text-black dark:text-white text-lg text-center font-semibold">
            Finding total posts...
          </span>
        </div>
      ) : (
        <p className="text-black dark:text-gray-400 text-center mb-6">
          Showing posts: <strong className="text-fuchsia-600">{endPost}</strong> –{' '}
          <strong className="text-fuchsia-600">{startPost}</strong> (Page {currentPage} of {totalPages})
        </p>
      )}

      <div>
        <Pagination className="mb-14 justify-center">
          <PaginationPrevious
            aria-disabled={currentPage === 1}
            className={currentPage === 1 ? 'text-black dark:text-white opacity-50' : 'text-black dark:text-white cursor-pointer'}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Previous
          </PaginationPrevious>

          <PaginationContent>{renderPaginationItems()}</PaginationContent>

          <PaginationNext
            aria-disabled={currentPage === totalPages}
            className={currentPage === totalPages ? 'text-black dark:text-white opacity-50' : 'text-black dark:text-white cursor-pointer'}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </PaginationNext>
        </Pagination>
      </div>

      <div
        ref={containerRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[300px] w-full max-w-full overflow-hidden"
      />

      <Pagination className="mt-8 justify-center">
        <PaginationPrevious
          aria-disabled={currentPage === 1}
          className={currentPage === 1 ? 'text-black dark:text-white opacity-50' : 'text-black dark:text-white cursor-pointer'}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </PaginationPrevious>

        <PaginationContent>{renderPaginationItems()}</PaginationContent>

        <PaginationNext
          aria-disabled={currentPage === totalPages}
          className={currentPage === totalPages ? 'text-black dark:text-white opacity-50' : 'text-black dark:text-white cursor-pointer'}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </PaginationNext>
      </Pagination>

      {selectedPostId && (
        <Dialog open={!!selectedPostId} onOpenChange={(open) => !open && setSelectedPostId(null)}>
          <DialogContent
            className="bg-transparent z-[9999] mt-1 scale-[1] md:mt-24 md:scale-[1.3] lg:mt-6 lg:scale-[1.1] w-[90vw] max-w-[1200px] h-[90vh] border-none overflow-y-auto rounded-xl p-6"
          >
            <VisuallyHidden>
              <DialogTitle>Telegram Post Preview</DialogTitle>
            </VisuallyHidden>

            <div className="bg-transparent pointer-events-none">
              <iframe
                src={`https://t.me/${selectedPostId}?embed=1&dark=${isDarkValue}&color=F600FA&single=true&width=200`}
                className="bg-transparent mt-6 w-full h-full"
                style={{ border: 'none' }}
                sandbox="allow-scripts allow-same-origin"
                loading="lazy"
                title="Telegram Post Preview"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TelegramPostViewer;

