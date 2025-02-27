import styles from '../styles/ContactCode.module.css';

const contactItems = [
  {
    social: 'website',
    link: 'candagdeviren.com',
    href: 'https://candagdeviren.com',
  },
  {
    social: 'email',
    link: 'candagdevirenn@gmail.com',
    href: 'mailto:candagdevirenn@gmail.com',
  },
  {
    social: 'github',
    link: 'cndgdvrn',
    href: 'https://github.com/cndgdvrn',
  },
  {
    social: 'linkedin',
    link: 'candagdeviren',
    href: 'https://www.linkedin.com/in/can-da%C4%9Fdeviren-37b5b11a2/',
  }
];

const ContactCode = () => {
  return (
    <div className={styles.code}>
      <p className={styles.line}>
        <span className={styles.className}>.socials</span> &#123;
      </p>
      {contactItems.slice(0, 8).map((item, index) => (
        <p className={styles.line} key={index}>
          &nbsp;&nbsp;&nbsp;{item.social}:{' '}
          <a href={item.href} target="_blank" rel="noopener">
            {item.link}
          </a>
          ;
        </p>
      ))}
      {contactItems.slice(8, contactItems.length).map((item, index) => (
        <p className={styles.line} key={index}>
          &nbsp;&nbsp;{item.social}:{' '}
          <a href={item.href} target="_blank" rel="noopener">
            {item.link}
          </a>
          ;
        </p>
      ))}
      <p className={styles.line}>&#125;</p>
    </div>
  );
};

export default ContactCode;
