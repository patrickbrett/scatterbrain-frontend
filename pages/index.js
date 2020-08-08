import Link from "next/link";
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <Link href="/host"><a href="/host">Host game</a></Link>
      <Link href="/host"><a href="/host">Join game</a></Link>
    </div>
  )
}
