export const nav = {
  links: [
    { label: 'Recursos', href: '#recursos' },
    { label: 'Como funciona', href: '#como-funciona' },
    { label: 'Perguntas frequentes', href: '#faq' },
  ],
  loginLabel: 'Entrar',
  loginHref: '#/login',
  ctaLabel: 'Criar conta grátis',
  ctaHref: '#/cadastro',
}

export const hero = {
  badge: 'Um painel financeiro simples e direto',
  titleTop: 'Seu dinheiro, organizado.',
  titleAccent: 'Suas contas, em dia.',
  subtitle:
    'O Prisma reúne receitas, despesas e categorias em um painel rápido, escuro e objetivo — sem planilhas soltas, sem burocracia.',
  primaryCta: 'Criar conta grátis',
  secondaryCta: 'Ver como funciona',
  trustLine: ['Grátis durante o MVP', 'Código aberto', 'Roda em Docker', 'Proteção ponta a ponta'],
  loginHref: '#/login',
  ctaHref: '#/cadastro',
}

export const statStrip = [
  { label: 'Módulos integrados', value: '3' },
  { label: 'Registrar lançamento', value: '5 seg' },
  { label: 'Plano gratuito', value: 'R$ 0' },
  { label: 'Taxas ocultas', value: 'Zero' },
]

export const features = {
  eyebrow: 'Recursos',
  kicker: 'Feito para quem quer entender seu dinheiro',
  headline: 'Tudo que uma planilha não te dá, sem dor de cabeça.',
  subtitle:
    'Em vez de uma grade genérica de atalhos, o Prisma entrega três módulos que respondem à pergunta que importa: para onde vai meu dinheiro?',
  items: [
    {
      id: 'gastos',
      icon: 'chart',
      title: 'Veja para onde vai seu dinheiro',
      description:
        'Cada despesa é organizada em uma categoria colorida. O painel transforma tudo em um gráfico de gastos e uma tabela de atividade recente — você percebe o padrão em segundos, não em horas de conciliação.',
      highlight: 'Gastos por categoria',
    },
    {
      id: 'categorias',
      icon: 'tags',
      title: 'Categorias do seu jeito',
      description:
        'Crie, colore e renomeie categorias do seu jeito. Receitas e despesas ficam separadas automaticamente, cada uma com sua cor.',
      highlight: 'Categorias coloridas e editáveis',
    },
    {
      id: 'registro',
      icon: 'plus',
      title: 'Registre em segundos',
      description:
        'Valor, descrição, data e categoria. O painel atualiza o saldo, o gráfico de gastos e a atividade recente na hora.',
      highlight: 'Lançamentos rápidos de receita e despesa',
    },
  ],
}

export const howItWorks = {
  eyebrow: 'Como funciona',
  kicker: 'Do primeiro lançamento a um painel completo em minutos',
  steps: [
    {
      title: 'Crie sua conta grátis',
      description:
        'Cadastre-se com nome, e-mail e senha. Leva menos de um minuto e não precisa de cartão de crédito.',
    },
    {
      title: 'Registre receitas e despesas',
      description:
        'Cada lançamento tem valor em reais, data, descrição e categoria. Organizado por padrão, sem esforço extra.',
    },
    {
      title: 'Acompanhe tudo no painel',
      description:
        'Saldo atual, histórico do saldo, gastos por categoria e transações recentes aparecem na sua primeira visita.',
    },
  ],
}

export const pricing = {
  eyebrow: 'Preços',
  kicker: 'Sem planilha de preços. Sem letrinhas miúdas.',
  free: {
    name: 'Prisma',
    tagline: 'Tudo liberado durante o MVP',
    price: 'R$ 0',
    priceSuffix: 'para sempre, por enquanto',
    features: [
      'Painel com saldo, receitas e gastos',
      'Transações ilimitadas com categorias coloridas',
      'Categorias personalizadas com suas cores',
    ],
    cta: 'Criar conta grátis',
    href: '#/cadastro',
  },
  note: 'O Prisma está em desenvolvimento ativo. Se algo quebrar, conte conosco para ouvir você — e o acesso continua grátis.',
}

export const faq = {
  eyebrow: 'Perguntas frequentes',
  kicker: 'Perguntas que quem cuida do próprio dinheiro costuma fazer',
  items: [
    {
      question: 'Meus dados financeiros estão seguros?',
      answer:
        'Sim. Seus dados ficam protegidos de ponta a ponta: o tráfego entre seu dispositivo e o Prisma é seguro, e tudo que você registra fica vinculado exclusivamente à sua conta, sem compartilhamento com terceiros.',
    },
    {
      question: 'Preciso de cartão de crédito para começar?',
      answer:
        'Não. O Prisma é um projeto de código aberto: o código é aberto e você só precisa rodar o Docker para usar o sistema na sua máquina. Na plataforma, a conta é gratuita durante o MVP e nunca pedimos cartão.',
    },
    {
      question: 'E se eu errar o valor de um lançamento?',
      answer:
        'Você pode corrigir ou excluir qualquer transação a qualquer momento. Nada aqui é permanente: categorias também podem ser criadas, renomeadas e excluídas.',
    },
    {
      question: 'Preciso conectar meu banco?',
      answer:
        'Não. O Prisma não se conecta a contas bancárias. Você registra suas receitas e despesas manualmente — o que significa controle total sobre o que entra e o que sai.',
    },
    {
      question: 'Posso usar no celular?',
      answer:
        'Sim. O painel é construído mobile-first e se adapta a telas grandes. O essencial — registrar lançamentos e consultar o saldo — funciona bem no celular.',
    },
  ],
}

export const finalCta = {
  kicker: 'Comece hoje',
  headline: 'Pronto para organizar suas finanças?',
  subtitle:
    'Crie sua conta grátis e veja seu primeiro mês organizado em menos de dez minutos.',
  cta: 'Criar conta grátis',
  href: '#/cadastro',
}

export const footer = {
  description:
    'Painel de finanças pessoais em modo escuro. Organize receitas, despesas e categorias em um só lugar.',
  columns: [
    {
      title: 'Produto',
      links: [
        { label: 'Recursos', href: '#recursos' },
        { label: 'Como funciona', href: '#como-funciona' },
        { label: 'Perguntas frequentes', href: '#faq' },
      ],
    },
    {
      title: 'Conta',
      links: [
        { label: 'Criar conta grátis', href: '#/cadastro' },
        { label: 'Entrar', href: '#/login' },
      ],
    },
  ],
  rights: 'Prisma © 2026. Todos os direitos reservados.',
}
