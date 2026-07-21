import { test as setup } from "@playwright/test";

setup(
  "dev サーバーの play と pick ルートを正常系で初回 SSR させ notFound 先行によるハングを防ぐ",
  async ({ request }) => {
    await request.get("/play/warmup/1");
    await request.get("/play/warmup/result?a=");
    await request.get("/hard/play/warmup/1");
    await request.get("/hard/play/warmup/result?a=");
    await request.get("/pick/warmup/1");
    await request.get("/pick/warmup/result?a=");
    await request.get("/hard/pick/warmup/1");
    await request.get("/hard/pick/warmup/result?a=");
  },
);
