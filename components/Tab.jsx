import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import styles from '../styles/Tab.module.css';

const Tab = ({ icon, filename, path, onClose }) => {
  const router = useRouter();

  const handleClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose(path);
  };

  return (
    <Link href={path}>
      <div
        className={`${styles.tab} ${router.pathname === path && styles.active}`}
      >
        <Image src={icon} alt={filename} height={18} width={18} />
        <p>{filename}</p>
        <button
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="Close tab"
        >
          ×
        </button>
      </div>
    </Link>
  );
};

export default Tab;
