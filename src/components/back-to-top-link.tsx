import { IconChevronLeft } from "@heroui/react";
import { Link } from "@tanstack/react-router";

type BackToTopLinkProps = {
  className?: string;
  to?: "/" | "/hard";
};

export const BackToTopLink = ({ className = "", to = "/" }: BackToTopLinkProps) => (
  <Link
    className={`text-muted flex items-center justify-center gap-1 text-sm underline underline-offset-2 ${className}`}
    to={to}
  >
    <IconChevronLeft />
    トップに戻る
  </Link>
);
