"use client";

import { useState } from "react";
import Image from "next/image";
import { galleryImages, GalleryImage } from "@/data/gallery";
import { HiX, HiPlus } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";

export default function Gallery() {
  const [activeImage, setActiveImage] = useState<GalleryImage | null>(null);

  return (
    <section id="gallery" className="relative py-[90px] bg-[#F5FAFF] overflow-hidden border-b border-brand-primary/12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Title */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs tracking-[0.35em] text-brand-primary font-semibold">
              [07] PHOTO_TELEMETRY
            </span>
            <h2 className="font-display text-3xl font-black uppercase tracking-tight text-brand-text md:text-5xl">
              MEDIA RECON EXPO
            </h2>
          </div>
          <p className="max-w-md font-mono text-xs leading-relaxed text-brand-muted">
            Highlights from the previous Ageas Federal Life Insurance Mumbai Half Marathon editions. Hover to expand metadata logs.
          </p>
        </div>

        {/* Masonry Column Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 [column-fill:_balance] box-border w-full">
          {galleryImages.map((img) => (
            <div
              key={img.id}
              onClick={() => setActiveImage(img)}
              className="relative group mb-6 overflow-hidden border border-brand-primary/12 bg-white rounded-2xl shadow-sm cursor-pointer break-inside-avoid hover:shadow-md transition-shadow duration-300"
            >
              <div className="relative w-full aspect-[4/3] sm:aspect-auto overflow-hidden rounded-t-2xl">
                <img
                  src={img.url}
                  alt={img.title}
                  loading="lazy"
                  className="w-full object-cover grayscale brightness-95 contrast-110 group-hover:grayscale-0 group-hover:scale-105 group-hover:brightness-90 transition-all duration-500 ease-out"
                />
              </div>

              {/* Hover tags */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 rounded-2xl">
                <span className="font-mono text-[9px] text-brand-primary uppercase font-bold">// {img.category}</span>
                <h4 className="font-display text-sm font-bold text-white uppercase mt-0.5">{img.title}</h4>
                <div className="flex items-center justify-between text-[9px] font-mono text-white/50 border-t border-white/10 pt-2.5 mt-3">
                  <span>EXP: {img.year}</span>
                  <span className="flex items-center gap-1 text-brand-primary">VIEW DETECT <HiPlus /></span>
                </div>
              </div>

              {/* Static corner HUD tag (always visible) */}
              <div className="absolute top-3 left-3 font-mono text-[8px] text-brand-muted bg-white/80 px-1.5 py-0.5 backdrop-blur-sm border border-brand-primary/10 rounded select-none">
                {img.year} // {img.id.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
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
                className="absolute -top-12 right-0 flex items-center gap-1.5 font-mono text-[10px] text-brand-muted hover:text-brand-primary uppercase cursor-pointer"
              >
                CLOSE <HiX className="text-sm" />
              </button>

              {/* Main Expanded Image */}
              <div className="relative aspect-video w-full bg-brand-surface border border-brand-primary/12 rounded-xl overflow-hidden shadow-inner">
                <img
                  src={activeImage.url}
                  alt={activeImage.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Metadata Panel */}
              <div className="mt-5 border-t border-brand-primary/8 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
                <div className="flex flex-col">
                  <span className="text-[10px] text-brand-primary uppercase font-bold">// CLASSIFICATION: {activeImage.category}</span>
                  <h3 className="font-display text-lg font-bold text-brand-text uppercase mt-1">{activeImage.title}</h3>
                </div>
                <div className="flex gap-4 border-l border-brand-primary/8 pl-4 text-[10px] text-brand-muted">
                  <div className="flex flex-col">
                    <span>INDEX_YEAR</span>
                    <span className="text-brand-text font-bold">{activeImage.year}</span>
                  </div>
                  <div className="flex flex-col">
                    <span>RECORD_ID</span>
                    <span className="text-brand-text font-bold">{activeImage.id.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
