export const nav = {
  links: [
    { label: 'Features', href: '#recursos' },
    { label: 'How it works', href: '#como-funciona' },
    { label: 'FAQ', href: '#faq' },
  ],
  loginLabel: 'Sign in',
  loginHref: '#/login',
  ctaLabel: 'Create free account',
  ctaHref: '#/cadastro',
}

export const hero = {
  badge: 'A simple, straightforward finance dashboard',
  titleTop: 'Your money, organized.',
  titleAccent: 'Your bills, on track.',
  subtitle:
    'Prisma brings income, expenses, and categories together in a fast, dark, to-the-point dashboard — no stray spreadsheets, no red tape.',
  primaryCta: 'Create free account',
  secondaryCta: 'See how it works',
  trustLine: 'Free during the MVP · Open source · Runs on Docker · End-to-end protection',
  loginHref: '#/login',
  ctaHref: '#/cadastro',
}

export const statStrip = [
  { label: 'Integrated modules', value: '3' },
  { label: 'Log an entry', value: '5 sec' },
  { label: 'Light mode', value: 'Never' },
  { label: 'Hidden fees', value: 'Zero' },
]

export const features = {
  eyebrow: 'Features',
  kicker: 'Built for people who want to understand their money',
  headline: 'Everything a spreadsheet cannot give you, without the headache.',
  subtitle:
    'Instead of a generic shortcut grid, Prisma ships three modules that answer the question that matters: where does my money go?',
  items: [
    {
      id: 'gastos',
      icon: 'chart',
      title: 'See where your money goes',
      description:
        'Each expense is sorted into a colorful category. The dashboard turns it all into a spending donut and a recent activity table — you spot the pattern in seconds, not hours of reconciliation.',
      highlight: 'Spending by category',
    },
    {
      id: 'categorias',
      icon: 'tags',
      title: 'Categories your way',
      description:
        'Create, color, and rename categories your way. Income and expenses stay separated automatically, each with its own color.',
      highlight: 'Colorful, editable categories',
    },
    {
      id: 'registro',
      icon: 'plus',
      title: 'Log in seconds',
      description:
        'Amount, description, date, and category. The dashboard updates the balance, the spending donut, and recent activity instantly.',
      highlight: 'Quick income and expense entries',
    },
  ],
}

export const howItWorks = {
  eyebrow: 'How it works',
  kicker: 'From your first entry to a full dashboard in minutes',
  steps: [
    {
      title: 'Create your free account',
      description:
        'Sign up with name, email, and password. It takes less than a minute and needs no credit card.',
    },
    {
      title: 'Log income and expenses',
      description:
        'Each entry has a BRL amount, date, description, and category. Organized by default, with no extra effort.',
    },
    {
      title: 'Track everything in the dashboard',
      description:
        'Current balance, net savings, spending by category, and recent activity show up on your first visit.',
    },
  ],
}

export const pricing = {
  eyebrow: 'Pricing',
  kicker: 'No pricing spreadsheet. No fine-print forensics.',
  free: {
    name: 'Prisma',
    tagline: 'Everything unlocked during the MVP',
    price: 'R$ 0',
    priceSuffix: 'forever, for now',
    features: [
      'Dashboard with balance, income, and savings',
      'Unlimited transactions with colorful categories',
      'Custom categories with your own colors',
    ],
    cta: 'Create free account',
    href: '#/cadastro',
  },
  note: 'Prisma is under active development. If something breaks, count on us to hear you out — and access stays free.',
}

export const faq = {
  eyebrow: 'FAQ',
  kicker: 'Questions people who manage their own money usually ask',
  items: [
    {
      question: 'Is my financial data safe?',
      answer:
        'Yes. Your data stays protected end to end: traffic between your device and Prisma is secure, and everything you log stays tied exclusively to your account, with no sharing with third parties.',
    },
    {
      question: 'Do I need a credit card to get started?',
      answer:
        'No. Prisma is an open source project: the code is open and you just run Docker to use the system on your own machine. On the platform, the account is free during the MVP and we never ask for a card.',
    },
    {
      question: 'What if I mistype an entry amount?',
      answer:
        'You can correct or delete any transaction at any time. Nothing here is permanent: categories can also be created, renamed, and deleted.',
    },
    {
      question: 'Do I need to connect my bank?',
      answer:
        'No. Prisma does not connect to bank accounts. You log your income and expenses manually — which means full control over what comes in and what goes out.',
    },
    {
      question: 'Can I use it on my phone?',
      answer:
        'Yes. The dashboard is built mobile-first and scales up to large screens. The essentials — logging entries and checking your balance — work well on a phone.',
    },
  ],
}

export const finalCta = {
  kicker: 'Start today',
  headline: 'Ready to get your finances in order?',
  subtitle:
    'Create your free account and see your first organized month in under ten minutes.',
  cta: 'Create free account',
  href: '#/cadastro',
}

export const footer = {
  description:
    'Personal finance dashboard in dark mode. Organize income, expenses, and categories in one place.',
  columns: [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '#recursos' },
        { label: 'How it works', href: '#como-funciona' },
        { label: 'FAQ', href: '#faq' },
      ],
    },
    {
      title: 'Account',
      links: [
        { label: 'Create free account', href: '#/cadastro' },
        { label: 'Sign in', href: '#/login' },
      ],
    },
  ],
  rights: 'Prisma © 2026. All rights reserved.',
}
