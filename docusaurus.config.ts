import { themes as prismThemes } from "prism-react-renderer"
import type { Config } from "@docusaurus/types"
import type * as Preset from "@docusaurus/preset-classic"

// GitHub Pages config — these must match the target repo.
const organizationName = "AlexHaid"
const projectName = "ts-book"

const config: Config = {
  title: "Глубокое погружение в TypeScript",
  tagline: "Книга по TypeScript на русском языке",
  favicon: "img/favicon.ico",

  // Site URL = https://<user>.github.io
  url: `https://${organizationName}.github.io`,
  // baseUrl = /<repo>/ for project sites
  baseUrl: `/${projectName}/`,

  organizationName,
  projectName,
  deploymentBranch: "gh-pages",
  trailingSlash: false,

  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",

  i18n: {
    defaultLocale: "ru",
    locales: ["ru"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          path: "docs",
          routeBasePath: "docs",
          sidebarPath: "./sidebars.ts",
          editUrl: `https://github.com/${organizationName}/${projectName}/edit/main/`,
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: "img/social-card.jpg",
    colorMode: {
      defaultMode: "dark",
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "TypeScript Book",
      logo: {
        alt: "TS Book Logo",
        src: "img/logo.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "bookSidebar",
          position: "left",
          label: "Книга",
        },
        {
          href: `https://github.com/${organizationName}/${projectName}`,
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Книга",
          items: [
            { label: "Вступление", to: "/docs/getting-started" },
            { label: "Почему TypeScript", to: "/docs/why-typescript" },
            { label: "Система типов", to: "/docs/types/" },
          ],
        },
        {
          title: "Ссылки",
          items: [
            {
              label: "GitHub",
              href: `https://github.com/${organizationName}/${projectName}`,
            },
            {
              label: "Источник",
              href: "https://github.com/xsltdev/scriptdev.ru",
            },
            {
              label: "TypeScript",
              href: "https://www.typescriptlang.org/",
            },
          ],
        },
      ],
      copyright: `Построено с Docusaurus. Контент адаптирован из <a href="https://github.com/xsltdev/scriptdev.ru" target="_blank" rel="noopener">scriptdev.ru</a>.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ["typescript", "tsx", "jsx", "bash", "json"],
    },
  } satisfies Preset.ThemeConfig,
}

export default config
