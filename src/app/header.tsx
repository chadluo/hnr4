import Link from "next/link";

const title = "Hacker News Reader";

type Pages = "top" | "best";

export function Header({ activePage }: { activePage?: Pages }) {
  return (
    <header className="mx-auto flex w-5/6 min-w-64 max-w-4xl justify-between pb-12 pt-16 font-mono">
      <span>{title}</span>
      <span>
        <Link className={activePage === "top" ? "underline" : ""} href="/">
          Top
        </Link>
        {" "}
        <Link className={activePage === "best" ? "underline" : ""} href="/best">
          Best
        </Link>
      </span>
    </header>
  );
}
