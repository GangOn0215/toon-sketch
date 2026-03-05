import type { Metadata } from "next";
import { Fraunces, Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
});

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto",
});

const notoSerifKR = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-noto-serif",
});

export const metadata: Metadata = {
  title: "툰 스케치 — 클릭으로 완성하는 웹툰 캐릭터 시트",
  description:
    "복잡한 프롬프트 없이 버튼 클릭 15초. 웹툰 캐릭터 전·측·후면 3면도를 AI가 자동으로 완성합니다.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${fraunces.variable} ${notoSansKR.variable} ${notoSerifKR.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
