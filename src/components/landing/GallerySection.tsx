"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import Image from "next/image";
import dynamic from "next/dynamic";

const ImageModal = dynamic(
  () => import("@/components/workspace/ImageModal").then((m) => m.ImageModal),
  { ssr: false }
);

const SHOWCASE_IMAGES = [
  "/images/sample.png",
  "/images/sample1.png",
  "/images/sample2.png",
  "/images/sample3.png",
  "/images/sample1.png",
  "/images/sample2.png",
  "/images/sample.png",
  "/images/sample1.png",
  "/images/sample2.png",
  "/images/sample3.png",
  "/images/sample1.png",
  "/images/sample2.png",
];

export function GallerySection() {
  const [mounted, setMounted] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const total = SHOWCASE_IMAGES.length;

  return (
    <section id="gallery" className="gs-section">

      {/* ── Header ── */}
      <div className="gs-header">
        <div className="gs-header-left reveal">
          <div className="gs-sys-tag">
            <span className="gs-sys-bracket">[</span>
            <span className="gs-sys-id">SYS</span>
            <span className="gs-sys-bracket">]</span>
            <span className="gs-sys-name">CHARACTER · ARCHIVE · GALLERY</span>
          </div>
          <h2 className="gs-title">
            수천 명의 작가가 선택한<br /><em>캐릭터 디자인</em>
          </h2>
        </div>

        {/* Live counter */}
        <div className="gs-counter reveal d2">
          <span className="gs-count-now">{String(activeIdx + 1).padStart(2, "0")}</span>
          <span className="gs-count-sep">/</span>
          <span className="gs-count-total">{String(total).padStart(2, "0")}</span>
        </div>
      </div>

      {/* ── Swiper ── */}
      <Swiper
        modules={[Autoplay]}
        spaceBetween={20}
        slidesPerView={1.1}
        centeredSlides
        loop
        speed={1200}
        autoplay={{ delay: 4500, disableOnInteraction: false }}
        onSlideChange={(s) => setActiveIdx(s.realIndex)}
        breakpoints={{
          768:  { slidesPerView: 1.8, spaceBetween: 32 },
          1024: { slidesPerView: 2.2, spaceBetween: 40 },
          1440: { slidesPerView: 2.5, spaceBetween: 40 },
        }}
        className="gs-swiper"
      >
        {SHOWCASE_IMAGES.map((src, i) => (
          <SwiperSlide key={i}>
            {({ isActive }) => (
              <div
                className={`gs-slide${isActive ? " active" : ""}`}
                onClick={() => isActive && setModalImage(src)}
              >
                <Image
                  src={src}
                  alt={`Showcase ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 55vw, 40vw"
                  style={{ objectFit: "cover" }}
                />

                {/* Faded index number */}
                <span className="gs-idx" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Active: bottom info bar */}
                {isActive && (
                  <div className="gs-info">
                    <span>CHARACTER SHEET</span>
                    <span>AI GENERATED · 클릭해서 확대</span>
                  </div>
                )}
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      <ImageModal modalImage={modalImage} onClose={() => setModalImage(null)} plan="pro" />
    </section>
  );
}
