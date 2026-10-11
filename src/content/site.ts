import { assets } from './assets.ts';
import { editorialPages } from './editorial.ts';
import { conversationContent } from './conversation.ts';
import type { Fact, PageContent, SiteContent } from './types';

const source = 'docs/project/psychologist-content-source.md';
const draft = 'docs/project/psychologist-content-draft.md';
const profile = `${source}#2; S01/S02 (2026-10-07)`;
const demoCopy = 'docs/design/content-details.md#тексты; демонстрационная редакционная проза';
const demoConditions = 'docs/design/consultation-demo.md; временные примеры по запросу пользователя (2026-10-09)';
const instagramUrl = 'https://www.instagram.com/anna_feell/';
const known = <T>(value: T, evidence: string): Fact<T> => ({ value, confirmed: true, source: evidence });
const unknown = <T>(section: string): Fact<T> => ({ value: null, confirmed: false, source: `${source}#${section}` });
const demo = <T>(section: string, value: T): Fact<T> => ({ ...unknown<T>(section), demo: { value, source: demoConditions } });

const pages: PageContent[] = [
  {
    id: 'home', path: '/', enabled: true,
    metadata: {
      status: 'DEMO', title: 'Анна Филиппова — психолог',
      description: 'Анна Филиппова, психолог. Основные темы профиля — отношения и самооценка.', source: profile,
    },
    blocks: [
      { id: 'hero', status: 'DEMO', required: true, title: 'Отношения и самооценка', body: ['Когда хочется лучше понимать себя, быть ближе к другим и не терять собственный голос.'], source: `${profile}; docs/design/approved/README.md; ${demoCopy}`, factKeys: ['specialist.name', 'specialist.role'] },
      { id: 'topics', status: 'DEMO', required: false, title: 'Темы для разговора', body: ['Иногда за привычной ситуацией стоит вопрос, которому хочется уделить больше внимания.'], source: `${source}#5; S01/S02; ${demoCopy}`, factKeys: [] },
      { id: 'introduction', status: 'DEMO', required: false, title: 'Знакомство', body: ['Меня зовут Анна Филиппова. Я психолог.', 'Здесь — об отношениях с другими и с собой. О том, как замечать свои желания, говорить о важном и оставлять место несовершенству.'], source: `${profile}; ${draft}#3; ${demoCopy}`, factKeys: ['specialist.name', 'specialist.role'] },
      { id: 'instagram', status: 'DEMO', required: false, title: 'Больше обо мне', body: [], source: `${source}#3`, factKeys: ['contacts.instagramUrl'] },
      { id: 'reading', status: 'DEMO', required: false, title: 'Несколько минут\nдля себя.', body: ['Не обязательно читать всё подряд. Начните с мысли, которая ближе вам сегодня.'], source: demoCopy, factKeys: [] },
    ],
  },
  {
    id: 'about', path: '/about', enabled: true,
    metadata: { status: 'DEMO', title: 'Обо мне — Анна Филиппова', description: 'Знакомство с Анной Филипповой: психолог, отношения и самооценка, публикации в Instagram.', source: profile },
    blocks: [
      { id: 'introduction', status: 'DEMO', required: true, title: 'Анна Филиппова', body: ['Психолог. Отношения и самооценка.'], source: profile, factKeys: ['specialist.name', 'specialist.role'] },
      { id: 'positioning', status: 'DEMO', required: false, title: 'Из моего профиля', body: ['Помогаю тем, кто застрял между мечтой и реальностью'], source: `${source}#3; S01`, factKeys: [] },
      { id: 'profile', status: 'DEMO', required: false, title: 'О том, что бывает непросто', body: ['Сказать о своих желаниях. Не сравнивать себя с другими. Дать себе право на отдых, даже когда осталось много дел. Знакомые ситуации, за которыми могут стоять совсем разные переживания.', 'В моём Instagram — об отношениях, самооценке, выгорании и страхе неудачи. На сайте можно начать с короткой заметки или выбрать тему, которая сейчас откликается.'], source: `${source}#4; S01/S03/S04/S05; ${demoCopy}`, factKeys: [] },
    ],
  },
  {
    id: 'topics', path: '/topics', enabled: true,
    metadata: { status: 'DEMO', title: 'Темы для разговора — Анна Филиппова', description: 'Отношения, самооценка, отдых и страх неудачи. Мысли о близости с другими и внимании к себе.', source: `${source}#4; ${source}#5; ${demoCopy}` },
    blocks: [
      { id: 'topics-intro', status: 'DEMO', required: true, title: 'Отношения и самооценка', body: ['Близость с другими часто начинается с внимания к себе. К своим желаниям, границам и словам, которыми мы описываем себя.'], source: `${source}#5; S01/S02; ${demoCopy}`, factKeys: [] },
      { id: 'publications', status: 'DEMO', required: false, title: 'В повседневной жизни', body: ['Большие вопросы нередко прячутся в небольших моментах: в усталости к вечеру, отложенном решении или попытке разрешить себе паузу.'], source: `${source}#4; ${demoCopy}`, factKeys: [] },
      { id: 'resource', status: 'DEMO', required: false, title: 'Усталость и ресурс', body: ['Когда обязательств много, собственные желания легко отодвинуть. С чего начать, если хочется оставить в дне немного места для себя?'], source: `${source}#4; S04/S05; ${demoCopy}`, factKeys: [] },
      { id: 'failure', status: 'DEMO', required: false, title: 'Страх неудачи', body: ['Хочется попробовать, но страшно ошибиться. Иногда первый шаг — не большое решение, а небольшая попытка, которую можно пересмотреть.'], source: `${source}#4; S03; ${demoCopy}`, factKeys: [] },
      { id: 'rest', status: 'DEMO', required: false, title: 'Право на отдых', body: ['Пауза без списка достижений. Вечер, который не нужно проводить идеально. Что подходит именно вам, а не выглядит правильно со стороны?'], source: `${source}#4; S04; ${demoCopy}`, factKeys: [] },
    ],
  },
  {
    id: 'sessions', path: '/sessions', enabled: true,
    metadata: { status: 'DEMO', title: 'Консультации — Анна Филиппова', description: 'Индивидуальные онлайн-консультации: формат, продолжительность, стоимость и запись.', source: demoConditions },
    blocks: [{ id: 'conditions', status: 'DEMO', required: true, title: 'Место для\nвашего разговора.', body: ['Не обязательно заранее подбирать точные слова. Начать можно с того, что сейчас занимает ваши мысли.'], source: demoConditions, factKeys: ['consultations.format', 'consultations.durationMinutes', 'consultations.price'] }],
  },
  {
    id: 'faq', path: '/faq', enabled: false,
    metadata: { status: 'DRAFT', title: 'Вопросы о консультациях — Анна Филиппова', description: '', source: `${draft}#16` },
    blocks: [{ id: 'faq-intro', status: 'DRAFT', required: true, title: 'Вопросы о консультациях', body: [], source: `${draft}#14`, factKeys: [] }],
  },
];

export const siteContent: SiteContent = {
  conversation: conversationContent,
  specialist: {
    name: known('Анна Филиппова', profile),
    role: known('Психолог', profile),
    // Preserved as profile claims, withheld from UI until professional confirmation.
    practiceExperience: { value: '7 лет практики', confirmed: false, source: `${source}#3; S01 (2026-10-07)` },
    supervision: { value: 'Супервизор, ОИПП', confirmed: false, source: `${source}#3; S01 (2026-10-07)` },
    method: unknown('7'), audience: unknown('6'), boundaries: unknown('6'), city: unknown('2'),
  },
  consultations: {
    format: demo('9', 'Онлайн, индивидуально'), durationMinutes: demo('9', 50), price: demo('9', { amount: 4000, currency: 'RUB' }),
    frequency: demo('9', 'Один раз в неделю'), cancellationPolicy: demo('11', 'Сообщите о переносе или отмене не позднее чем за 24 часа до встречи.'),
  },
  contacts: {
    bookingUrl: demo('3', instagramUrl),
    instagramUrl: known(instagramUrl, `${source}#0; S01/S02`),
    email: unknown('2'),
  },
  pages: [...pages, ...editorialPages],
  topics: [
    { slug: 'relationships', title: 'Отношения', description: 'Быть рядом и оставаться собой. Говорить о желаниях, замечать различия и находить место для своих границ.', order: 1, status: 'DEMO', confirmed: true, source: `${source}#5; S01/S02; ${demoCopy}` },
    { slug: 'self-esteem', title: 'Самооценка', description: 'Относиться к себе с уважением — даже после ошибки. Замечать самокритику и возвращаться к собственному масштабу.', order: 2, status: 'DEMO', confirmed: true, source: `${source}#5; S01/S02; ${demoCopy}` },
  ],
  // No invented answers, education or client materials.
  faq: [],
  education: [],
  assets,
  usedAssetIds: ['A01'],
};
