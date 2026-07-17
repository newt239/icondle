import { IconChevronLeft } from "@heroui/react";
import { Link } from "@tanstack/react-router";

type BackToTopLinkProps = {
  className?: string;
};

export const BackToTopLink = ({ className = "" }: BackToTopLinkProps) => (
  <Link
    className={`text-muted flex items-center justify-center gap-1 text-sm underline underline-offset-2 ${className}`}
    to="/"
  >
    <IconChevronLeft />
    トップに戻る
  </Link>
);
