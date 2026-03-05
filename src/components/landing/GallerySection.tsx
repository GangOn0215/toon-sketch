"use client";

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

export function GallerySection() {
  return (
    <section id="gallery" style={{ padding: "120px 0", background: "var(--bg2)", overflow: "hidden" }}>
      <div className="container" style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
        <div style={{ marginBottom: "64px" }}>
          <span className="hero-tag reveal">Showcase</span>
          <h2 className="section-title reveal d1" style={{ fontSize: "36px", fontWeight: "700", marginTop: "16px" }}>수천 명의 작가가 선택한<br />캐릭터 디자인</h2>
        </div>
      </div>
      <Swiper modules={[Autoplay]} spaceBetween={24} slidesPerView={1.5} loop={true} autoplay={{ delay: 2500, disableOnInteraction: false }} 
        breakpoints={{ 640: { slidesPerView: 2.2 }, 1024: { slidesPerView: 3.5 }, 1440: { slidesPerView: 4.5 } }} style={{ padding: "20px 0" }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SwiperSlide key={i}>
            <div className="showcase-item" style={{ aspectRatio: "16/9", background: "var(--surface)", borderRadius: "24px", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", color: "var(--subtle)" }}>Gallery Image {i}</div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
