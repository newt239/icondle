import { createFileRoute, redirect } from "@tanstack/react-router";

const jstToday = (): string =>
  new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Tokyo",
    year: "numeric",
  }).format(new Date());

export const Route = createFileRoute("/daily/")({
  beforeLoad: () => {
    throw redirect({
      params: { date: jstToday(), n: "1" },
      statusCode: 302,
      to: "/daily/$date/$n",
    });
  },
});
