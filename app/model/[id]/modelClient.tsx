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
import modelData from '../models.json'; // Adjust path if needed
import TelegramPostViewer from './telegramPostViewer';

interface PageProps {
  modelId: number;  // expect a number here from the parent component
}

type BgImage = {
  image: string;
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

export default function ModelClient({ modelId }: PageProps) {
  const callModel = modelData.models.find(m => m.model_id === modelId);

  const [bgimage, setBgImage] = useState<BgImage[]>([]);
  const [error, setError] = useState<string>('');
  const [appName, setAppName] = useState('');
  const [headerOpacity, setHeaderOpacity] = useState(1);

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

  if (!callModel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <h1 className="text-2xl font-semibold text-red-600">Model with ID {modelId} not found.</h1>
      </div>
    );
  }

  const modelName = callModel.bio?.bio_name || "Model";
  const modelPic = callModel.bio?.bio_pic || "/images/default.jpg";
  const modelPic2 = callModel.bio?.bio_pic2 || "/images/default.jpg";
  const bio = callModel.bio || {};
  const media = callModel.media || [];

  const socialMediaLinks = [
    {
      key: 'media_telegram',
      label: 'Telegram',
      icon: <Send size={20} />,
      hoverClass: 'hover:text-blue-500',
    },
    {
      key: 'media_instagram',
      label: 'Instagram',
      icon: <Instagram size={20} />,
      hoverClass: 'hover:text-pink-600',
    },
    {
      key: 'media_facebook',
      label: 'Facebook',
      icon: <Facebook size={20} />,
      hoverClass: 'hover:text-blue-700',
    },
    {
      key: 'media_x',
      label: 'X (Twitter)',
      icon: <Twitter size={20} />,
      hoverClass: 'hover:text-sky-400',
    },
    {
      key: 'media_tiktok',
      label: 'TikTok',
      icon: <Music size={20} />,
      hoverClass: 'hover:text-purple-600',
    },
    {
      key: 'media_onlyfans',
      label: 'OnlyFans',
      icon: <Navigation size={20} />,
      hoverClass: 'hover:text-sky-300',
    },
    {
      key: 'media_official_website',
      label: 'Official Website',
      icon: <Webhook size={20} />,
      hoverClass: 'hover:text-rose-600',
    },
  ] as const;
  
  type MediaKey = typeof socialMediaLinks[number]['key'];

  const backgroundImage = bgimage.find((bg) => bg.image)?.image || '';

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
          {modelName}
        </h1>
      </div>

      <div className="z-1 mt-20 px-4 sm:px-6 md:px-8">
        <p className="mb-4 text-sm md:text-base text-white flex items-center gap-2">
          <span>Welcome and meet {modelName}.</span>
        </p>

        {error && <p className="text-red-500 mb-4">Error loading comics: {error}</p>}

        <div className="@container/main grid grid-cols-1 gap-4 px-4 lg:px-6 py-4 md:grid-cols-3 md:gap-6">
          {/* Model Info Section */}
          <section className="order-1 md:order-none bg-[rgba(255,255,255,0.85)] dark:bg-[rgba(0,0,0,0.85)] md:col-span-3 rounded-xl p-6 flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0 w-full md:w-auto">
              {modelPic ? (
                <Image
                  src={modelPic || modelPic2}
                  alt={modelName}
                  width={1000}
                  height={1000}
                  className="w-full max-w-full md:max-w-[320px] lg:max-w-[400px] h-auto rounded-3xl shadow-md"
                />
              ) : (
                <Image
                  src="/images/default.jpg"
                  alt="Default Model"
                  width={1000}
                  height={1000}
                  className="w-full max-w-full md:max-w-[320px] lg:max-w-[400px] h-auto rounded-3xl shadow-md"
                />
              )}
            </div>

            <div className="flex flex-col justify-start w-full max-w-full md:max-w-[600px] overflow-hidden">
              <label className="text-center md:text-start lg:text-start text-xl md:text-3xl font-semibold text-gray-900 dark:text-white mb-4">
                {modelName}
              </label>
              <ul className="text-sm text-gray-800 dark:text-gray-300 space-y-1 mb-4">
                <li><strong className='text-fuchsia-600'>Birthdate:</strong> {formatDateWithAge(bio.bio_birthdate)}</li>
                <li><strong className='text-fuchsia-600'>Zodiac Sign:</strong> {bio.bio_zodiac}</li>
                <li><strong className='text-fuchsia-600'>Sex:</strong> {bio.bio_sex || 'N/A'}</li>
                <li><strong className='text-fuchsia-600'>Height:</strong> {bio.bio_height_cm} cm</li>
                <li><strong className='text-fuchsia-600'>Weight:</strong> {bio.bio_weight_kg} kg</li>
                <li><strong className='text-fuchsia-600'>Nationality:</strong> {bio.bio_nationality}</li>
                <li><strong className='text-fuchsia-600'>Birthplace:</strong> {bio.bio_birthplace}</li>
                <li><strong className='text-fuchsia-600'>Profession:</strong> {bio.bio_profession}</li>
                <li><strong className='text-fuchsia-600'>Education:</strong> {bio.bio_education}</li>
                <li><strong className='text-fuchsia-600'>Eye Color:</strong> {bio.bio_eye_color}</li>
                <li><strong className='text-fuchsia-600'>Hair Color:</strong> {bio.bio_hair_color}</li>
                <li><strong className='text-fuchsia-600'>Languages:</strong> {bio.bio_languages?.join(', ') || "N/A"}</li>
              </ul>

              {/* Media Links */}
              <div className="flex space-x-4 justify-center items-center md:justify-start md:items-start  lg:justify-start lg:items-start mt-8 md:mt-auto lg:mt-auto">
                {socialMediaLinks.map(({ key, label, icon, hoverClass }) => {
                  // Tell TS this key is one of the keys in media
                  const url = media[key as MediaKey];
                  if (!url) return null;

                  return (
                    <Tooltip key={key}>
                      <TooltipTrigger asChild>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={label}
                          className={hoverClass}
                        >
                          {icon}
                        </a>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>{label}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Telegram Posts Viewer */}
          <div className="order-3 md:order-none bg-[rgba(255,255,255,0.85)] dark:bg-[rgba(0,0,0,0.85)] md:col-span-3 rounded-xl p-3">
            <TelegramPostViewer />
          </div>
        </div>
      </div>

      {/* Scroll to Top/Bottom Buttons */}
      <ScrollUpDown />
    </div>
  );
}
