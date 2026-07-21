import { Link } from "@tanstack/react-router";

export const Footer = () => (
  <footer className="border-border text-muted grid grid-cols-1 gap-6 border-t px-4 py-6 text-sm sm:grid-cols-3 sm:gap-8">
    <nav className="flex flex-col items-start gap-2">
      <Link className="underline underline-offset-2" to="/hard">
        Hardモード
      </Link>
      <Link className="underline underline-offset-2" to="/sets">
        収録アイコンセット
      </Link>
      <Link className="underline underline-offset-2" to="/history">
        プレイ履歴
      </Link>
      <Link className="underline underline-offset-2" to="/changelog">
        更新履歴
      </Link>
    </nav>
    <nav className="flex flex-col items-start gap-2">
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
      <Link className="underline underline-offset-2" to="/privacy">
        プライバシーポリシー
      </Link>
    </nav>
    <div className="flex flex-col items-start gap-2">
      <p>&copy; newt239</p>
    </div>
  </footer>
);
