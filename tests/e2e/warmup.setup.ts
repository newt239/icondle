import { test as setup } from "@playwright/test";

setup(
  "dev サーバーの play ルートを正常系で初回 SSR させ notFound 先行によるハングを防ぐ",
  async ({ request }) => {
    await request.get("/play/warmup/1");
    await request.get("/play/warmup/result?a=");
  },
);
