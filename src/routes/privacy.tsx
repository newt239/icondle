import { createFileRoute, Link } from "@tanstack/react-router";

import { BackToTopLink } from "#/components/back-to-top-link";
import { Footer } from "#/components/footer";
import { createPageHeadObject } from "#/lib/meta";

const Privacy = () => (
  <>
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-1 flex-col gap-6 px-4 pt-8 pb-6">
      <header className="flex items-center justify-between gap-4">
        <Link className="text-xl font-bold" to="/">
          Icondle
        </Link>
      </header>
      <h1 className="text-2xl font-bold">プライバシーポリシー</h1>
      <section className="flex flex-col gap-2">
        <h2 className="font-bold">収集する情報</h2>
        <p className="text-muted text-sm">
          本サービスは、アクセス解析のためにGoogle Analyticsを利用しています。Google
          AnalyticsはCookieを使用して、アクセスログや閲覧ページ、利用端末等の情報を収集します。この情報には個人を特定する情報は含まれません。
        </p>
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="font-bold">利用目的</h2>
        <p className="text-muted text-sm">
          収集した情報は、本サービスの利用状況の把握と、機能改善のための分析にのみ使用します。
        </p>
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="font-bold">第三者提供について</h2>
        <p className="text-muted text-sm">
          Google
          Analyticsにより収集された情報は、Google社のプライバシーポリシーに基づいてGoogle社に送信・管理されます。詳細は
          <a
            className="underline underline-offset-2"
            href="https://policies.google.com/privacy"
            rel="noreferrer"
            target="_blank"
          >
            Googleのプライバシーポリシー
          </a>
          をご確認ください。
        </p>
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="font-bold">Cookieの無効化について</h2>
        <p className="text-muted text-sm">
          Cookieの使用を望まない場合は、ブラウザの設定でCookieを無効化するか、
          <a
            className="underline underline-offset-2"
            href="https://tools.google.com/dlpage/gaoptout"
            rel="noreferrer"
            target="_blank"
          >
            Googleアナリティクス オプトアウト アドオン
          </a>
          をご利用ください。
        </p>
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="font-bold">お問い合わせ</h2>
        <p className="text-muted text-sm">
          本ポリシーに関するお問い合わせは、開発者のXアカウント(
          <a
            className="underline underline-offset-2"
            href="https://x.com/newt239"
            rel="noreferrer"
            target="_blank"
          >
            @newt239
          </a>
          )までお願いします。
        </p>
      </section>
      <p className="text-muted text-xs">制定日: 2026年7月21日</p>
      <BackToTopLink />
    </main>
    <Footer />
  </>
);

export const Route = createFileRoute("/privacy")({
  component: Privacy,
  head: () =>
    createPageHeadObject({
      description:
        "IcondleにおけるGoogle Analyticsの利用目的や第三者提供についてのプライバシーポリシーです。",
      path: "/privacy",
      title: "プライバシーポリシー",
    }),
});
