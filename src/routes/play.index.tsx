import { createFileRoute, redirect } from "@tanstack/react-router";

const generateSeed = (): string => {
  const bytes = new Uint8Array(3);
  crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
};

export const Route = createFileRoute("/play/")({
  beforeLoad: () => {
    throw redirect({
      params: { n: "1", seed: generateSeed() },
      statusCode: 302,
      to: "/play/$seed/$n",
    });
  },
});
