"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { HiX, HiPlus, HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";

import { galleryImages as defaultGalleryImages } from "@/data/galleryImages";

export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  category: string;
  year: string;
}

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>(defaultGalleryImages);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeImage, setActiveImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchImages() {
      try {
        const res = await fetch("/api/gallery");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data) && data.length > 0) {
            setImages(data);
          }
        }
      } catch {
        // Fallback to static gallery data gracefully
        if (isMounted && images.length === 0) {
          setImages(defaultGalleryImages);
        }
      }
    }
    fetchImages();
    return () => {
      isMounted = false;
    };
  }, []);

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!activeImage) return;
    const currentIndex = images.findIndex((img) => img.id === activeImage.id);
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setActiveImage(images[prevIndex]);
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!activeImage) return;
    const currentIndex = images.findIndex((img) => img.id === activeImage.id);
    const nextIndex = (currentIndex + 1) % images.length;
    setActiveImage(images[nextIndex]);
  };

  useEffect(() => {
    if (!activeImage) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "Escape") {
        setActiveImage(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeImage, images]);

  return (
    <section id="gallery" className="relative py-[90px] bg-[#F5FAFF] overflow-hidden border-b border-brand-primary/12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Title */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs tracking-[0.35em] text-brand-primary font-semibold">
              PHOTO TELEMETRY
            </span>
            <h2 className="font-display text-3xl font-black uppercase tracking-tight text-default md:text-5xl">
              MEDIA RECON EXPO
            </h2>
          </div>
          <p className="max-w-md font-mono text-xs leading-relaxed text-muted-default">
            Highlights from the previous Ageas Federal Life Insurance Mumbai Half Marathon editions. Hover to expand metadata logs.
          </p>
        </div>

        {/* Masonry Column Grid */}
        {loading ? (
          <div className="text-center py-12 font-mono text-xs text-muted-default">
            LOADING MEDIA LOGS...
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12 font-mono text-sm text-muted-default border border-dashed border-brand-primary/12 rounded-2xl bg-white">
            No gallery images available.
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-4 gap-6 [column-fill:_balance] box-border w-full">
            {images.map((img) => (
              <div
                key={img.id}
                onClick={() => setActiveImage(img)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActiveImage(img);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label="View larger version"
                className="relative group mb-6 overflow-hidden border border-brand-primary/12 bg-white rounded-2xl shadow-sm cursor-pointer break-inside-avoid hover:shadow-[0_10px_25px_rgba(81,132,238,0.25)] hover:border-brand-primary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <div className="relative w-full overflow-hidden rounded-2xl">
                  <Image
                    src={img.url}
                    alt="Gallery image"
                    width={800}
                    height={600}
                    loading="lazy"
                    className="w-full h-auto object-cover group-hover:scale-105 transition-all duration-300 ease-out rounded-2xl"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal (AnimatePresence) */}
      <AnimatePresence>
        {activeImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
            onClick={() => setActiveImage(null)}
          >
            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative max-w-4xl w-full bg-white border border-brand-primary/12 p-4 md:p-6 shadow-2xl rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveImage(null)}
                className="absolute -top-12 right-0 flex items-center gap-1.5 font-mono text-[10px] text-muted-default hover:text-brand-primary uppercase cursor-pointer focus:outline-none"
              >
                CLOSE <HiX className="text-sm" />
              </button>

              {/* Main Expanded Image with navigation */}
              <div className="relative w-full max-h-[70vh] bg-brand-surface border border-brand-primary/12 rounded-xl overflow-hidden shadow-inner flex items-center justify-center min-h-[300px]">
                {/* Previous Button */}
                <button
                  onClick={handlePrev}
                  className="absolute left-4 bg-white/80 hover:bg-white text-default hover:text-brand-primary p-2 rounded-full border border-brand-primary/12 shadow transition-all duration-200 cursor-pointer z-10 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  aria-label="Previous image"
                >
                  <HiChevronLeft className="text-2xl" />
                </button>

                <Image
                  src={activeImage.url}
                  alt="Gallery image"
                  width={1200}
                  height={800}
                  className="w-full max-h-[70vh] object-contain"
                  priority
                />

                {/* Next Button */}
                <button
                  onClick={handleNext}
                  className="absolute right-4 bg-white/80 hover:bg-white text-default hover:text-brand-primary p-2 rounded-full border border-brand-primary/12 shadow transition-all duration-200 cursor-pointer z-10 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  aria-label="Next image"
                >
                  <HiChevronRight className="text-2xl" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

