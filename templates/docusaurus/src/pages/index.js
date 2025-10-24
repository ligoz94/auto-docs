import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/developer/introduction">
            Get Started - Developers
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Welcome to ${siteConfig.title}`}
      description="Auto-generated documentation for multiple audiences">
      <HomepageHeader />
      <main>
        <section className={styles.features}>
          <div className="container">
            <div className="row">
              <div className="col col--4">
                <h3>👨‍💻 For Developers</h3>
                <p>
                  Technical documentation, API references, and implementation guides
                  generated directly from your codebase.
                </p>
                <Link to="/docs/developer/introduction">Developer Docs →</Link>
              </div>
              <div className="col col--4">
                <h3>📊 For Stakeholders</h3>
                <p>
                  High-level overviews, business metrics, and project status
                  tailored for decision makers.
                </p>
                <Link to="/docs/stakeholder/introduction">Business Docs →</Link>
              </div>
              <div className="col col--4">
                <h3>👥 For Users</h3>
                <p>
                  User-friendly guides, tutorials, and how-to articles
                  designed for end users.
                </p>
                <Link to="/docs/customer/introduction">User Docs →</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
