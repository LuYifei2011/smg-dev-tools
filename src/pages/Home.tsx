import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import BuildStatus from '../components/BuildStatus'

interface ToolCard {
  key: string
  href: string
  external?: boolean
}

export default function Home() {
  const { t } = useTranslation()

  const tools: ToolCard[] = [
    { key: 'editor', href: '/__dev/editor' },
    { key: 'covers', href: '/__dev/covers/', external: true },
    { key: 'buildIssues', href: '/zh-cn/issues/', external: true },
  ]

  return (
    <div className="page-home">
      <Header />
      <main className="home-main">
        <section className="home-hero">
          <h1 className="home-title">{t('devTools')}</h1>
          <p className="home-subtitle">{t('buildAndDebug')}</p>
          <BuildStatus />
        </section>

        <section className="home-tools">
          {tools.map((tool) => (
            tool.external ? (
              <a
                key={tool.key}
                href={tool.href}
                className="tool-card"
              >
                <h2 className="tool-card-name">{t(`tools.${tool.key}.name`)}</h2>
                <p className="tool-card-desc">{t(`tools.${tool.key}.desc`)}</p>
              </a>
            ) : (
              <Link key={tool.key} to={tool.href.replace('/__dev', '')} className="tool-card">
                <h2 className="tool-card-name">{t(`tools.${tool.key}.name`)}</h2>
                <p className="tool-card-desc">{t(`tools.${tool.key}.desc`)}</p>
              </Link>
            )
          ))}
        </section>
      </main>
      <footer className="site-footer">
        <span>{t('footer')}</span>
        <a
          href="https://github.com/Scratch-Modules-Gallery"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          GitHub
        </a>
      </footer>
    </div>
  )
}
