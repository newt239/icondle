import { Button } from "@heroui/react";
import { createFileRoute } from "@tanstack/react-router";

const Home = () => (
  <main className="flex min-h-dvh flex-col items-center justify-center gap-4">
    <h1 className="text-4xl font-bold">Iconoclast</h1>
    <p className="text-neutral-500">このアイコン、どのセットのやつ？</p>
    <Button isDisabled>近日公開</Button>
  </main>
);

export const Route = createFileRoute("/")({
  component: Home,
});
