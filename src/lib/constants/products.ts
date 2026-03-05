export const PRODUCTS: Record<string, any> = {
  // 크레딧 충전 상품
  "light": { id: "light", name: "크레딧 실속 패키지", amount: 90, price: 3300, description: "소량의 캐릭터 생성을 위한 경제적인 패키지" },
  "plus":  { id: "plus", name: "크레딧 플러스 패키지", amount: 330, price: 9900, description: "가장 인기 있는 10% 추가 보너스 패키지", isPopular: true },
  "big":   { id: "big", name: "크레딧 대용량 패키지", amount: 1200, price: 29000, description: "전문 작가를 위한 30% 추가 보너스 패키지" },
  
  // 구독 플랜 상품
  "mini":     { id: "mini", name: "Mini 멤버십 (월간)", price: 5500, description: "월 20장의 고화질 캐릭터 생성과 워터마크 제거" },
  "standard": { id: "standard", name: "Standard 멤버십 (월간)", price: 14900, description: "월 60장 생성 및 최근 7일 서버 보관 지원" },
  "pro":      { id: "pro", name: "Pro Pack 멤버십 (월간)", price: 29900, description: "월 150장, 2K 초고화질 및 영구 보관함 지원" },
  "premium":  { id: "premium", name: "Premium 멤버십 (월간)", price: 49900, description: "월 300장, 최고 해상도 및 1:1 기술 지원" },
};
