import styles from "@/styles/card.module.css";

type CardProps = {
  title: string;
  url?: string;
  image?: string;
  description?: string;
};

export default function Card(props: CardProps) {
  const { title, url, image, description } = props;

  const source = url && extractSource(url);

  return (
    <a href={url} className={styles.card}>
      <div className={styles.imageBox} style={{ backgroundImage: `url(${image})` }}>
        <span className={styles.hostname}>{source}</span>
      </div>
      <div className={styles.textBox}>
        <strong>{title}</strong>
        <div className={styles.description}>{description}</div>
      </div>
    </a>
  );
}

function extractSource(url: string) {
  const { hostname, pathname } = new URL(url);
  if (hostname === "github.com") {
    return hostname + takePath(pathname, 3);
  } else {
    return hostname;
  }
}

function takePath(pathname: string, parts: number) {
  return Array.from(pathname.split("/")).slice(0, parts).join("/");
}
