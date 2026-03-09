"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

import Image from 'next/image';
import dynamic from 'next/dynamic';

// Dynamic Import for Modal (Performance)
const ImageModal = dynamic(() => import("@/components/workspace/ImageModal").then(mod => mod.ImageModal), { ssr: false });

const SHOWCASE_IMAGES = [
  '/images/sample.png',
  '/images/sample1.png',
  '/images/sample2.png',
  '/images/sample3.png',
  '/images/sample1.png',
  '/images/sample2.png',
];

export function GallerySection() {
  const [mounted, setMounted] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <section id="gallery" style={{ padding: "120px 0", background: "var(--bg2)", overflow: "hidden" }}>
      <div className="container" style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
        <div style={{ marginBottom: "64px" }}>
          <span className={`hero-tag reveal ${mounted ? "show" : ""}`}>Showcase</span>
          <h2 className={`section-title reveal d1 ${mounted ? "show" : ""}`} style={{ fontSize: "36px", fontWeight: "700", marginTop: "16px" }}>수천 명의 작가가 선택한<br />캐릭터 디자인</h2>
        </div>
      </div>
      <Swiper 
        modules={[Autoplay]} 
        spaceBetween={30} 
        slidesPerView={2.5} 
        centeredSlides={true}
        loop={true} 
        speed={1200} // 전환 속도를 1.2초로 느리게 (더 부드러움)
        autoplay={{ 
          delay: 4500, // 다음 이미지까지 대기 시간을 4.5초로 연장
          disableOnInteraction: false 
        }} 
        breakpoints={{ 
          768: { slidesPerView: 3.5 }, 
          1024: { slidesPerView: 4.5 }, 
          1440: { slidesPerView: 5.5 } 
        }} 
        className="showcase-swiper"
      >
        {SHOWCASE_IMAGES.map((src, i) => (
          <SwiperSlide key={i}>
            {({ isActive }) => (
              <div 
                className="showcase-item" 
                onClick={() => isActive && setModalImage(src)} // 활성화된 슬라이드일 때만 모달 오픈
                style={{ 
                  aspectRatio: "16/9", 
                  background: "var(--surface)", 
                  borderRadius: "24px", 
                  border: "1.5px solid var(--border)", 
                  position: "relative", 
                  overflow: "hidden", 
                  cursor: isActive ? "zoom-in" : "default" // 활성화된 경우만 돋보기 커서 표시
                }}
              >
                <Image 
                  src={src} 
                  alt={`Showcase ${i + 1}`} 
                  fill 
                  style={{ objectFit: "cover" }}
                />
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      <ImageModal modalImage={modalImage} onClose={() => setModalImage(null)} plan="pro" />
    </section>
  );
}
