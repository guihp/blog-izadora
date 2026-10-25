/**
 * ✿ CONTEÚDO DEMONSTRATIVO
 * Estes textos existem apenas para mostrar como o site fica preenchido.
 * Eles aparecem marcados como "Exemplo" e podem ser importados para o
 * Supabase (e depois removidos) pelo painel administrativo.
 */
import type { Category, Devotional, Post, Video } from "@/lib/types";

export const demoCategories: Category[] = [
  { id: "cat-fe", slug: "fe-na-vida-real", name: "Fé na vida real", description: "Uma fé que atravessa a rotina, o cansaço e as perguntas sinceras.", sort_order: 1 },
  { id: "cat-devocionais", slug: "devocionais", name: "Devocionais", description: "Pausas com a Palavra para começar ou terminar o dia aos pés de Jesus.", sort_order: 2 },
  { id: "cat-proposito", slug: "proposito-e-chamado", name: "Propósito e chamado", description: "Sobre vocação, legado e obedecer a Deus nos pequenos passos.", sort_order: 3 },
  { id: "cat-identidade", slug: "identidade-em-cristo", name: "Identidade em Cristo", description: "Quem somos à luz do que Ele diz, e não do que o mundo exige.", sort_order: 4 },
  { id: "cat-maturidade", slug: "maturidade-espiritual", name: "Maturidade espiritual", description: "Crescer, aprender a discernir e amadurecer na fé com paciência.", sort_order: 5 },
  { id: "cat-secreto", slug: "vida-no-secreto", name: "Vida no secreto", description: "Oração, intimidade e aquilo que Deus constrói longe dos olhos.", sort_order: 6 },
  { id: "cat-processos", slug: "processos-e-testemunhos", name: "Processos e testemunhos", description: "Histórias reais de espera, dor, cura e fidelidade de Deus.", sort_order: 7 },
  { id: "cat-estilo", slug: "estilo-de-vida-cristao", name: "Estilo de vida cristão", description: "Escolhas, hábitos e beleza de uma vida que aponta para Ele.", sort_order: 8 },
];

type DemoPostInput = Omit<Post, "status" | "is_demo" | "seo_title" | "seo_description" | "updated_at" | "category">;

const posts: DemoPostInput[] = [
  {
    id: "demo-post-1",
    slug: "como-nao-deixar-o-devocional-se-tornar-automatico",
    title: "Como não deixar o devocional se tornar automático",
    excerpt:
      "Quando o tempo com Deus vira só mais um item da lista, algo se perde. Algumas reflexões para voltar ao encontro, e não apenas ao hábito.",
    cover_url: "/images/capa-devocional-automatico.jpg",
    cover_alt: "Mãos escrevendo em um caderno ao lado de uma xícara de café, vistos de cima",
    category_id: "cat-devocionais",
    published_at: "2026-10-14T09:00:00-03:00",
    content: `Existe uma diferença silenciosa entre *ter um devocional* e *ter um encontro*. Eu demorei para perceber isso. Por muito tempo, o meu momento com Deus era impecável na agenda: Bíblia aberta, marca-texto na mão, um versículo copiado no caderno. E, mesmo assim, havia dias em que eu fechava tudo sem lembrar o que tinha lido.

## Quando a disciplina vira distância

A disciplina é um presente. Ela nos sustenta quando as emoções oscilam. Mas a disciplina sem coração pode se transformar em um ritual vazio — e Jesus foi bem claro sobre isso quando citou Isaías:

::: versiculo Mateus 15:8
Este povo se aproxima de mim com a sua boca e me honra com os seus lábios, mas o seu coração está longe de mim.
:::

O problema nunca foi a rotina. O problema é quando a rotina toma o lugar da Pessoa.

## Três pequenas mudanças que me ajudaram

### 1. Começar pedindo, e não lendo

Antes de abrir a Bíblia, eu faço uma oração curtinha, como a do salmista em Salmos 119:18: “Desvenda os meus olhos, para que eu veja as maravilhas da tua lei”. Isso me lembra de que eu não estou estudando um livro qualquer, mas ouvindo uma voz.

### 2. Ler menos, demorar mais

Às vezes, um único versículo bem meditado faz mais por mim do que três capítulos lidos com pressa. Releia. Pergunte: *o que isso revela sobre Deus? O que revela sobre mim?*

### 3. Responder ao que foi lido

Um devocional não termina quando a leitura acaba. Ele continua na oração, na obediência e na conversa ao longo do dia. Escreva uma frase de resposta: um agradecimento, uma confissão, um pedido.

## Um convite gentil

Se o seu devocional está automático, não se culpe — volte. Deus não está esperando uma performance perfeita, mas um coração presente. Ele mesmo diz em Tiago 4:8: “Chegai-vos a Deus, e ele se chegará a vós”.`,
  },
  {
    id: "demo-post-2",
    slug: "as-dificuldades-de-construir-seu-legado-e-viver-o-seu-chamado",
    title: "As dificuldades de construir seu legado e viver o seu chamado",
    excerpt:
      "Chamado nem sempre se parece com palco. Muitas vezes, ele começa escondido, lento e cheio de renúncias que ninguém aplaude.",
    cover_url: "/images/capa-legado-chamado.jpg",
    cover_alt: "Carta escrita à mão com uma caneta-tinteiro apoiada sobre o papel",
    category_id: "cat-proposito",
    published_at: "2026-10-07T09:00:00-03:00",
    content: `Falamos muito sobre propósito, mas pouco sobre o *custo* de vivê-lo. Construir um legado que honra a Deus exige paciência com processos longos, coragem para dizer “não” e humildade para servir onde ninguém está olhando.

## O chamado começa no pequeno

Davi foi ungido rei e voltou para o campo cuidar de ovelhas. José recebeu sonhos e, antes do palácio, passou pela cisterna e pela prisão. A Bíblia nos mostra que Deus forma o caráter antes de ampliar o alcance.

::: versiculo Lucas 16:10
Quem é fiel no mínimo, também é fiel no muito.
:::

## As dificuldades que ninguém conta

- **A comparação:** olhar para o caminho de outra pessoa e achar que o seu está atrasado.
- **A solidão:** algumas fases do chamado são vividas com poucas testemunhas.
- **As renúncias:** dizer sim a Deus muitas vezes significa dizer não a coisas boas.

## Legado é constância

Legado não é um grande momento, mas uma vida inteira de pequenas obediências. Paulo, no fim da sua caminhada, não falou sobre conquistas, e sim sobre fidelidade: “Combati o bom combate, acabei a carreira, guardei a fé” (2 Timóteo 4:7).

Que a gente não desista no meio do processo. O que Deus está construindo em você é mais profundo do que aquilo que já dá para ver.`,
  },
  {
    id: "demo-post-3",
    slug: "por-que-como-crista-nao-acredito-na-lei-da-atracao",
    title: "Por que, como cristã, não acredito na lei da atração",
    excerpt:
      "“Mentalize e o universo te entrega.” Parece inofensivo, mas coloca você no centro de tudo. A fé cristã aponta para outro lugar.",
    cover_url: "/images/capa-lei-da-atracao.jpg",
    cover_alt: "Céu ao entardecer em tons suaves de rosa e lilás",
    category_id: "cat-identidade",
    published_at: "2026-09-30T09:00:00-03:00",
    content: `A ideia de que nossos pensamentos atraem a realidade que desejamos está em todo lugar: em livros, vídeos e frases bonitas nas redes sociais. Eu entendo o apelo. Ela promete controle num mundo que nos assusta. Mas, quando coloco essa ideia diante da Palavra, percebo que ela muda o centro de tudo.

## Quem está no centro?

Na lei da atração, *eu* sou a fonte do poder, e o universo é um sistema que me obedece. No evangelho, Deus é soberano, pessoal e bom — e eu sou alguém que confia, se rende e ora.

::: versiculo Provérbios 16:9
O coração do homem planeja o seu caminho, mas o Senhor lhe dirige os passos.
:::

## Fé não é pensamento positivo

A fé bíblica não é força mental para fazer algo acontecer. É confiança em Alguém. Hebreus 11:1 descreve a fé como “o firme fundamento das coisas que se esperam”, e esse fundamento é o caráter de Deus, não a intensidade do meu desejo.

## Orar é diferente de decretar

Jesus nos ensinou a orar: “seja feita a tua vontade” (Mateus 6:10). Há uma liberdade enorme nisso. Eu posso apresentar meus sonhos a Deus com sinceridade e, ao mesmo tempo, descansar porque Ele sabe o que é melhor.

Não preciso controlar o universo. Eu conheço Aquele que o sustenta.`,
  },
  {
    id: "demo-post-4",
    slug: "como-confiar-em-deus-quando-a-vida-nao-acontece-como-imaginavamos",
    title: "Como confiar em Deus quando a vida não acontece como imaginávamos",
    excerpt:
      "Planos adiados, portas fechadas, respostas que não chegam. O que fazer com o coração quando o roteiro muda?",
    cover_url: "/images/capa-confiar-em-deus.jpg",
    cover_alt: "Bíblia aberta apoiada sobre uma pedra, com folhas de outono ao fundo",
    category_id: "cat-fe",
    published_at: "2026-09-23T09:00:00-03:00",
    content: `Eu tinha um roteiro na cabeça. A idade em que certas coisas aconteceriam, os lugares onde eu estaria, as respostas que eu receberia. E a vida, com toda a delicadeza e às vezes sem nenhuma, foi mostrando que eu não estava escrevendo a história sozinha.

## Confiança não é ausência de dor

Confiar em Deus não significa fingir que está tudo bem. Os salmos estão cheios de perguntas honestas — “Até quando, Senhor?” (Salmos 13:1) — e, mesmo assim, terminam em adoração.

::: versiculo Isaías 55:8-9
Porque os meus pensamentos não são os vossos pensamentos, nem os vossos caminhos os meus caminhos, diz o Senhor.
:::

## Lembrar quem Ele é

Quando o futuro parece incerto, eu volto ao que já é certo: o caráter de Deus. Ele é fiel, bom e presente. Romanos 8:28 não promete que tudo será fácil, mas que Deus faz todas as coisas cooperarem para o bem daqueles que O amam.

## Pequenos passos de confiança

1. Escreva o que você esperava e entregue isso a Deus em oração.
2. Liste as fidelidades que Ele já mostrou na sua história.
3. Obedeça ao próximo passo que você já sabe que precisa dar.

O roteiro pode ter mudado, mas o Autor continua o mesmo.`,
  },
  {
    id: "demo-post-5",
    slug: "o-que-deus-pode-ensinar-em-meio-aos-processos-dificeis",
    title: "O que Deus pode ensinar em meio aos processos difíceis",
    excerpt:
      "Nem todo deserto é castigo. Às vezes, é o lugar onde Deus fala mais baixo e nós finalmente aprendemos a ouvir.",
    cover_url: "/images/capa-processos-dificeis.jpg",
    cover_alt: "Rosa delicada com folhas verdes sobre um fundo rosa antigo",
    category_id: "cat-processos",
    published_at: "2026-09-16T09:00:00-03:00",
    content: `Ninguém escolhe passar por um processo difícil. Mas, olhando para trás, eu consigo ver que algumas das lições mais preciosas da minha vida com Deus vieram justamente das estações que eu mais quis pular.

## O deserto como lugar de encontro

O povo de Israel passou quarenta anos no deserto, e foi lá que aprendeu a depender do maná de cada dia. Deus mesmo explica o propósito disso:

::: versiculo Deuteronômio 8:3
Para te dar a entender que o homem não viverá só de pão, mas de tudo o que sai da boca do Senhor.
:::

## O que os processos revelam

- **Dependência:** percebemos que não somos autossuficientes.
- **Caráter:** a paciência e a perseverança são formadas na espera (Romanos 5:3-4).
- **Intimidade:** quando as distrações caem, a voz de Deus fica mais clara.

## Você não está sozinha

Jesus não prometeu uma vida sem aflições, mas prometeu a Sua presença: “No mundo tereis aflições, mas tende bom ânimo, eu venci o mundo” (João 16:33). O processo não é o fim da sua história. Ele pode ser o solo onde algo novo vai florescer.`,
  },
  {
    id: "demo-post-6",
    slug: "como-desenvolver-uma-vida-com-deus-alem-das-aparencias",
    title: "Como desenvolver uma vida com Deus além das aparências",
    excerpt:
      "É possível ter uma estética cristã impecável e um coração distante. Sobre cultivar raízes antes de exibir flores.",
    cover_url: "/images/capa-alem-das-aparencias.jpg",
    cover_alt: "Pessoa lendo um livro aberto sob feixes de luz e sombra",
    category_id: "cat-secreto",
    published_at: "2026-09-09T09:00:00-03:00",
    content: `Eu amo uma Bíblia bonita, cadernos organizados e fotos de mesa de estudo. Mas aprendi que nada disso substitui o que acontece quando ninguém está vendo. A vida com Deus é, antes de tudo, uma vida de raízes.

## O secreto vem primeiro

Jesus ensinou que a oração verdadeira acontece no quarto, com a porta fechada:

::: versiculo Mateus 6:6
Mas tu, quando orares, entra no teu aposento e, fechando a tua porta, ora a teu Pai que está em secreto; e teu Pai, que vê em secreto, te recompensará publicamente.
:::

## Perguntas que me ajudam a ser honesta

- Eu oraria do mesmo jeito se ninguém soubesse?
- Minha leitura bíblica tem me transformado ou apenas me informado?
- As pessoas mais próximas de mim percebem o fruto do Espírito (Gálatas 5:22-23)?

## Beleza que nasce de dentro

Não há nada de errado em tornar o seu momento com Deus bonito. O cuidado também pode ser adoração. Mas que a beleza de fora seja apenas o reflexo de um coração que está, de verdade, aos pés de Jesus.`,
  },
  {
    id: "demo-post-7",
    slug: "aprendendo-a-permanecer-em-cristo-nos-dias-comuns",
    title: "Aprendendo a permanecer em Cristo nos dias comuns",
    excerpt:
      "Entre louça, trabalho, estudos e cansaço: a santidade também mora nas terças-feiras sem nada de especial.",
    cover_url: "/images/capa-dias-comuns.jpg",
    cover_alt: "Mão escrevendo em um caderno sobre uma mesa clara, com uma caneca ao lado",
    category_id: "cat-maturidade",
    published_at: "2026-09-02T09:00:00-03:00",
    content: `Grandes experiências espirituais são preciosas, mas a maior parte da vida acontece nos dias comuns. E é justamente ali que Jesus nos convida a permanecer.

::: versiculo João 15:5
Eu sou a videira, vós as varas; quem está em mim, e eu nele, esse dá muito fruto; porque sem mim nada podeis fazer.
:::

## Permanecer é um verbo contínuo

Permanecer não é visitar Jesus uma vez por dia; é viver conectada a Ele o dia inteiro. Uma oração breve no trânsito, um versículo lembrado no meio de uma conversa difícil, gratidão por uma refeição simples.

## Práticas simples para o cotidiano

- Comece o dia entregando a agenda a Deus antes de abrir o celular.
- Escolha um versículo para carregar ao longo do dia.
- Faça pausas curtas para agradecer.
- Termine a noite revendo onde você percebeu a presença dEle.

## Tudo para a glória dEle

Paulo escreve em Colossenses 3:23: “Tudo quanto fizerdes, fazei-o de todo o coração, como ao Senhor”. Não existe dia comum demais para Deus.`,
  },
  {
    id: "demo-post-8",
    slug: "a-diferenca-entre-conhecer-sobre-deus-e-cultivar-intimidade-com-ele",
    title: "A diferença entre conhecer sobre Deus e cultivar intimidade com Ele",
    excerpt:
      "Saber muito sobre alguém não é o mesmo que conhecê-lo. Uma reflexão sobre teologia que se transforma em relacionamento.",
    cover_url: "/images/capa-intimidade.jpg",
    cover_alt: "Mãos segurando uma Bíblia aberta, em luz suave e azulada",
    category_id: "cat-secreto",
    published_at: "2026-08-26T09:00:00-03:00",
    content: `Estudar a Bíblia é essencial. Conhecer doutrina, contexto e história nos protege de muitos enganos. Mas existe um risco sutil: acumular informações sobre Deus sem nunca conversar com Ele.

## Os fariseus conheciam as Escrituras

Jesus disse aos religiosos da sua época algo que me confronta até hoje:

::: versiculo João 5:39-40
Examinais as Escrituras, porque vós cuidais ter nelas a vida eterna, e são elas que de mim testificam; e não quereis vir a mim para terdes vida.
:::

## Conhecimento que leva à adoração

O estudo bíblico saudável sempre nos leva para mais perto de Jesus. Quando aprendo algo sobre o caráter de Deus, posso transformar isso em oração: “Senhor, obrigada por seres fiel”. A teologia vira louvor.

## Intimidade é cultivada

Intimidade exige tempo, honestidade e constância. Davi escreveu: “Uma coisa pedi ao Senhor, e a buscarei: que possa morar na casa do Senhor todos os dias da minha vida” (Salmos 27:4).

Que a gente nunca troque a Presença por informações sobre a Presença.`,
  },
];

export const demoPosts: Post[] = posts.map((p) => ({
  ...p,
  status: "published",
  is_demo: true,
  seo_title: null,
  seo_description: null,
  updated_at: p.published_at ?? "2026-10-01T00:00:00Z",
  category: demoCategories.find((c) => c.id === p.category_id) ?? null,
}));

export const demoDevotionals: Devotional[] = [
  {
    id: "demo-dev-1",
    slug: "permanecer-na-videira",
    title: "Permanecer na videira",
    bible_reference: "João 15:1-8",
    book: "João",
    theme: "Intimidade com Deus",
    verse_text:
      "Permanecei em mim, e eu permanecerei em vós; como a vara de si mesma não pode dar fruto, se não estiver na videira, assim também vós, se não estiverdes em mim.",
    summary:
      "Fruto não é resultado de esforço, mas de conexão. Jesus não nos pede para produzir, e sim para permanecer.",
    main_text:
      "Às vezes eu me pego tentando “dar fruto” na força do braço: ser mais paciente, mais amorosa, mais disciplinada. E me frustro. Jesus usa a imagem da videira para nos lembrar de algo libertador: o ramo não se esforça para gerar uvas. Ele simplesmente permanece ligado à videira, e a seiva faz o resto.",
    context:
      "Jesus fala estas palavras na noite em que seria traído, a caminho do Getsêmani (João 14:31). Em Israel, a videira era símbolo do próprio povo de Deus (Salmos 80:8; Isaías 5:1-7). Ao dizer “Eu sou a videira verdadeira”, Jesus se apresenta como o cumprimento daquilo que Israel deveria ser e nos chama a encontrar vida nEle.",
    reflection:
      "Percebo que, quando me afasto da Palavra e da oração, não fico apenas “sem devocional”: fico seca. A impaciência aparece mais rápido, a ansiedade fala mais alto. Permanecer, para mim, tem sido voltar — de novo e de novo — para perto dEle, mesmo nos dias em que não sinto nada.",
    application:
      "Hoje, escolha um momento fixo (ao acordar, no almoço ou antes de dormir) para ler João 15:1-8 devagar. Durante o dia, quando sentir que está “na força do braço”, faça uma oração curta: “Jesus, eu permaneço em Ti”.",
    questions: [
      "Em quais áreas da minha vida tenho tentado dar fruto sozinha?",
      "O que tem me afastado da videira nos últimos dias?",
      "Que fruto eu gostaria que o Espírito produzisse em mim nesta estação?",
    ],
    prayer:
      "Senhor Jesus, obrigada porque não preciso produzir nada sozinha. Ensina-me a permanecer em Ti nos dias bons e nos dias secos. Que a minha vida seja um ramo que dá fruto para a glória do Pai. Amém.",
    cover_url: "/images/devocional-flores.jpg",
    cover_alt: "Buquê de rosas em tons de pêssego e rosa sobre fundo claro",
    status: "published",
    published_at: "2026-10-19T07:00:00-03:00",
    is_weekly: true,
    is_demo: true,
    updated_at: "2026-10-19T07:00:00-03:00",
  },
  {
    id: "demo-dev-2",
    slug: "o-senhor-e-o-meu-pastor",
    title: "O Senhor é o meu pastor",
    bible_reference: "Salmos 23",
    book: "Salmos",
    theme: "Confiança",
    verse_text: "O Senhor é o meu pastor, nada me faltará. Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas.",
    summary: "Ser ovelha é aceitar ser guiada. Há descanso em saber que o Pastor conhece o caminho.",
    main_text:
      "Eu já li o Salmo 23 tantas vezes que corria o risco de não ouvi-lo mais. Até que percebi: ele não começa falando sobre pastos ou águas, mas sobre uma relação. “O Senhor é o *meu* pastor.” Tudo o que vem depois flui dessa confiança.",
    context:
      "Davi conhecia bem a vida de um pastor: antes de ser rei, cuidou das ovelhas do pai em Belém (1 Samuel 16:11). No antigo Oriente, a imagem do pastor também era usada para reis que deveriam proteger e guiar o povo. Davi, rei, reconhece que ele mesmo precisa de um Pastor.",
    reflection:
      "Ovelhas não planejam a rota. Elas seguem. Isso me desafia, porque eu gosto de saber todos os detalhes antes de dar um passo. Mas o salmo me lembra que, mesmo no “vale da sombra da morte”, a presença do Pastor é suficiente para não temer.",
    application:
      "Escreva uma situação que hoje parece um “vale” para você. Ao lado, copie o versículo 4 e leia em voz alta sempre que a preocupação voltar.",
    questions: [
      "O que significa, na prática, deixar Deus me guiar nesta semana?",
      "Onde tenho buscado “verdes pastos” longe do Pastor?",
    ],
    prayer:
      "Bom Pastor, eu confio em Ti. Guia-me pelas veredas da justiça por amor do Teu nome. Que eu descanse em saber que nada me falta quando estou contigo. Amém.",
    cover_url: "/images/devocional-buque.jpg",
    cover_alt: "Arranjo de flores do campo em tons de rosa, branco e verde",
    status: "published",
    published_at: "2026-10-12T07:00:00-03:00",
    is_weekly: false,
    is_demo: true,
    updated_at: "2026-10-12T07:00:00-03:00",
  },
  {
    id: "demo-dev-3",
    slug: "aquele-que-comecou-a-boa-obra",
    title: "Aquele que começou a boa obra",
    bible_reference: "Filipenses 1:3-6",
    book: "Filipenses",
    theme: "Processos",
    verse_text:
      "Tendo por certo isto mesmo, que aquele que em vós começou a boa obra a aperfeiçoará até ao dia de Jesus Cristo.",
    summary: "Deus não abandona projetos pela metade. O que Ele começou em você, Ele vai completar.",
    main_text:
      "Há dias em que me olho e vejo tudo o que ainda não mudou. Os mesmos medos, as mesmas fraquezas. Filipenses 1:6 me lembra que a minha santificação não depende só da minha força: é uma obra de Deus, e Ele é fiel para terminá-la.",
    context:
      "Paulo escreve aos filipenses enquanto está preso (Filipenses 1:13). A igreja de Filipos foi a primeira fundada por ele na Europa (Atos 16) e sempre o apoiou. Mesmo acorrentado, Paulo começa a carta com gratidão e alegria — e com confiança na obra de Deus naquela comunidade.",
    reflection:
      "Gosto de pensar na minha vida como um bordado em andamento: de um lado, nós e linhas soltas; do outro, um desenho que só o Artista vê por inteiro. Eu não preciso estar pronta para ser amada. Estou sendo formada.",
    application:
      "Escreva três áreas em que você já viu Deus te transformar. Agradeça por cada uma e entregue a Ele uma área que ainda parece “inacabada”.",
    questions: [
      "Onde tenho sido impaciente comigo mesma?",
      "Como a fidelidade de Deus no passado me encoraja hoje?",
      "Quem eu posso encorajar com essa verdade nesta semana?",
    ],
    prayer:
      "Pai, obrigada porque Tu não desistes de mim. Continua a Tua boa obra no meu coração. Dá-me paciência com o processo e confiança no Teu tempo. Em nome de Jesus, amém.",
    cover_url: "/images/devocional-caderno.jpg",
    cover_alt: "Caderno em branco e caneta sobre uma superfície clara",
    status: "published",
    published_at: "2026-10-05T07:00:00-03:00",
    is_weekly: false,
    is_demo: true,
    updated_at: "2026-10-05T07:00:00-03:00",
  },
  {
    id: "demo-dev-4",
    slug: "aquieta-te",
    title: "Aquietai-vos e sabei",
    bible_reference: "Salmos 46:10",
    book: "Salmos",
    theme: "Descanso",
    verse_text: "Aquietai-vos, e sabei que eu sou Deus; serei exaltado entre os gentios; serei exaltado sobre a terra.",
    summary: "Silêncio também é uma forma de fé. Parar é reconhecer que Ele está no controle.",
    main_text:
      "Vivemos cercadas de barulho: notificações, opiniões, listas de tarefas. O convite de Deus no Salmo 46 vai na contramão: aquietar-se. Não como fuga, mas como reconhecimento de quem Ele é.",
    context:
      "O Salmo 46 descreve terra tremendo, montes caindo no mar e nações em alvoroço. É no meio do caos — e não depois dele — que Deus diz: “Aquietai-vos”. O salmo provavelmente era cantado pelo povo como lembrança de que Deus é refúgio e fortaleza.",
    reflection:
      "Para mim, aquietar-me é difícil. Eu quero resolver, consertar, antecipar. Mas tenho aprendido que alguns dos momentos mais profundos com Deus acontecem quando eu simplesmente paro e deixo que Ele seja Deus.",
    application:
      "Separe cinco minutos hoje, sem celular, para ficar em silêncio diante de Deus. Respire fundo, leia o versículo devagar e apenas fique.",
    questions: ["O que tem tirado a minha paz ultimamente?", "O que muda em mim quando lembro que Ele é Deus?"],
    prayer:
      "Senhor, aquieta o meu coração. Tu és Deus, e eu não preciso carregar o mundo nas costas. Eu descanso em Ti. Amém.",
    cover_url: "/images/devocional-oculos.jpg",
    cover_alt: "Caderno aberto com caneta e óculos sobre a mesa",
    status: "published",
    published_at: "2026-09-28T07:00:00-03:00",
    is_weekly: false,
    is_demo: true,
    updated_at: "2026-09-28T07:00:00-03:00",
  },
];

/** Vídeos de exemplo: NÃO são vídeos reais. Não têm ID do YouTube. */
export const demoVideos: Video[] = [
  {
    id: "demo-video-1",
    youtube_id: null,
    title: "[Exemplo] Minha rotina de devocional sincera",
    description: "Vídeo demonstrativo. Adicione seus vídeos reais pelo painel administrativo.",
    playlist: "Vida com Deus",
    is_featured: true,
    published_at: null,
    sort_order: 1,
    is_demo: true,
    thumbnail_url: "/images/video-exemplo-1.jpg",
  },
  {
    id: "demo-video-2",
    youtube_id: null,
    title: "[Exemplo] Estudo bíblico: como começar",
    description: "Vídeo demonstrativo. Cole aqui o link de um vídeo do seu canal.",
    playlist: "Estudos bíblicos",
    is_featured: false,
    published_at: null,
    sort_order: 2,
    is_demo: true,
    thumbnail_url: "/images/video-exemplo-2.jpg",
  },
  {
    id: "demo-video-3",
    youtube_id: null,
    title: "[Exemplo] Livros cristãos que marcaram minha fé",
    description: "Vídeo demonstrativo. Organize os vídeos por playlist ou tema.",
    playlist: "Conversas",
    is_featured: false,
    published_at: null,
    sort_order: 3,
    is_demo: true,
    thumbnail_url: "/images/video-exemplo-3.jpg",
  },
  {
    id: "demo-video-4",
    youtube_id: null,
    title: "[Exemplo] Confiar em Deus na espera",
    description: "Vídeo demonstrativo. Ele será substituído pelos seus vídeos.",
    playlist: "Vida com Deus",
    is_featured: false,
    published_at: null,
    sort_order: 4,
    is_demo: true,
    thumbnail_url: "/images/video-exemplo-4.jpg",
  },
];
