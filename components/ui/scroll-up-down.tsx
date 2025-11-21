'use client';

import { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScrollUpDown() {
  const [scrollY, setScrollY] = useState(0);
  const [docHeight, setDocHeight] = useState(0);

  useEffect(() => {
    const updateDimensions = () => {
      setDocHeight(document.documentElement.scrollHeight);
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
      updateDimensions();
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', updateDimensions);

    updateDimensions();
    setScrollY(window.scrollY);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: docHeight, behavior: 'smooth' });
  };

  const atTop = scrollY === 0;

  const baseBtnClasses = `px-5 py-5 rounded-md
    bg-black text-white hover:bg-gray-700
    dark:bg-white dark:text-black dark:hover:bg-gray-300`;

  const variants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence mode="wait">
        {atTop ? (
          <motion.div
            key="down"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.3 }}
          >
            <Button
              onClick={scrollToBottom}
              size="icon"
              className={`${baseBtnClasses} cursor-pointer`}
              title="Scroll to Bottom"
              aria-label="Scroll to bottom"
            >
              <ArrowDown className="h-7 w-7" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="up"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.3 }}
          >
            <Button
              onClick={scrollToTop}
              size="icon"
              className={`${baseBtnClasses} cursor-pointer`}
              title="Scroll to Top"
              aria-label="Scroll to top"
            >
              <ArrowUp className="h-7 w-7" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
