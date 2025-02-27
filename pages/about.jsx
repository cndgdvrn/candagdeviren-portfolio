import styles from '../styles/AboutPage.module.css';

const contactItems = [
  {
    tag: 'h1',
    title: 'Who am I?',
    content: 'I am a software developer with a passion for creating innovative solutions. I am currently pursuing a master\'s degree in computer science at the Eskisehir Technical University. I am always looking for new challenges and opportunities to grow as a developer'
  },
  {
    tag: 'h2',
    title: 'My Resume',
    content: 'I have a resume that you can see below. You can also download it by clicking the link below.',
  }
];

const AboutPage = () => {
  return (
    <div className={styles.code}>
      {contactItems.slice(0, contactItems.length).map((item, index) => (
        <div>
          <p className={styles.line} key={index}>
            &lt;{item.tag}&gt;{item.title}&lt;/{item.tag}&gt;
          </p>
          <p className={styles.line} key={index + 1}>
            &lt;p&gt;{item.content}&lt;/p&gt;
          </p>
        </div>
      ))}
      <div>
        <a className={styles.line} href='/can.dagdeviren.resume.pdf' target='_blank' rel='noopener'>
          &lt;a href="/resume.pdf" target="_blank" rel="noopener"&gt;Click here to see my resume&lt;/a&gt;
        </a>
      </div>
    </div>
  );
};

export async function getStaticProps() {
  return {
    props: { title: 'About' },
  };
}

export default AboutPage;