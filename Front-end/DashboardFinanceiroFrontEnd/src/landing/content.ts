export const nav = {
  links: [
    { label: 'Recursos', href: '#recursos' },
    { label: 'Como funciona', href: '#como-funciona' },
    { label: 'Preços', href: '#precos' },
    { label: 'FAQ', href: '#faq' },
  ],
  loginLabel: 'Entrar',
  loginHref: '#/login',
  ctaLabel: 'Criar conta grátis',
  ctaHref: '#/cadastro',
}

export const hero = {
  badge: 'Painel financeiro + CRM em um só lugar',
  titleTop: 'Seu dinheiro, organizado.',
  titleAccent: 'Suas contas, em dia.',
  subtitle:
    'O Prisma junta receitas, despesas, orçamentos e metas em um painel escuro, rápido e direto ao ponto — sem planilhas soltas e sem burocracia.',
  primaryCta: 'Criar conta grátis',
  secondaryCta: 'Ver como funciona',
  trustLine: 'Grátis durante o MVP · Open source · Rode no Docker · Proteção de ponta a ponta',
  loginHref: '#/login',
  ctaHref: '#/cadastro',
}

export const statStrip = [
  { label: 'Módulos integrados', value: '6' },
  { label: 'Registrar um lançamento', value: '5 s' },
  { label: 'Modo claro', value: 'Nunca' },
  { label: 'Custos escondidos', value: 'Zero' },
]

export const features = {
  eyebrow: 'Recursos',
  kicker: 'Feito para quem quer entender o próprio dinheiro',
  headline: 'Tudo o que uma planilha não te dá, sem a dor de cabeça dela.',
  subtitle:
    'Em vez de uma grade de atalhos genérica, o Prisma entrega quatro módulos que respondem a pergunta que importa: para onde o meu dinheiro vai?',
  items: [
    {
      id: 'gastos',
      icon: 'chart',
      title: 'Entenda para onde seu dinheiro vai',
      description:
        'Cada despesa é classificada por categoria colorida. O painel transforma tudo em um donut de gastos e uma tabela de atividade recente — você vê o padrão em segundos, não em horas de reconciliação.',
      highlight: 'Gastos por categoria',
    },
    {
      id: 'orcamentos',
      icon: 'piggy',
      title: 'Defina limites e não estoure o orçamento',
      description:
        'Crie limites mensais por categoria e acompanhe barras de progresso em tempo real. Quando estiver próximo do teto, o alerta visual aparece antes do estrago no fim do mês.',
      highlight: 'Limites mensais por categoria',
    },
    {
      id: 'metas',
      icon: 'target',
      title: 'Transforme planos em metas com prazo',
      description:
        'Informe o valor alvo e quanto consegue guardar por mês. O Prisma calcula o progresso e a previsão de meses restantes — e celebra quando você alcança.',
      highlight: 'Progresso e previsão de prazo',
    },
    {
      id: 'contatos',
      icon: 'users',
      title: 'Clientes e contatos no mesmo lugar',
      description:
        'Leads, clientes, parceiros e fornecedores num CRM simples, com busca por nome, e-mail ou empresa — sem abrir outro sistema para lembrar quem está devendo.',
      highlight: 'CRM simples integrado ao financeiro',
    },
  ],
}

export const howItWorks = {
  eyebrow: 'Como funciona',
  kicker: 'Da primeira linha de lançamento ao painel completo em minutos',
  steps: [
    {
      title: 'Crie sua conta gratuita',
      description:
        'Cadastro com nome, e-mail e senha. Leva menos de um minuto e não pede cartão de crédito.',
    },
    {
      title: 'Registre receitas e despesas',
      description:
        'Cada lançamento tem valor em reais, data, descrição e categoria. Organizado por padrão, sem esforço extra.',
    },
    {
      title: 'Acompanhe tudo no painel',
      description:
        'Saldo atual, economia líquida, gastos por categoria e atividade recente aparecem já no primeiro acesso.',
    },
  ],
}

export const pricing = {
  eyebrow: 'Preços',
  kicker: 'Sem planilha de preços. Sem perícia em letras miúdas.',
  free: {
    name: 'Prisma',
    tagline: 'Tudo liberado durante o MVP',
    price: 'R$ 0',
    priceSuffix: 'para sempre, por enquanto',
    features: [
      'Dashboard com saldo, receitas e economia',
      'Transações ilimitadas com categorias coloridas',
      'Orçamentos mensais por categoria',
      'Metas com progresso e previsão de prazo',
      'CRM com clientes, leads e parceiros',
    ],
    cta: 'Criar conta grátis',
    href: '#/cadastro',
  },
  note: 'O Prisma está em desenvolvimento ativo. Se algo quebrar, contamos com você para nos avisar — e o acesso continua grátis.',
}

export const faq = {
  eyebrow: 'FAQ',
  kicker: 'Perguntas que quem cuida do próprio dinheiro costuma fazer',
  items: [
    {
      question: 'Meus dados financeiros ficam seguros?',
      answer:
        'Sim. Seus dados ficam protegidos de ponta a ponta: a comunicação entre o seu dispositivo e o Prisma é segura, e tudo o que você registra fica associado exclusivamente à sua conta, sem compartilhamento com terceiros.',
    },
    {
      question: 'Preciso usar cartão de crédito para começar?',
      answer:
        'Não. O Prisma é um projeto open source: o código é aberto e basta subir o Docker para usar o sistema na sua própria máquina. Pela plataforma, a conta é gratuita durante o MVP e não pedimos cartão em nenhum momento.',
    },
    {
      question: 'E se eu errar o valor de um lançamento?',
      answer:
        'Você pode corrigir ou excluir qualquer transação a qualquer momento. Nada aqui é permanente: as categorias também podem ser criadas, renomeadas e excluídas.',
    },
    {
      question: 'Preciso conectar ao meu banco?',
      answer:
        'Não. O Prisma não se conecta a contas bancárias. Você registra suas receitas e despesas manualmente — o que significa controle total sobre o que entra e o que sai.',
    },
    {
      question: 'Consigo usar no celular?',
      answer:
        'Sim. O painel é construído mobile-first e escala para telas grandes. O essencial — registrar lançamentos e checar o saldo — funciona bem no celular.',
    },
  ],
}

export const finalCta = {
  kicker: 'Comece hoje',
  headline: 'Pronto para colocar suas finanças em ordem?',
  subtitle:
    'Crie sua conta gratuita e veja seu primeiro mês organizado em menos de dez minutos.',
  cta: 'Criar conta grátis',
  href: '#/cadastro',
}

export const footer = {
  description:
    'Painel financeiro pessoal em modo escuro. Organize receitas, despesas, orçamentos, metas e contatos em um só lugar.',
  columns: [
    {
      title: 'Produto',
      links: [
        { label: 'Recursos', href: '#recursos' },
        { label: 'Como funciona', href: '#como-funciona' },
        { label: 'Preços', href: '#precos' },
        { label: 'FAQ', href: '#faq' },
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