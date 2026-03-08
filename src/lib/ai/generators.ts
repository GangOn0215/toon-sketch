import { fal } from "@fal-ai/client";

export interface GenerateOptions {
  prompt: string;
  width: number;
  height: number;
  seed: number;
  referenceImage?: string; // 캐릭터 일관성을 위한 레퍼런스 이미지 URL
}

export interface GenerateResult {
  buffer: Buffer;
  metadata: {
    inferenceTime: number;
    cost?: number;
  };
}

export interface ImageGenerator {
  generate(options: GenerateOptions): Promise<GenerateResult>;
}

/**
 * Fal.ai Generator Implementation (Using Nano Banana 2)
 */
export class FalGenerator implements ImageGenerator {
  constructor(private apiKey: string) {
    fal.config({ credentials: apiKey });
  }

  async generate(options: GenerateOptions, retries = 3): Promise<GenerateResult> {
    const { prompt, width, height, seed, referenceImage } = options;
    
    // 사용자가 선호하는 Nano Banana 2 모델로 원복
    const input: any = { 
      prompt, 
      seed, 
      width, 
      height, 
      num_inference_steps: 28, // 기존 퀄리티 유지를 위해 28단계 사용
    };

    if (referenceImage) {
      input.image_urls = [referenceImage];
    }

    let attempt = 0;
    let result: any = null;

    while (attempt < retries) {
      try {
        result = await fal.run("fal-ai/nano-banana-2", { input });
        break;
      } catch (error: any) {
        attempt++;
        const isRateLimit = error.message?.includes("Too Many Requests") || error.message?.includes("429") || error.status === 429;
        
        if (isRateLimit && attempt < retries) {
          const delay = attempt * 1500;
          console.warn(`[Fal.ai] ⚠️ 대기열 초과. ${delay}ms 후 재시도... (${attempt}/${retries})`);
          await new Promise(res => setTimeout(res, delay));
        } else {
          throw error;
        }
      }
    }
    
    const url = result?.data?.images?.[0]?.url ?? result?.images?.[0]?.url ?? "";
    if (!url) throw new Error("Fal.ai 이미지 URL 생성 실패");

    const inferenceTime = (result as any)?.timings?.inference ?? 0;
    const estimatedCost = 0.001; 

    const res = await fetch(url);
    if (!res.ok) throw new Error("Fal.ai 이미지 다운로드 실패");
    
    return {
      buffer: Buffer.from(await res.arrayBuffer()),
      metadata: {
        inferenceTime,
        cost: estimatedCost
      }
    };
  }
}

/**
 * Factory function to get the Fal.ai generator
 */
export function getGenerator(): ImageGenerator {
  if (process.env.FAL_KEY) {
    return new FalGenerator(process.env.FAL_KEY);
  }
  
  throw new Error("FAL_KEY가 설정되지 않았습니다.");
}
