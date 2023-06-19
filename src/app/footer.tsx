import styles from "@/styles/footer.module.css";
import classNames from "classnames";
import { IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";

const mono = IBM_Plex_Mono({ weight: "400", subsets: ["latin"] });

export default function Footer() {
  return (
    <footer className={classNames(styles.footer, mono.className)}>
      <Link href="https://github.com/chadluo/hnr4">chadluo/hnr4</Link>
      <Link href="https://github.com/sponsors/chadluo">sponsor</Link>
    </footer>
  );
}