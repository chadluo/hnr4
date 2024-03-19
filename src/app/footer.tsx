import classNames from "classnames";
import { IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";

const mono = IBM_Plex_Mono({ weight: "400", subsets: ["latin"] });

export default function Footer() {
  return (
    <footer
      className={classNames(
        mono.className,
        "mx-auto flex w-5/6 min-w-64 max-w-6xl justify-between pb-12 pt-8",
      )}
    >
      <Link
        className={classNames(classNames("text-gray-300", "hover:text-white"))}
        href="https://github.com/chadluo/hnr4"
      >
        chadluo/hnr4
      </Link>
      <Link
        className={classNames(classNames("text-gray-300", "hover:text-white"))}
        href="https://github.com/sponsors/chadluo"
      >
        sponsor
      </Link>
    </footer>
  );
}
