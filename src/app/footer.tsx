import Link from "next/link";
import * as React from 'react';

export default function Footer() {
  return (
    <footer className="mx-auto flex min-w-64 max-w-4xl justify-between px-4 pb-12 pt-8 font-mono">
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
