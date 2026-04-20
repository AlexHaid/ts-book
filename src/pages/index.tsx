import type { ReactNode } from "react"
import Link from "@docusaurus/Link"
import useDocusaurusContext from "@docusaurus/useDocusaurusContext"
import Layout from "@theme/Layout"
import styles from "./index.module.css"

function Hero(): ReactNode {
  return (
    <header className={styles.hero}>
      <div className={styles.heroInner}>
        <span className={styles.eyebrow}>TypeScript · Русский</span>
        <h1 className={styles.title}>Глубокое погружение в TypeScript</h1>
        <p className={styles.subtitle}>
          Бесплатная книга о TypeScript — от основ JavaScript до системы типов,
          дженериков и советов из реальной разработки.
        </p>
        <div className={styles.ctaRow}>
          <Link className={styles.ctaPrimary} to="/docs/">
            Читать книгу
          </Link>
          <Link className={styles.ctaSecondary} to="/docs/getting-started">
            С чего начать
          </Link>
        </div>
      </div>
    </header>
  )
}

type Section = {
  title: string
  description: string
  to: string
}

const sections: Section[] = [
  {
    title: "JavaScript",
    description:
      "Равенство, ссылки, null vs undefined, this, замыкания, числа и truthy.",
    to: "/docs/javascript/",
  },
  {
    title: "Будущее JavaScript",
    description:
      "Классы, стрелочные функции, деструктуризация, промисы, генераторы, async/await.",
    to: "/docs/future-javascript/",
  },
  {
    title: "Проекты",
    description:
      "Контекст компиляции, tsconfig.json, модули, пространства имён, динамические импорты.",
    to: "/docs/project/",
  },
  {
    title: "Система типов",
    description:
      "Интерфейсы, перечисления, дженерики, вывод типов, type guards, литеральные типы.",
    to: "/docs/types/",
  },
  {
    title: "JSX",
    description: "Работа с JSX в TypeScript — как в React, так и без него.",
    to: "/docs/jsx/",
  },
  {
    title: "Советы",
    description:
      "Паттерны, ловушки и практические приёмы: каррирование, синглтон, типизированные события.",
    to: "/docs/tips/",
  },
]

function SectionGrid(): ReactNode {
  return (
    <section className={styles.sectionsWrap}>
      <div className={styles.sectionsInner}>
        <h2 className={styles.sectionsTitle}>Что внутри</h2>
        <div className={styles.grid}>
          {sections.map((s) => (
            <Link key={s.to} to={s.to} className={styles.card}>
              <h3 className={styles.cardTitle}>{s.title}</h3>
              <p className={styles.cardDesc}>{s.description}</p>
              <span className={styles.cardArrow} aria-hidden>
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext()
  return (
    <Layout
      title={siteConfig.title}
      description="Бесплатная книга по TypeScript на русском языке."
    >
      <main>
        <Hero />
        <SectionGrid />
      </main>
    </Layout>
  )
}
