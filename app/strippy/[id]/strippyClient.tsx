'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Instagram, Facebook, Twitter, Music, Navigation, Send, Webhook } from 'lucide-react'; 
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ScrollUpDown from '@/components/ui/scroll-up-down';
import strippyData from '../strippies.json'; // Adjust path if needed
import StrippyViewer from './strippyViewer';
import StrippyCoverFirstImage from './strippyCover';
import StrippyVPlayer from './strippyVPlayer';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface PageProps {
  strippyId: number;  // expect a number here from the parent component
}

type BgImage = {
  image: string;
};

type Strippy = {
  id_model_album: string;
  id_model: string;
  filename: string;
  cover_page?: string; // optional if your DB may not have it
};

type VideoItem = {
  title: string;
  url: string;
};

function formatDateWithAge(dateStr: string) {
  if (!dateStr) return '';

  const d = new Date(dateStr);
  const today = new Date();

  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleString('default', { month: 'long' });
  const year = d.getFullYear();

  // Age calculation
  let age = today.getFullYear() - d.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > d.getMonth() ||
    (today.getMonth() === d.getMonth() && today.getDate() >= d.getDate());

  if (!hasHadBirthdayThisYear) {
    age -= 1;
  }

  return `${day} ${month} ${year} (Age: ${age})`;
}

export default function StrippyClient({ strippyId }: PageProps) {
  const callStrippy = strippyData.strippies.find(s => s.strippy_id === strippyId);

  const [bgimage, setBgImage] = useState<BgImage[]>([]);
  const [error, setError] = useState<string>('');
  const [appName, setAppName] = useState('');
  const [headerOpacity, setHeaderOpacity] = useState(1);
  const [strippy, setStrippy] = useState<any>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<{ title: string }>({ title: '' });
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const albumsPerPage = 8;

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
    if (!strippyId) return;
  
    async function fetchStrippy() {
      setLoading(true);
      try {
        const res = await fetch(`/api/mysql-config/route_strippy?id=${strippyId}`);
        if (!res.ok) throw new Error('Failed to fetch strippy');
  
        const json = await res.json();
        setStrippy(json.data.length ? json.data : []);
      } catch (err: any) {
        setError(err.message);
        setStrippy([]);
      } finally {
        setLoading(false);
      }
    }
  
    fetchStrippy();
  }, [strippyId]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const fadeStart = 0;
      const fadeUntil = 100;
      const opacity = Math.max(0, 1 - scrollY / (fadeUntil - fadeStart));
      setHeaderOpacity(opacity);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!callStrippy) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <h1 className="text-2xl font-semibold text-red-600">Strippy with ID {strippyId} not found.</h1>
      </div>
    );
  }

  const strippyName = callStrippy.bio?.bio_name || "Strippy";
  const strippyPic = callStrippy.bio?.bio_pic || "/images/default.jpg";
  const strippyPic2 = callStrippy.bio?.bio_pic2 || "/images/default.jpg";
  const bio = callStrippy.bio || {};
  const media = callStrippy.media || [];
  const filePath = callStrippy.file?.file_path || "Not Available!";

  const socialMediaLinks = [
    { key: 'media_telegram', label: 'Telegram', icon: <Send size={20} />, hoverClass: 'hover:text-blue-500' },
    { key: 'media_instagram', label: 'Instagram', icon: <Instagram size={20} />, hoverClass: 'hover:text-pink-600' },
    { key: 'media_facebook', label: 'Facebook', icon: <Facebook size={20} />, hoverClass: 'hover:text-blue-700' },
    { key: 'media_x', label: 'X (Twitter)', icon: <Twitter size={20} />, hoverClass: 'hover:text-sky-400' },
    { key: 'media_tiktok', label: 'TikTok', icon: <Music size={20} />, hoverClass: 'hover:text-purple-600' },
    { key: 'media_onlyfans', label: 'OnlyFans', icon: <Navigation size={20} />, hoverClass: 'hover:text-sky-300' },
    { key: 'media_official_website', label: 'Official Website', icon: <Webhook size={20} />, hoverClass: 'hover:text-rose-600' },
  ] as const;
  
  type MediaKey = typeof socialMediaLinks[number]['key'];
  const backgroundImage = bgimage.find((bg) => bg.image)?.image || '';

  function cleanFilename(name: string) {
    return name
      .replace(/\.(cbz|zip)$/i, '') 
      .replace(/[\._-]/g, ' ')      
      .trim();                       
  }

  // Pagination helpers
  const totalPages = strippy?.length ? Math.ceil(strippy.length / albumsPerPage) : 1;
  const paginatedAlbums = strippy?.length
    ? strippy.slice((currentPage - 1) * albumsPerPage, currentPage * albumsPerPage)
    : [];

  function handlePageClick(page: number) {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  }

  // Pagination Component
  const PaginationComponent: React.FC<{ currentPage: number; totalPages: number; handlePageClick: (page: number) => void }> = ({ currentPage, totalPages, handlePageClick }) => {
    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === totalPages;

    return (
      <Pagination className="flex justify-center overflow-x-auto px-2 text-sm mt-4">
        <PaginationContent className="flex flex-wrap gap-2 items-center">
          <PaginationItem>
            <PaginationPrevious
              onClick={() => { if (!isFirstPage) handlePageClick(currentPage - 1); }}
              className={`cursor-pointer px-2 py-1 transition ${isFirstPage ? 'bg-black text-gray-500' : 'bg-black text-white'}`}
            />
          </PaginationItem>

          <PaginationItem>
            <PaginationLink
              onClick={() => handlePageClick(1)}
              className={`min-w-[32px] text-center cursor-pointer px-2 py-1 ${currentPage === 1 ? 'bg-white text-black font-bold' : 'bg-black text-white'}`}
            >1</PaginationLink>
          </PaginationItem>

          {currentPage > 4 && <PaginationEllipsis />}
          {[currentPage - 1, currentPage, currentPage + 1].map(page => 
            page > 1 && page < totalPages ? (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => handlePageClick(page)}
                  className={`min-w-[32px] text-center cursor-pointer px-2 py-1 ${page === currentPage ? 'bg-white text-black font-bold' : 'bg-black text-white'}`}
                >{page}</PaginationLink>
              </PaginationItem>
            ) : null
          )}
          {currentPage < totalPages - 3 && <PaginationEllipsis />}

          {totalPages > 1 && (
            <PaginationItem>
              <PaginationLink
                onClick={() => handlePageClick(totalPages)}
                className={`min-w-[32px] text-center cursor-pointer px-2 py-1 ${currentPage === totalPages ? 'bg-white text-black font-bold' : 'bg-black text-white'}`}
              >{totalPages}</PaginationLink>
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() => { if (!isLastPage) handlePageClick(currentPage + 1); }}
              className={`cursor-pointer px-2 py-1 transition ${isLastPage ? 'bg-black text-gray-500' : 'bg-black text-white'}`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

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
        style={{ background: 'linear-gradient(to bottom, black, transparent 100%)' }}
      >
        <h1 className="text-2xl md:text-3xl font-semibold text-white px-4 md:px-6 transition-opacity duration-300" style={{ opacity: headerOpacity }}>
          {strippyName}
        </h1>
      </div>

      <div className="z-1 mt-20 px-4 sm:px-6 md:px-8">
        <p className="mb-4 text-sm md:text-base text-white flex items-center gap-2">
          <span>Welcome and meet {strippyName}.</span>
        </p>

        {error && <p className="text-red-500 mb-4">Error loading strippies: {error}</p>}

        <div className="@container/main grid grid-cols-1 gap-4 px-4 lg:px-6 py-4 md:grid-cols-3 md:gap-6">
          {/* Strippy Info Section */}
          <section className="order-1 md:order-none bg-[rgba(255,255,255,0.85)] dark:bg-[rgba(0,0,0,0.85)] md:col-span-3 rounded-xl p-6 flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0 w-full md:w-auto">
              <Image
                src={strippyPic || strippyPic2}
                alt={strippyName}
                width={1000} height={1000}
                className="w-full max-w-full md:max-w-[320px] lg:max-w-[400px] h-auto rounded-3xl shadow-md"
              />
            </div>
            <div className="flex flex-col justify-start w-full max-w-full md:max-w-[600px] overflow-hidden">
              <label className="text-center md:text-start lg:text-start text-xl md:text-3xl font-semibold text-gray-900 dark:text-white mb-4">
                {strippyName}
              </label>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <ul className="text-sm text-gray-800 dark:text-gray-300 space-y-1 flex-1">
                  <li><strong className='text-fuchsia-600'>Birthdate:</strong> {formatDateWithAge(bio.bio_birthdate)}</li>
                  <li><strong className='text-fuchsia-600'>Birthplace:</strong> {bio.bio_birthplace || 'N/A'}</li>
                  <li><strong className='text-fuchsia-600'>Zodiac Sign:</strong> {bio.bio_zodiac || 'N/A'}</li>
                  <li><strong className='text-fuchsia-600'>Sex:</strong> {bio.bio_sex || 'N/A'}</li>
                  <li><strong className='text-fuchsia-600'>Sexuality:</strong> {bio.bio_sexuality || 'N/A'}</li>
                  <li><strong className='text-fuchsia-600'>Height:</strong> {bio.bio_height_cm || 0} cm</li>
                  <li><strong className='text-fuchsia-600'>Weight:</strong> {bio.bio_weight_kg || 0} kg</li>
                  <li><strong className='text-fuchsia-600'>Measurements:</strong> {bio.bio_measurements || 'N/A'}</li>
                  <li><strong className='text-fuchsia-600'>Body Type:</strong> {bio.bio_body_type || 'N/A'}</li>
                  <li><strong className='text-fuchsia-600'>Bra Cup Size:</strong> {bio.bio_bra_cup_size || 'N/A'}</li>
                  <li><strong className='text-fuchsia-600'>Boobs:</strong> {bio.bio_boobs || 'N/A'}</li>
                  <li><strong className='text-fuchsia-600'>Public Hair:</strong> {bio.bio_public_hair || 'N/A'}</li>
                  <li><strong className='text-fuchsia-600'>Piercings:</strong> {bio.bio_piercings || 'N/A'}</li>
                  <li><strong className='text-fuchsia-600'>Tattoos:</strong> {bio.bio_tattoos || 'N/A'}</li>
                  <li><strong className='text-fuchsia-600'>Nationality:</strong> {bio.bio_nationality || 'N/A'}</li>
                </ul>
                <ul className="text-sm text-gray-800 dark:text-gray-300 space-y-1 flex-1">
                  <li><strong className='text-fuchsia-600'>Profession:</strong> {bio.bio_profession || 'N/A'}</li>
                  <li><strong className='text-fuchsia-600'>Education:</strong> {bio.bio_education || 'N/A'}</li>
                  <li><strong className='text-fuchsia-600'>Eye Color:</strong> {bio.bio_eye_color || 'N/A'}</li>
                  <li><strong className='text-fuchsia-600'>Hair Color:</strong> {bio.bio_hair_color || 'N/A'}</li>
                  <li><strong className='text-fuchsia-600'>Languages:</strong> {bio.bio_languages?.join(', ') || "N/A"}</li>
                </ul>
              </div>

              {/* Media Links */}
              <div className="flex space-x-4 justify-center items-center md:justify-start md:items-start lg:justify-start lg:items-start mt-8 md:mt-auto lg:mt-auto">
                {socialMediaLinks.map(({ key, label, icon, hoverClass }) => {
                  const url = media[key as MediaKey];
                  if (!url) return null;
                  return (
                    <Tooltip key={key}>
                      <TooltipTrigger asChild>
                        <a href={url} target="_blank" rel="noopener noreferrer" aria-label={label} className={hoverClass}>{icon}</a>
                      </TooltipTrigger>
                      <TooltipContent side="top"><p>{label}</p></TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Favourite Albums Section with new Pagination */}
          <div className="order-2 md:order-none bg-[rgba(255,255,255,0.85)] dark:bg-[rgba(0,0,0,0.85)] md:col-span-3 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Favourite Albums</h2>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="inline-block w-12 h-12 border-4 border-fuchsia-800 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-black dark:text-white text-lg text-center font-semibold mt-4">
                  Loading favourite albums...
                </span>
              </div>
            ) : strippy?.length ? (
              <>
                {/* Pagination */}
                {totalPages > 1 && (
                  <PaginationComponent currentPage={currentPage} totalPages={totalPages} handlePageClick={handlePageClick} />
                )}

                <div className="mt-6 grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 justify-items-center auto-rows-fr">
                  {paginatedAlbums.map((page: Strippy) => (
                    <div
                      key={page.id_model_album}
                      className="group flex flex-col w-full min-w-[120px] bg-fuchsia-700 rounded-xl shadow-sm hover:shadow-lg transition-shadow"
                    >
                      <div
                        className="aspect-[3/4] w-full overflow-hidden rounded-t-xl bg-black cursor-pointer"
                        onClick={() => setSelectedAlbum({ title: page.filename })}
                      >
                        <StrippyCoverFirstImage strippyFolder={filePath} strippyTitle={page.filename} />
                      </div>
                      <div className="p-2 text-center">
                        <p className="text-sm font-bold text-white truncate" title={page.filename}>
                          {cleanFilename(page.filename)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-gray-500">No albums found.</p>
            )}
          </div>

          {/* Strippy Pages Viewer */}
          <div className="order-3 md:order-none bg-[rgba(255,255,255,0.85)] dark:bg-[rgba(0,0,0,0.85)] md:col-span-3 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Strippy&apos;s Page</h2>
            <div className='mt-4'>
              <StrippyViewer strippyFolder={filePath} strippyName={cleanFilename(selectedAlbum.title)} strippyTitle={selectedAlbum.title} />
            </div>
          </div>

          {/* Video Section (same theme as Favourite Albums) */}
            <div className="order-3 md:order-none bg-[rgba(255,255,255,0.85)] dark:bg-[rgba(0,0,0,0.85)] md:col-span-3 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Special Videos
              </h2>

              <StrippyVPlayer strippyFolder={filePath} loading={loading} />
            </div>
        </div>
      </div>

      {/* Scroll to Top/Bottom Buttons */}
      <ScrollUpDown />
    </div>
  );
}
