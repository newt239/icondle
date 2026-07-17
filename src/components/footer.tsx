import { Link } from "@tanstack/react-router";

export const Footer = () => (
  <footer className="border-border text-muted flex flex-col items-center gap-2 border-t px-4 py-6 text-sm">
    <div className="flex gap-4">
      <a
        className="underline underline-offset-2"
        href="https://github.com/newt239/icondle"
        rel="noreferrer"
        target="_blank"
      >
        GitHub
      </a>
      <a
        className="underline underline-offset-2"
        href="https://x.com/newt239"
        rel="noreferrer"
        target="_blank"
      >
        開発者
      </a>
      <Link className="underline underline-offset-2" to="/history">
        プレイ履歴
      </Link>
      <Link className="underline underline-offset-2" to="/privacy">
        プライバシーポリシー
      </Link>
    </div>
    <p>&copy; newt239</p>
  </footer>
);
