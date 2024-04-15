import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mx-auto flex w-5/6 min-w-64 max-w-4xl justify-between pb-12 pt-8 font-mono">
      <Link
        className="text-gray-300 hover:text-white"
        href="https://github.com/chadluo/hnr4"
        target="_blank"
      >
        chadluo/hnr4
      </Link>
      <Link
        className="text-gray-300 hover:text-white"
        href="https://github.com/sponsors/chadluo"
        target="_blank"
      >
        sponsor
      </Link>
    </footer>
  );
}
