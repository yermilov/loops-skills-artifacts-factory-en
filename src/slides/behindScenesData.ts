/**
 * The film on the closing slide (BehindScenes.tsx): real exchanges from the making of this deck,
 * cut from the task's sessions on 17.11.2026 — his comments on the task page (`web`) and his
 * prompts in the Claude Code panes (`code`), each with the start of what the model answered.
 * Verbatim, in the language they were in, except: markdown marks are stripped, a reply is cut at
 * a sentence end (…), the dev-server address is shortened, and the assistant is called «myclaw»
 * as everywhere in this deck. `page` is the PDF page of the slide that exchange produced.
 * Nothing private is in here (see the privacy rule in CLAUDE.md) — keep it that way when adding.
 */
export type Beat = { at: string; where: 'web' | 'code'; prompt: string; reply: string; page?: number };

/** The whole of it, as of that day: sessions on the task, and calendar days with any work in them. */
export const STATS = { sessions: 24, days: 18 };

export const BEATS: Beat[] = [
  {
    at: '8 Oct',
    where: 'web',
    prompt: 'Now find in my emails final talk title and description and find the previous completed task with intermediate talk details.',
    reply: 'Знайшов обидві речі. … Назва: Loops, Skills, Artifacts, Factory: How I Turned AI Buzzwords Into a Personal Assistant That Actually Improved My Life',
  },
  {
    at: '9 Oct',
    where: 'web',
    prompt: 'давай тепер створимо новий репо і темлейт презентації в стилі WAWTECH_Template_white в який я вже буду додавати контент',
    reply: 'Готово: новий репозиторій і шаблон презентації в стилі WAWTECH_Template_white. Можна додавати контент.\nДе лежить\n- Репозиторій: …',
    page: 1,
  },
  {
    at: '24 Oct',
    where: 'code',
    prompt: 'а із другого слайду зроби слайд про мене',
    reply: 'Слайд 2 — тепер «Who I am»: localhost:5173/…/#slide-2\nФорма як на доу дей («ХТО Я»): заголовок зверху, ліворуч маджентовий лід-рядок і буліти, що відкриваються по одному, праворуч фото. …',
    page: 2,
  },
  {
    at: '24 Oct',
    where: 'code',
    prompt: '[Image #2] can you find one of those "life before this tweet meme" with nature and relaxed people?',
    reply: 'Знайшов — точніше, зробив свій, і це свідоме рішення: тягнути в публічний дек чужу мем-картинку означає тягнути і чужі права на неї, а цю можна показувати де завгодно.\nСлайд 2022 тепер має три беати замість двох:\n1. …',
    page: 5,
  },
  {
    at: '24 Oct',
    where: 'code',
    prompt: 'а ну і зроби щоб відповідь моделі зявлялася потроху як справжня відповідь моделі\nвзагалі подумай трошки більше і серйозніше про те як мав виглядати той прототип в реальності',
    reply: 'Хук знайшов одне: смугу-акцент зліва від блоку з tool-call (src/styles/slide-layouts.css:310).\nВиправив, не глушив. …',
    page: 9,
  },
  {
    at: '28 Oct',
    where: 'web',
    prompt: 'Досліди цих 4 деки і на їх основі створи мені 3 слайди про преплі:\n1) what is Preply as company?\n2) what is Preply as product?\n3) we are hiring at Preply',
    reply: 'Зробив три слайди про Preply на основі чотирьох дек — вони замінили плейсхолдер «Інформація про Преплі» (слайд 3) і вже на проді: …',
    page: 3,
  },
  {
    at: '8 Nov',
    where: 'code',
    prompt: 'наступний слайд після курсору - перша випущена версія клод коду\nколи ти чатився в терміналі, а він на кожен чіш питав тебе дозволу',
    reply: 'Слайд стоїть одразу після Cursor. 11 слайдів, кліп 13.8 с, грає сам.\nЩо показує: вітальна рамка ✻ Welcome to Claude Code research preview! з /help for help і cwd:, ти пишеш > run the tests and fix what is broken — і далі він …',
    page: 11,
  },
  {
    at: '8 Nov',
    where: 'code',
    prompt: 'давай зробимо наступний слайд про клод код який використовує GitHub MCP',
    reply: 'Слайд 11 — MCP. 12 слайдів, кліп 13.2 с.\nСюжет (та сама my-shop, що й на двох попередніх — історія читається наскрізь): …',
    page: 13,
  },
  {
    at: '9 Nov',
    where: 'code',
    prompt: 'ура! тепер після localhost:5173/…/#slide-40 слайду додаємо новий слайд\n- це буде картинка на основі мему туду ліст Патріка із спанч боба\n- туду ліст заголовок My AI assistant\n- пункти: right system prompt, loads of mcp servers, claude code sdk',
    reply: 'Слайд стоїть після dayplan — кадр 41, одразу перед фіналом.\nАркуш із нахилом, заголовок «My AI assistant», під ним накреслена від руки magenta-риска, і три пункти з намальованими від руки чекбоксами (roughjs — не ідеальні …',
    page: 16,
  },
  {
    at: '9 Nov',
    where: 'code',
    prompt: 'ідея наступного слайду:\nякщо ти гігачад як  Петер Штайнбергер, і супер агентський кодер то ти дійсно можеш побудувати свою екосистему харнеса в широкому розумінні для аі асистента. так і зявився Clawdbot, ой Moltbot, ой OpenClaw',
    reply: 'Слайд «Unless you are Peter Steinberger» — кадри 46–48, три кліки.\nКлік 1 — докази «гігачадства», чотири mint-картки: 1 h (перша версія — WhatsApp, прикручений до Claude Code CLI) · 6,600 комітів за один січень · 4–10 агентів …',
    page: 19,
  },
  {
    at: '10 Nov',
    where: 'web',
    prompt: 'fill blank area on this reveal with a bunch of hello-s inspired by this laptop stickers',
    reply: 'Заповнив порожню ліву половину першого кадру слайда «про мене» наліпками «hello» за мотивами твого стікерпаку Preply. Вже на проді: …',
    page: 2,
  },
  {
    at: '10 Nov',
    where: 'code',
    prompt: 'idea: replace Software Engineer on previous slide with AI-native Engineer',
    reply: 'I swapped it: the caption on #slide-49 now reads "You know, I\'m something of an / AI-native Engineer myself". "AI-native Engineer" keeps the distortion and the halo.\nI changed "a" to "an" because "AI" starts with a vowel sound. …',
    page: 20,
  },
  {
    at: '11 Nov',
    where: 'code',
    prompt: '[Image #9] звідки ти взяв цифру 0.22?',
    reply: 'Вигадав. Це не вимір, а моя прикидка «на серветці»: я взяв приблизно 40 тисяч токенів контексту, які модель перечитує на кожному тіку, і помножив на умовні 5 доларів за мільйон вхідних токенів — вийшло близько 0.20, я округлив до …',
    page: 44,
  },
  {
    at: '12 Nov',
    where: 'code',
    prompt: 'щось трохи глупо що апі повертає стан машини. давай подумає що, може треба інший кейс',
    reply: 'Слушно. Проблема точкова: на цьому місці в сюжеті асистент — це Claude Code + цикл + черга задач, і більше нічого. …',
    page: 38,
  },
  {
    at: '12 Nov',
    where: 'code',
    prompt: 'airports doesn\'t work in ukraine because of war - let\\s use train stations',
    reply: 'Виправив — і знайшов друге таке місце:\n- Кадр 84 (сеанс, з телефона): «Thursday. On Friday you are at the station by four — the Warsaw train.»\n- Слайд SDK chat (раніше в деку, віджет чату): було «the organisers still need your …',
    page: 38,
  },
  {
    at: '13 Nov',
    where: 'code',
    prompt: 'а давай може зберемо коротку анімацію щоб він повертав голову?',
    reply: 'Готово: кадр 82 тепер живий.\nЩо відбувається на слайді. Один безперервний план, 5,6 секунди, без звуку, грає один раз:\n1. рука Енакіна на голові дроїда — він його вмикає;\n2. загоряються очі;\n3. …',
    page: 37,
  },
  {
    at: '13 Nov',
    where: 'code',
    prompt: '"Thursday morning, Podil. This light came on — mention it." це якась дивна і незрозуміла задача щоб давати агенту',
    reply: 'Згоден, то був уривок, а не завдання. Тепер твій коментар читається як самодостатня задача:\nBook a car service this week — a morning, in Podil. Tell them about this light:\nі під ним фото приладової панелі. …',
    page: 47,
  },
  {
    at: '13 Nov',
    where: 'code',
    prompt: 'no, wait, explore how it\'s done in real myclaw, don\'t guess',
    reply: 'Ти мав рацію — перша версія була моєю здогадкою. Розібрався, як це працює насправді, і переробив кадр під реальний механізм: …',
    page: 52,
  },
  {
    at: '14 Nov',
    where: 'web',
    prompt: 'А реалізуй будь ласка незалежність максимальну від інтернету: коли презентація завантажується вперше вона зразу завантажує і зберігає весь контент. Якщо інтернет зникає вона продовжує працювати.',
    reply: 'Зробив: тепер презентація працює без інтернету. Під час першого відкриття вона одразу завантажує весь дек, а потім працює офлайн, навіть після перезавантаження сторінки. Уже на проді: …',
  },
  {
    at: '16 Nov',
    where: 'code',
    prompt: 'ну ні це повна скукотіща [Image #7]\nа ну досліди інтернет хто де малює класні архітектурні діаграми і спробуй повторити найркащі практики і підходи',
    reply: 'The architecture slide (frame 108) is rebuilt as an animated journey instead of boxes of text. bun run check passes, and I looked at five of the six steps at 1920×1080 with no errors.\nWhat I found online. …',
  },
  {
    at: '16 Nov',
    where: 'code',
    prompt: 'мені не подобається що ти все запаковуєш у квадратні блоки - навіщо? дай діаграмі дихати',
    reply: 'Рамки й картки прибрав: на кадрі 108 тепер нічого не запаковано в прямокутники, bun run check чистий.\n- Сервер — один круглий фіолетовий вузол із міткою Railway та рядком «deterministic code / no AI inside». …',
    page: 39,
  },
  {
    at: '16 Nov',
    where: 'code',
    prompt: 'це індустріальна практика малювати сервер кружечком?',
    reply: 'Ні, це не індустріальна практика — коло я обрав сам, коли ти попросив прибрати квадратні блоки.\nЯк зазвичай малюють:\n- Сервер або сервіс — прямокутник (C4, UML) або впізнавана іконка: серверна стійка, логотип хмарного сервісу. …',
    page: 42,
  },
  {
    at: '16 Nov',
    where: 'code',
    prompt: '[Image #16] [Image #17] ну чому ти зламав стиль',
    reply: 'Мій промах: я намалював власну плашку замість тієї, що вже є в деку. Замінив на той самий рядок-вердикт «✓ FIXED», що на слайді з вебінтерфейсом задач — ті самі класи, без окремого заголовка. …',
    page: 40,
  },
  {
    at: '16 Nov',
    where: 'code',
    prompt: '[Image #19] а ти можеш перевірити які мсп у мене реально налаштовані?',
    reply: 'Перевірив claude mcp list і конфіг Codex. З чотирьох іконок на слайді три відповідають справжнім MCP, а «bank» — ні. …',
    page: 43,
  },
  {
    at: '16 Nov',
    where: 'code',
    prompt: 'додай на наступному слайді покажи як ми запускаємо безкоштовні openrouter моделі на codex',
    reply: 'Новий слайд стоїть після графіка темпу, на кадрі 97 (дошка задач з\'їхала на 98–100): localhost:5173/…/#slide-97\nЗаголовок — «✓ BONUS free OpenRouter models, on the same Codex», формат той самий, що на 91-му: …',
    page: 46,
  },
  {
    at: '17 Nov',
    where: 'code',
    prompt: 'move "looks like we\'ve build software factory" slide right after localhost:5173/…/#slide-122\nI\'m looking for visual for this akin to localhost:5173/…/#slide-81\nideas?',
    reply: 'Moved: "Looks like we have built a software factory!" is now frame 123, right after the miniapps tree, and the problem-hunting loop tasks slide follows it at 124. …',
    page: 63,
  },
  {
    at: '17 Nov',
    where: 'code',
    prompt: 'супер наступним слайдом додай зображення завода форда і підпис how everyone imagines software factory',
    reply: 'Додав: після лупів тепер кадр 135 — фото конвеєра Форда на весь екран із підписом «How everyone imagines a software factory». bun run check проходить, нічого не закомічено.\nlocalhost:5173/…/#slide-135\n- Фото: …',
    page: 68,
  },
  {
    at: '17 Nov',
    where: 'code',
    prompt: 'Давай спробуємо факторіо стиль якщо що відкотимося',
    reply: 'Вид зверху готовий і стоїть на кадрі 136; bun run check проходить, нічого не закомічено.\nlocalhost:5173/…/#slide-136\nЩо там відбувається, усе грає саме:\n1. Інженери будують. Троє в рожевих касках стоять біля стола з планом. …',
    page: 69,
  },
  {
    at: '17 Nov',
    where: 'code',
    prompt: 'а зроби на localhost:5173/…/#slide-136 епізод де одна лінія ламається, все зупиняється і всі чекають поки інженер полагодить\nще коли парковка заповнена хай машини проосто уїзжають за слайд',
    reply: 'Обидві речі зроблено на кадрі 136, dev-сервер знову працює на localhost:5173. Перевірив на зупинених кадрах у браузері, bun run check чистий; у русі наживо не дивився і не комітив. …',
    page: 69,
  },
  {
    at: '17 Nov',
    where: 'code',
    prompt: 'не зовсім, треба щоб всі лінії були зєднані в одну\nале напрямок гарний, просто зєднай їх',
    reply: 'З\'єднав: на кадрі 137 тепер одна стрічка змійкою через п\'ять ділянок, і авто проходить усі п\'ять по черзі аж до парковки. Перевіряв на зупинених кадрах (будівництво, поломка, 82-га секунда), bun run check чистий; …',
    page: 70,
  },
  {
    at: '17 Nov',
    where: 'code',
    prompt: 'а давай трохи по іншому зліва мій код, справа слайди, а по центру як я робив цю презентацію',
    reply: 'Переставив: зліва твій LinkedIn-код, справа «these slides», а по центру стаб «How I prepared this talk». bun run check проходить, нічого не закомічено. …',
  },
  {
    at: '17 Nov',
    where: 'code',
    prompt: 'а останнім я хочу щоб ти попрацював над …/#slide-138\nзавантаж із задачі всі сесії\nі зроби довгий фільм behind the scenes як я в інтерфейсі myclaw + claude code працював над цією презентацією\nвикористовуй мої справжні промпти, справжні відповіді моделі',
    reply: 'Прийняв обидва: спершу дороблю обхід стрічки на 137, потім зберу фільм «behind the scenes» для фінального слайда зі справжніх сесій задачі, і після цього сам закрию сесію.',
    page: 71,
  },
];
