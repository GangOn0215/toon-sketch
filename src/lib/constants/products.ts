export const PRODUCTS: Record<string, any> = {
  // 크레딧 충전 상품
  "light": { id: "light", name: "크레딧 실속 패키지", amount: 330, price: 3300, description: "부담 없이 시작하는 소량 충전 패키지" },
  "plus":  { id: "plus", name: "크레딧 플러스 패키지", amount: 990, price: 9900, description: "합리적인 중간 충전 패키지", isPopular: true },
  "big":   { id: "big", name: "크레딧 대용량 패키지", amount: 2900, price: 29000, description: "넉넉하게 비축하는 대용량 충전 패키지" },
  
  // 구독 플랜 상품
  "mini":     { id: "mini", name: "Mini 멤버십 (월간)", price: 5500, description: "월 20장의 고화질 캐릭터 생성과 워터마크 제거" },
  "standard": { id: "standard", name: "Standard 멤버십 (월간)", price: 14900, description: "월 60장 생성 및 최근 7일 서버 보관 지원" },
  "pro":      { id: "pro", name: "Pro Pack 멤버십 (월간)", price: 29900, description: "월 150장, 2K 초고화질 및 영구 보관함 지원" },
  "premium":  { id: "premium", name: "Premium 멤버십 (월간)", price: 49900, description: "월 300장, 최고 해상도 및 1:1 기술 지원" },
};
