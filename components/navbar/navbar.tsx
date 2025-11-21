"use client";

import * as React from "react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area"; // Adjust this path if needed

export function NavBar() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [comics, setComics] = React.useState<
    { id_comix: string; name_comix: string; dis_comix: string }[]
  >([]);
  const [error, setError] = React.useState<string | null>(null);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  // Fetch comics from the database API on mount
  React.useEffect(() => {
    fetch("/api/mysql-config/route_comicPage")
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to fetch comics");
        }
        return res.json();
      })
      .then((data) => setComics(data.data))
      .catch((err) => setError(err.message));
  }, []);

  // Handle outside click to close dropdown
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  // Filter comics
  const filteredComics = comics.filter((comic) =>
    comic.name_comix.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <nav className="relative bg-white dark:bg-black z-50">
      <div className="w-full lg:w-96 max-w-md relative mx-auto py-2" ref={wrapperRef}>
        <div className="relative">
          <input
            type="text"
            placeholder="Enter comix name..."
            className="w-full px-3 py-2 text-sm border rounded-full border-gray-300 focus:outline-none focus:ring-2 focus:ring-fuchsia-800 dark:bg-black dark:text-white dark:border-gray-600"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            aria-label="Search comixs"
            autoComplete="off"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setShowDropdown(false);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition cursor-pointer"
              title="Clear search"
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </div>

        {searchTerm && showDropdown && (
          <div
            className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white px-1 py-2 shadow-md dark:border-gray-700 dark:bg-black"
            style={{ top: "100%" }}
          >
            <ScrollArea className="h-[390px] w-full rounded-xl">
              {filteredComics.length > 0 ? (
                filteredComics.map(({ id_comix, name_comix, dis_comix }) => (
                  <a
                    key={id_comix}
                    href={`/comic-page/${id_comix}`}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-900 dark:text-white rounded-xl hover:bg-fuchsia-800 hover:text-white transition"
                  >
                    {dis_comix && (
                      <Image
                        src={dis_comix}
                        alt={name_comix}
                        className="w-12 h-16 object-cover rounded-md shadow-md flex-shrink-0"
                        width={48}
                        height={64}
                        loading="lazy"
                      />
                    )}
                    <span className="line-clamp-2">{name_comix}</span>
                  </a>
                ))
              ) : (
                <p className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No results found.
                </p>
              )}
              {error && (
                <p className="p-4 text-center text-sm text-red-500">Error: {error}</p>
              )}
            </ScrollArea>
          </div>
        )}
      </div>
    </nav>
  );
}
