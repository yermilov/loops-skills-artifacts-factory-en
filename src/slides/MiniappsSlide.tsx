import { ReactNode } from 'react';
import { SlideDefinition } from '../types/slides';
import { CornerRings } from '../components/wawtech';
import { useAnimating } from '../components/frameSettled';
import { useClock } from './BootstrapSlide';
import { Browser, InFlight, STREAM_MS } from './improve';
import { App, Comment, Fields, Ico, IconName, NavGroup, Thumb } from './ledgerApp';
import { RouteMap } from './RouteMap';
import dryGuatemala from '../assets/coffee/dry-guatemala.jpg';
import bekeleKechara from '../assets/coffee/ethiopia-bekele-kechara.jpg';
import decaf from '../assets/coffee/decaf.jpg';
import waterPhoto from '../assets/supplies/water.jpg';
import granolaPhoto from '../assets/supplies/granola.jpg';
import tabletsPhoto from '../assets/supplies/dishwasher-tablets.jpg';

/**
 * «Artifacts that stay: miniapps» — the pages of the assistant's web app.
 *
 * The first frame plays how one is BORN (Yarik, 14.11.2026): I talk to the agent
 * about coffee in a task, it answers with an artifact, and then I say «make this
 * artifact permanent — create a miniapp»: the agent writes the page, a row appears
 * in the sidebar, and the app opens it. Every click after that adds one more row
 * and opens that page, so the room watches the app grow. «Miniapp» is the
 * product's own word (a section of its sidebar; `apps/web/src/lib/launcher.ts`).
 *
 * The fourteen pages are RECREATIONS, each drawn after the real page as it looked
 * on 14.11.2026 — its sections, their order, their controls and their wording.
 * What each is FOR is real; every name, title and number is invented, because the
 * real ones hold his real life (money, health, family) — EXCEPT Coffee and
 * Supplies, which at his word (14.11.2026) show his real bags and shelf and his own
 * photos of them (src/assets/coffee/, src/assets/supplies/, taken off the product). Its verdicts and the «your taste»
 * summary are sharpened for the stage: on the real page all he has said so far is
 * «OK». In the order shown:
 *   Coffee · Money · Supplies · Books · Movies · Health · Nanny ·
 *   Threat forecast · Home · Routes · Sleep · Sport · Music · Family tree.
 * (The app has more — work hours, important dates, his sole-proprietor books, a
 * wall display; the notes say so.)
 */

/* ─── Parts every page is made of ─────────────────────────────────────────── */

function Page({
  icon,
  name,
  aside,
  children,
}: {
  icon: IconName;
  name: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="ww-ma ww-jg__arrive">
      <span className="ww-jg__panelhead ww-ma__head">
        <Ico name={icon} />
        <span className="ww-jg__panelname">{name}</span>
        {aside && <span className="ww-ma__aside">{aside}</span>}
      </span>
      {children}
    </div>
  );
}

const L = ({ children, tone }: { children: ReactNode; tone?: 'time' | 'agent' | 'danger' | 'ink' }) => (
  <span className={`ww-jg__label${tone ? ` ww-jg__label--${tone}` : ''}`}>{children}</span>
);

/** A row of mono buttons, as the page headers and toolbars have them. */
const Buttons = ({ items, on }: { items: string[]; on?: string }) => (
  <span className="ww-ma__buttons">
    {items.map((item) => (
      <span key={item} className={item === on ? 'ww-ma__button ww-ma__button--on' : 'ww-ma__button'}>
        {item}
      </span>
    ))}
  </span>
);

/** The app's three-week calendar heatmap (books, sport, music): Monday first,
 *  0 nothing … 3 a lot, the day of the month in each cell, today outlined. */
function Heat({ levels, first, today }: { levels: number[]; first: number; today: number }) {
  return (
    <span className="ww-ma__heatwrap">
      <span className="ww-ma__weekdays ww-jg__label" aria-hidden="true">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </span>
      <span className="ww-ma__heat" aria-hidden="true">
        {levels.map((level, i) => {
          const day = ((first + i - 1) % 31) + 1;
          return (
            <span
              key={i}
              className={`ww-ma__day ww-ma__day--${level}${i === today ? ' ww-ma__day--today' : ''}${
                i > today ? ' ww-ma__day--future' : ''
              }`}
            >
              {day}
            </span>
          );
        })}
      </span>
      <span className="ww-ma__heatlegend ww-jg__label">
        less
        {[0, 1, 2, 3].map((level) => (
          <span key={level} className={`ww-ma__dot ww-ma__day--${level}`} aria-hidden="true" />
        ))}
        more
      </span>
    </span>
  );
}

/** Points of a polyline across a 100 × 100 box, from values 0…1 (1 = top). */
const line = (values: number[]) =>
  values.map((v, i) => `${((i / (values.length - 1)) * 100).toFixed(1)},${(100 - v * 100).toFixed(1)}`).join(' ');

/* ─── Coffee ──────────────────────────────────────────────────────────────── */

const VERDICTS = ['Love', 'OK', 'Not really', 'No'];
type Bag = { name: string; photo: string; origin: string; notes: string; opened: string; verdict: string };
/** His real bags, read off the product (roaster, origin, process and descriptors
 *  are the labels' own); the verdicts are sharpened for the stage. */
const BAGS: Bag[] = [
  {
    name: 'Dry Guatemala',
    photo: dryGuatemala,
    origin: 'Funt Coffee · Guatemala, Nuevo Oriente · natural · filter',
    notes: 'Orange, yellow apple, cinnamon, almond',
    opened: 'opened 13 Nov',
    verdict: 'Love',
  },
  {
    name: 'Ethiopia Bekele Kechara',
    photo: bekeleKechara,
    origin: 'Kafar · Ethiopia, Sidama · natural · filter',
    notes: 'Flowers, wild strawberries, berries',
    opened: 'opened 5 Nov',
    verdict: 'OK',
  },
  {
    name: 'Decaf',
    photo: decaf,
    origin: 'Funt Coffee · Colombia · washed · filter',
    notes: 'Raspberry, marzipan, orange',
    opened: 'opened 12 Nov',
    verdict: 'Not really',
  },
];

/** One bag, as both the artifact in the task and the card on the page draw it. */
function BagCard({ bag, rated = true }: { bag: Bag; rated?: boolean }) {
  return (
    <div className="ww-ma__card">
      <div className="ww-jg__item">
        <img className="ww-ma__bagphoto" src={bag.photo} alt={`The ${bag.name} bag`} />
        <span className="ww-jg__itemtext">
          <span className="ww-jg__itemname">{bag.name}</span>
          <span className="ww-ma__sub">{bag.origin}</span>
          <span className="ww-ma__sub ww-ma__sub--notes">{bag.notes}</span>
        </span>
      </div>
      <span className="ww-jg__seg">
        <span>Sealed</span>
        <span className="ww-jg__seg--on">Open</span>
        <span>Finished</span>
      </span>
      <span className="ww-jg__seg ww-jg__seg--soft">
        {VERDICTS.map((verdict) => (
          <span key={verdict} className={rated && verdict === bag.verdict ? 'ww-jg__seg--pick' : undefined}>
            {verdict}
          </span>
        ))}
      </span>
      <L>{bag.opened}</L>
    </div>
  );
}

const Coffee = () => (
  <Page icon="coffee" name="Coffee">
    <div className="ww-ma__card ww-ma__card--quiet">
      <L>Your taste · 7 ratings</L>
      <p>
        You like a sweet, nutty natural: «love» on Dry Guatemala four bags in a row — orange, yellow apple, almond.
        Floral, berry-forward Ethiopians are a steady «OK». Washed decaf is «not really». Next to buy: natural
        Central Americans, filter roast.
      </p>
    </div>
    <span className="ww-jg__seg ww-ma__tabs">
      <span>Flat · 2</span>
      <span className="ww-jg__seg--on">Country house · 3</span>
      <span>Cafés</span>
    </span>
    <span className="ww-ma__actions">
      <span className="ww-jg__new">Photograph a bag</span>
      <L>+ without a photo</L>
    </span>
    <div className="ww-ma__cols ww-ma__cols--3">
      {BAGS.map((bag) => (
        <BagCard key={bag.name} bag={bag} />
      ))}
    </div>
  </Page>
);

/* ─── Money ───────────────────────────────────────────────────────────────── */

const WORTH = [0.62, 0.55, 0.4, 0.12, 0.1, 0.82, 0.8, 0.58, 0.55, 0.5, 0.36, 0.3, 0.22, 0.98, 0.7, 0.6, 0.52, 0.5];
const SPENT_NOW = [0.02, 0.06, 0.1, 0.16, 0.24, 0.3, 0.31, 0.32];
const SPENT_BEFORE = [0.04, 0.2, 0.3, 0.36, 0.52, 0.6, 0.66, 0.78, 0.82, 0.9, 0.96, 0.98];
const BUDGET = [0.02, 0.1, 0.18, 0.26, 0.34, 0.42, 0.5, 0.58, 0.66, 0.74, 0.82, 0.9];
const PAYMENTS = [
  { what: 'RUSORIZ', kind: 'Charity', from: 'Black card', when: '3h ago', sum: '−1 400 UAH' },
  { what: 'Cloud storage', kind: 'Technology', from: 'Black card', when: '3h ago', sum: '−574.99 UAH' },
  { what: 'Nanny', kind: 'Children', from: 'Cash', when: '7h ago', sum: '−10 300 UAH' },
  { what: 'Bond purchase', kind: 'Transfer', from: 'Euro account', when: '18h ago', sum: '−1 020 EUR' },
];

const MoneyOverview = () => (
  <Page
    icon="money"
    name="Money"
    aside={<Buttons items={['Expense', 'Transfer', 'Income', 'Balance', 'Assets']} />}
  >
    <div className="ww-ma__cols ww-ma__cols--wide">
      <div className="ww-ma__col">
        <div className="ww-ma__card">
          <L>Net worth ›</L>
          <span className="ww-ma__big">
            1 284 500 UAH <L>available 245 600 UAH · 1 200 USD · 300 EUR</L>
          </span>
          <span className="ww-ma__chartrow">
            <span className="ww-ma__delta">
              <L tone="time">↘ −13K · −1.2%</L>
              <L>vs a month ago</L>
            </span>
            <svg className="ww-ma__chart" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <polygon className="ww-ma__area" points={`0,100 ${line(WORTH)} 100,100`} />
              <polyline className="ww-ma__line" points={line(WORTH)} />
            </svg>
            <span className="ww-ma__delta">
              <L>↗ +0.9%</L>
              <L>vs yesterday</L>
            </span>
          </span>
          <span className="ww-jg__ribbonlegend ww-jg__label">
            <span>14 Oct</span>
            <span>14 Nov</span>
          </span>
        </div>
        <L>Recent transactions</L>
        <div className="ww-ma__card ww-ma__card--list">
          {PAYMENTS.map((row) => (
            <span key={row.what} className="ww-ma__row">
              <span className="ww-jg__itemtext">
                <span>{row.what}</span>
                <L>{row.kind}</L>
              </span>
              <L>
                {row.from} · {row.when}
              </L>
              <span className="ww-ma__sum">{row.sum}</span>
            </span>
          ))}
        </div>
      </div>
      <div className="ww-ma__col">
        <div className="ww-ma__card">
          <L>Received ›</L>
          <span className="ww-ma__big ww-ma__big--good">
            +98 200 UAH <L>this month</L>
          </span>
        </div>
        <div className="ww-ma__card">
          <L>Spent ›</L>
          <span className="ww-ma__big">
            61 870 UAH <L>42% of 148 000</L>
          </span>
          <L>Spending, day by day</L>
          <svg className="ww-ma__chart ww-ma__chart--tall" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <polyline className="ww-ma__line ww-ma__line--faint" points={line(SPENT_BEFORE)} />
            <polyline className="ww-ma__line ww-ma__line--budget" points={line(BUDGET)} />
            <polyline className="ww-ma__line" points={line(SPENT_NOW).replace(/(\d+\.\d),/g, (_, x) => `${(Number(x) * 0.45).toFixed(1)},`)} />
          </svg>
          <L>— Nov · — last 3 months · ┄ budget</L>
        </div>
      </div>
    </div>
  </Page>
);

/* — Money's own subpages: the page tours them by itself (Yarik, 14.11.2026) — */

function Sub({ icon, name, aside, children }: { icon: IconName; name: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <div className="ww-ma ww-jg__arrive">
      <L>← Money</L>
      <span className="ww-jg__panelhead ww-ma__head ww-ma__head--sub">
        <Ico name={icon} />
        <span className="ww-jg__panelname">{name}</span>
        {aside && <span className="ww-ma__aside">{aside}</span>}
      </span>
      {children}
    </div>
  );
}

const MonthPicker = () => <Buttons items={['‹', 'November 2026', '›']} />;

/** A stepped line (a plan, an income that lands on paydays) across a 100 × 100 box. */
const steps = (values: number[]) =>
  values
    .flatMap((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = 100 - v * 100;
      const prev = i === 0 ? y : 100 - values[i - 1] * 100;
      return [`${x.toFixed(1)},${prev.toFixed(1)}`, `${x.toFixed(1)},${y.toFixed(1)}`];
    })
    .join(' ');
const PLAN = [0.02, 0.05, 0.1, 0.12, 0.14, 0.2, 0.22, 0.26, 0.3, 0.32, 0.36, 0.4, 0.44, 0.5, 0.52, 0.56, 0.6, 0.64, 0.7, 0.72, 0.76, 0.8, 0.84, 0.86, 0.9];
const SPENT_LINE = [0.03, 0.04, 0.06, 0.08, 0.11, 0.13, 0.2, 0.3, 0.34, 0.35, 0.36, 0.37];
const FIXED = [
  { what: 'Newsletter subscription', when: 'Education · 1 Nov', sum: '675 UAH', state: '✓ paid' },
  { what: 'Rent, the flat', when: 'Housing · 20 Nov', sum: '42 000 UAH', state: 'due in 6 days' },
  { what: 'Car loan', when: 'Car · 3 Nov, 17 Nov', sum: '12 000 UAH', state: '⚠ overdue · 3 000', bad: true },
];

const MoneyBudget = () => (
  <Sub icon="money" name="Budget" aside={<MonthPicker />}>
    <div className="ww-ma__card">
      <L>Month</L>
      <svg className="ww-ma__chart ww-ma__chart--tall" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path className="ww-ma__grid" d="M0 25H100 M0 50H100 M0 75H100 M47 0V100" />
        <polyline className="ww-ma__line ww-ma__line--budget" points={steps(PLAN)} />
        <polyline className="ww-ma__line ww-ma__line--faint" points="47,63 100,12" />
        <polyline className="ww-ma__line ww-ma__line--income" points="0,98 17,98 17,58 47,58" />
        <polyline className="ww-ma__line ww-ma__line--ink" points={line(SPENT_LINE).replace(/(\d+\.\d),/g, (_, x) => `${(Number(x) * 0.47).toFixed(1)},`)} />
      </svg>
      <L>┄ plan 148 000 · — spent 61 870 · ··· forecast 152 400 (+3%) · — received 98 200</L>
    </div>
    <div className="ww-ma__card ww-ma__card--slim">
      <span className="ww-ma__row">
        <span>Balance at the end of the month</span>
        <span className="ww-ma__sum">
          income 180 000 − spending 152 400 = <strong className="ww-ma__good">+27 600 UAH</strong>
        </span>
      </span>
    </div>
    <L>Recalculated 11 Nov at 02:48 · plan at the start of the month 141 300</L>
    <div className="ww-ma__cols ww-ma__cols--wide">
      <div className="ww-ma__col">
        <L>Fixed payments</L>
        <div className="ww-ma__card ww-ma__card--list">
          {FIXED.map((row) => (
            <span key={row.what} className="ww-ma__row">
              <span className="ww-jg__itemtext">
                <span>{row.what}</span>
                <L>{row.when}</L>
              </span>
              <span className="ww-ma__sum">{row.sum}</span>
              <L tone={row.bad ? 'danger' : undefined}>{row.state}</L>
            </span>
          ))}
        </div>
      </div>
      <div className="ww-ma__col">
        <L>Income</L>
        <div className="ww-ma__card ww-ma__card--list">
          <span className="ww-ma__row">
            <span>Cashback</span>
            <span className="ww-ma__sum">400 UAH</span>
          </span>
          <span className="ww-ma__row">
            <span>Salary</span>
            <span className="ww-ma__sum">179 600 UAH</span>
          </span>
        </div>
      </div>
    </div>
  </Sub>
);

const Share = ({ name, sum, share, bad }: { name: string; sum: string; share: number; bad?: boolean }) => (
  <span className={`ww-ma__share${bad ? ' ww-ma__share--bad' : ''}`}>
    <span className="ww-ma__sharefill" style={{ width: `${share}%` }} aria-hidden="true" />
    <span>{name}</span>
    <span className="ww-ma__sum">{sum}</span>
  </span>
);

const MoneyIncome = () => (
  <Sub icon="money" name="Income" aside={<MonthPicker />}>
    <div className="ww-ma__cols ww-ma__cols--wide">
      <div className="ww-ma__col">
        <span className="ww-ma__row">
          <L>2026-11 · income by category</L>
          <L>+98 200 UAH</L>
        </span>
        <Share name="Salary" sum="97 800 UAH · 100%" share={100} />
        <Share name="Cashback" sum="400 UAH · 0%" share={2} />
        <span className="ww-ma__row">
          <span className="ww-ma__who">Passive income</span>
          <L>+8 400 UAH</L>
        </span>
        <Share name="Deposits" sum="−3 500 UAH ›" share={24} bad />
        <Share name="Brokerage account" sum="−2 800 UAH ›" share={19} bad />
        <Share name="Government bonds" sum="+14 700 UAH ›" share={100} />
        <p>
          How much the investments earned this month — the change in what they are worth, in hryvnia. It can be
          negative. It is not part of the income total above.
        </p>
      </div>
      <div className="ww-ma__col">
        <span className="ww-ma__row">
          <L>All receipts</L>
          <L>2</L>
        </span>
        <div className="ww-ma__card ww-ma__card--list">
          <span className="ww-ma__row">
            <span className="ww-jg__itemtext">
              <span>Salary</span>
              <L>4 Nov · salary</L>
            </span>
            <span className="ww-ma__sum">+97 800 UAH</span>
          </span>
          <span className="ww-ma__row">
            <span className="ww-jg__itemtext">
              <span>Cashback payout</span>
              <L>4 Nov · cashback</L>
            </span>
            <span className="ww-ma__sum">+400 UAH</span>
          </span>
        </div>
      </div>
    </div>
  </Sub>
);

/** Net worth by type, stacked: the top edge of each band, bottom band first. */
const BANDS: [string, number[]][] = [
  ['cards', [0.06, 0.07, 0.05, 0.09, 0.08, 0.1, 0.08, 0.12]],
  ['cash', [0.1, 0.11, 0.09, 0.13, 0.13, 0.15, 0.13, 0.17]],
  ['deposits', [0.24, 0.25, 0.22, 0.3, 0.31, 0.33, 0.3, 0.36]],
  ['brokerage', [0.4, 0.41, 0.38, 0.47, 0.48, 0.5, 0.47, 0.54]],
  ['bonds', [0.74, 0.76, 0.72, 0.86, 0.84, 0.82, 0.8, 0.83]],
];
const ACCOUNTS = [
  { name: 'White card', sum: '40 100 UAH' },
  { name: 'Dollar card', sum: '2 706 USD' },
  { name: 'Credit card', sum: '22 200 UAH', note: 'available · balance −12 200' },
  { name: 'Black card', sum: '13 300 UAH' },
];

const MoneyAccounts = () => (
  <Sub icon="money" name="Accounts and transactions">
    <div className="ww-ma__card">
      <L>Net worth by type ›</L>
      <span className="ww-ma__big">
        1 284 500 UAH
        <span className="ww-ma__legend">
          {BANDS.map(([name]) => (
            <L key={name}>
              <span className={`ww-ma__swatch ww-ma__band--${name}`} aria-hidden="true" />
              {name}
            </L>
          ))}
        </span>
      </span>
      <svg className="ww-ma__chart" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {[...BANDS].reverse().map(([name, top]) => (
          <polygon key={name} className={`ww-ma__band--${name}`} points={`0,100 ${line(top)} 100,100`} />
        ))}
      </svg>
      <span className="ww-jg__ribbonlegend ww-jg__label">
        <span>19 Aug</span>
        <span>14 Nov</span>
      </span>
    </div>
    <div className="ww-ma__cols">
      <div className="ww-ma__col">
        <span className="ww-ma__actions">
          <Buttons items={['By type', 'By currency']} on="By type" />
          <span className="ww-ma__button">+ Account</span>
        </span>
        <span className="ww-ma__who">Cards</span>
        <div className="ww-ma__card ww-ma__card--list">
          {ACCOUNTS.map((account) => (
            <span key={account.name} className="ww-ma__row">
              <span className="ww-jg__itemtext">
                <span>{account.name}</span>
                {account.note && <L>{account.note}</L>}
              </span>
              <span className="ww-ma__sum">{account.sum} ›</span>
            </span>
          ))}
        </div>
      </div>
      <div className="ww-ma__col">
        <Buttons items={['Expense', 'Transfer', 'Income', 'Balance']} />
        <div className="ww-ma__card ww-ma__card--list">
          {PAYMENTS.map((row) => (
            <span key={row.what} className="ww-ma__row">
              <span className="ww-jg__itemtext">
                <span>{row.what}</span>
                <L>{row.kind}</L>
              </span>
              <span className="ww-ma__sum">{row.sum}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  </Sub>
);

/** The tour: the overview, each subpage in turn, and back to the overview to stay. */
const MONEY_TOUR: { path: string; page: () => JSX.Element }[] = [
  { path: 'money/spending', page: MoneyBudget },
  { path: 'money/income', page: MoneyIncome },
  { path: 'money/accounts', page: MoneyAccounts },
];
const TOUR_MS = 3200; // how long each page of a tour stays up

const Money = ({ sub = 0 }: { sub?: number }) => {
  const SubPage = sub > 0 ? MONEY_TOUR[sub - 1].page : null;
  return SubPage ? <SubPage key={sub} /> : <MoneyOverview />;
};

/* ─── Supplies ────────────────────────────────────────────────────────────── */

/** His real shelf, read off the product on 14.11.2026 (names, counts, paces and the
 *  agent's own reasoning, translated) with his own photos (src/assets/supplies/). */
type Supply = { name: string; photo: string; stock: string; pace?: string; order?: string; due?: boolean };
const WATER: Supply = {
  name: 'Still mineral water · Morshynska',
  photo: waterPhoto,
  stock: '12 pcs · 1.5 L',
  pace: '~5.3 a day · enough for ~1 day, until 15 Nov',
  order: 'Order today · the deadline was 12 Nov',
  due: true,
};
const GRANOLA: Supply = {
  name: 'Granola with nuts · Good morning, Granola',
  photo: granolaPhoto,
  stock: '5 pcs · 330 g',
  pace: '~1 in 3 days · enough for ~12 days, until 26 Nov',
  order: 'Order by 23 Nov',
};
/** The one the phone adds, in the mobile frame. */
const TABLETS: Supply = {
  name: 'Dishwasher tablets · Finish Powerball',
  photo: tabletsPhoto,
  stock: '1 pc',
  pace: 'no pace yet — counted from the first «opened»',
};

function SupplyCard({ item }: { item: Supply }) {
  return (
    <div className={`ww-ma__card ww-ma__card--slim${item.due ? ' ww-ma__card--due' : ''}`}>
      <div className="ww-jg__item">
        <img className="ww-ma__supplyphoto" src={item.photo} alt="" />
        <span className="ww-jg__itemtext">
          <span className="ww-jg__itemname">{item.name}</span>
          <L tone="ink">in stock {item.stock}</L>
          {item.pace && <span className="ww-ma__sub">{item.pace}</span>}
          {item.order && <L tone={item.due ? 'danger' : 'time'}>{item.order}</L>}
        </span>
      </div>
      <L>opened · the open one is finished · bought · recount</L>
    </div>
  );
}

/** `phone`: the phase of the mobile frame's animation (undefined on the plain
 *  frame) — the page makes room for the phone, and at phase 3 the item the phone
 *  added is on the shelf here too. */
/* — …and ordering: the «To buy» tab, and the agent filling a Silpo cart from it — */

/**
 * How ordering really works in the product (read on 14.11.2026 off
 * apps/web/src/routes/{zapasy,shopping,supplies}.tsx, the live «Купити» tab and the
 * `errands:silpo` / `errands:silpo-restock` skills) — nothing here is guessed:
 *   - YES on a reorder proposal puts the purchase on the «To buy» list («ТАК puts
 *     the purchase into «Купити», and ticking it there restocks the supply»);
 *   - «To buy» is a list by SHOP — sections «Silpo», «No shop» — of plain
 *     checkbox rows, bought ones struck through and sunk;
 *   - under «Silpo» the agent leaves «Time to rebuy» chips: dashed, unfilled, each
 *     with its argument («last 43 days ago · usually every 3 days»), a + to take it
 *     and a × to dismiss. They come from his in-store RECEIPTS, read through the
 *     chain's own MCP connector, on a recurring task every three days;
 *   - the cart is assembled ON REQUEST, never on a schedule (it is one object,
 *     shared with the Silpo app on his phone): a task, in which the agent reads the
 *     list and the name→article links, settles a slot, finds each line, adds it,
 *     reads the cart back — and hands over a checkout link as the task's button;
 *   - the connector canNOT place an order (no checkout tool among its 42): «the
 *     agent fills the cart, Yarik pays».
 * The chips' names and cadences are his real ones; the tool names are the real ones.
 */
const REBUY = [
  { name: 'Yogurt Halychyna Karpatskyi, no sugar, 2.2%', why: 'last 35 days ago · usually every 4 days' },
  { name: 'Milk chocolate Novi with whole hazelnuts', why: 'last 36 days ago · usually every 3 days' },
  { name: 'Blueberries, Silpo bowl', why: 'last 43 days ago · usually every 3 days' },
];
const NO_SHOP = ['Red pencil / pen', 'Small bags', 'Mop cloth'];
/** The cart is four lines of his REAL order of 13.11.2026 (№ …244, read through the
 *  connector's `silpo_get_my_online_orders`): the names, the prices and the pack
 *  sizes (`displayRatio`) are the catalogue's own (names shortened to fit a phone),
 *  the quantities his — only the
 *  Gouda is 2 here where he took 4. A self-pickup cart carries a flat 9 ₴ service
 *  fee. No product pictures: they are the chain's, so the rows carry a plain tile. */
const CART: { list: string; name: string; qty: number; pack: string; price: number; tile: string }[] = [
  { list: 'Eggs', name: 'Eggs «Yasensvit»', qty: 1, pack: '15 pcs', price: 114.45, tile: 'eggs' },
  { list: 'Sliced Gouda', name: 'Gouda Veldhuyzen Kaas, sliced', qty: 2, pack: '150 g', price: 119, tile: 'cheese' },
  { list: 'Non-alcoholic beer', name: 'Stella Artois, non-alcoholic', qty: 8, pack: 'can', price: 61.99, tile: 'beer' },
  { list: REBUY[0].name, name: 'Yogurt «Halychyna», no sugar', qty: 4, pack: '300 g', price: 35.99, tile: 'yogurt' },
];
const SERVICE_FEE = 9;
const money = (n: number) => n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const GOODS_TOTAL = CART.reduce((sum, line) => sum + line.qty * line.price, 0);
const CART_TOTAL = GOODS_TOTAL + SERVICE_FEE;
const CART_PIECES = CART.reduce((sum, line) => sum + line.qty, 0);

/** the list and its chips · I take a chip · the agent fills the cart · the cart is
 *  ready, the phone offers the button · I tap it: the Silpo app, on its cart */
const SILPO_MS = (() => {
  const filling = 2000 + 1600;
  const ready = filling + 2400; // the agent works out of sight
  return [0, 2000, filling, ready, ready + 3000] as const;
})();

const Tick = ({ name, bought = false, fresh = false }: { name: string; bought?: boolean; fresh?: boolean }) => (
  <span className={`ww-ma__tick${bought ? ' ww-ma__tick--bought' : ''}${fresh ? ' ww-jg__arrive ww-ma__tick--fresh' : ''}`}>
    <span className="ww-ma__tickbox" aria-hidden="true">
      {bought ? '✓' : ''}
    </span>
    {name}
  </span>
);

/** The «Silpo» section of the list, as both the big screen and the phone draw it. */
function SilpoList({ taken, tapChip, chips }: { taken: boolean; tapChip: boolean; chips: number }) {
  return (
    <>
      <span className="ww-ma__row">
        <L>⌄ Silpo</L>
        <L>{taken ? CART.length : CART.length - 1}</L>
      </span>
      {CART.slice(0, -1).map((line) => (
        <Tick key={line.list} name={line.list} />
      ))}
      {taken && <Tick name={REBUY[0].name} fresh />}
      {chips > 0 && <L tone="time">✦ Time to rebuy</L>}
      {REBUY.slice(taken ? 1 : 0, (taken ? 1 : 0) + chips).map((chip, i) => (
        <span key={chip.name} className={`ww-ma__chip${tapChip && i === 0 ? ' ww-ma__tap' : ''}`}>
          <span className="ww-ma__chipplus" aria-hidden="true">
            +
          </span>
          <span className="ww-jg__itemtext">
            <span>{chip.name}</span>
            <L>{chip.why}</L>
          </span>
          <span aria-hidden="true">×</span>
        </span>
      ))}
    </>
  );
}

function SuppliesToBuy({ phase }: { phase: number }) {
  const taken = phase >= 1; // the first chip is on the list
  return (
    <Page icon="supplies" name="Supplies">
      <div className="ww-ma__beside ww-ma__beside--phone">
        <span className="ww-jg__seg ww-ma__tabs">
          <span>Flat</span>
          <span>Country house</span>
          <span className="ww-jg__seg--on">To buy</span>
        </span>
        <div className="ww-ma__cols">
          <div className="ww-ma__col">
            <SilpoList taken={taken} tapChip={phase === 0} chips={2} />
          </div>
          <div className="ww-ma__col">
            {/* the cart is filled in the background: no session, no report on the page */}
            <span className="ww-ma__row">
              <L>⌄ No shop</L>
              <L>0</L>
            </span>
            {NO_SHOP.map((name) => (
              <Tick key={name} name={name} bought />
            ))}
          </div>
        </div>
      </div>
    </Page>
  );
}

/** The phone beside it: the same list in his pocket — and, once the cart is ready,
 *  one button that opens the Silpo app on that cart (the connector returns a
 *  `checkoutMobileLink`, labelled «Оформити в застосунку»). The app's screen is drawn
 *  after three screenshots of his own phone (14.11.2026): a pale lavender ground,
 *  white sheets with big radii, «← Кошик» with a slot pill beside it, order rows as
 *  thumbnail · name · «36 - 1,5л» · bold price · a heart · a blue square «+», and one
 *  blue pill button at the foot. All of it translated into English at his word. He
 *  showed an EMPTY cart and a placed order, so a filled cart is those two combined. */
function SilpoPhone({ phase }: { phase: number }) {
  return (
    <div className="ww-ma__phone ww-jg__arrive">
      <div className="ww-jg ww-jg--phone">
        {phase < 4 ? (
          <>
            <span className="ww-ma__phonebar">
              <L tone="ink">9:41</L>
              <L>myclaw.app</L>
            </span>
            <div className="ww-ma__phonepage">
              <span className="ww-jg__panelhead">
                <Ico name="supplies" />
                <span className="ww-jg__panelname">Supplies · To buy</span>
              </span>
              <SilpoList taken={phase >= 1} tapChip={false} chips={phase >= 1 ? 0 : 1} />
              {phase >= 3 && (
                <div className="ww-ma__card ww-ma__card--warn ww-jg__arrive" key="cart">
                  <L tone="time">Silpo cart is ready</L>
                  <span>
                    {CART.length} lines · {CART_PIECES} pcs · {money(CART_TOTAL)} ₴
                  </span>
                  <span className="ww-jg__new ww-ma__tap">Open in the Silpo app ↗</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="ww-sp ww-jg__arrive" key="silpo">
            <span className="ww-sp__status">
              <span>9:41</span>
              <span>●●● ▮</span>
            </span>
            <span className="ww-sp__head">
              <span className="ww-sp__title">← Cart</span>
              <span className="ww-sp__slot">
                Tomorrow
                <br />
                from 09:30 ›
              </span>
            </span>
            <span className="ww-sp__sheet">
              <span className="ww-sp__pickup">
                <strong>Self-pickup</strong>
                <span className="ww-sp__dim">Tomorrow, 09:30–10:00</span>
              </span>
              {CART.map((line) => (
                <span key={line.name} className="ww-sp__line">
                  <span className={`ww-sp__tile ww-sp__tile--${line.tile}`} aria-hidden="true" />
                  <span className="ww-sp__name">
                    {line.name}
                    <span>
                      {line.qty} - {line.pack} · <strong>{money(line.qty * line.price)} ₴</strong>
                    </span>
                  </span>
                  <span className="ww-sp__heart" aria-hidden="true">
                    ♡
                  </span>
                  <span className="ww-sp__plus" aria-hidden="true">
                    +
                  </span>
                </span>
              ))}
              <span className="ww-sp__sums">
                <span>
                  Service fee <span>{money(SERVICE_FEE)} ₴</span>
                </span>
                <strong>
                  To pay <span>{money(CART_TOTAL)} ₴</span>
                </strong>
              </span>
            </span>
            <span className="ww-sp__pay">Place the order</span>
          </div>
        )}
      </div>
    </div>
  );
}

const Supplies = ({ phone, silpo }: { phone?: number; silpo?: number }) =>
  silpo !== undefined ? <SuppliesToBuy phase={silpo} /> : <SuppliesShelf phone={phone} />;

const SuppliesShelf = ({ phone }: { phone?: number }) => (
  <Page icon="supplies" name="Supplies">
    <div className={phone === undefined ? 'ww-ma__beside' : 'ww-ma__beside ww-ma__beside--phone'}>
      <span className="ww-jg__seg ww-ma__tabs">
        <span>Flat</span>
        <span className="ww-jg__seg--on">Country house · 1</span>
        <span>To buy</span>
      </span>
      <L>Time to reorder</L>
      <div className="ww-ma__card ww-ma__card--warn">
        <span className="ww-jg__itemname">Still mineral water · Morshynska · 36 pcs</span>
        <L tone="time">Order today · the deadline was 13 Nov</L>
        <p>
          You use ~5.3 bottles a day (by the daily counts), 12 are left — enough until 15 Nov, so buy today. 36 (six
          packs of six) is about a week at this pace.
        </p>
        <span className="ww-ma__actions">
          <span className="ww-jg__new">Yes</span>
          <L>No</L>
        </span>
      </div>
      {/* on the mobile frame the phone is doing the adding: the form here steps aside */}
      {phone === undefined && (
        <div className="ww-ma__card ww-ma__card--slim">
          <span className="ww-ma__actions ww-ma__actions--spread">
            <Buttons items={['Photo', 'Link', 'Text']} on="Photo" />
            <span className="ww-ma__input">name (optional — I will read it off the photo)</span>
            <span className="ww-jg__new">+ Add to the house</span>
          </span>
        </div>
      )}
      <div className="ww-ma__cols">
        {phone !== undefined && phone >= 3 && (
          <div className="ww-jg__arrive ww-ma__fresh" key="new">
            <SupplyCard item={TABLETS} />
          </div>
        )}
        <SupplyCard item={WATER} />
        {!(phone !== undefined && phone >= 3) && <SupplyCard item={GRANOLA} />}
      </div>
    </div>
  </Page>
);

/* — …and the same app on a phone: photograph a thing, and it is on the shelf — */

/** the form · the camera · recognised · on the shelf */
const PHONE_MS = [0, 1600, 4000, 6400] as const;

function Phone({ phase }: { phase: number }) {
  return (
    <div className="ww-ma__phone ww-jg__arrive">
      <div className="ww-jg ww-jg--phone">
        <span className="ww-ma__phonebar">
          <L tone="ink">9:41</L>
          <L>myclaw.app</L>
        </span>
        {phase === 1 ? (
          <div className="ww-ma__camera" key="camera">
            <img src={tabletsPhoto} alt="A bag of dishwasher tablets in the viewfinder" />
            <span className="ww-ma__flash" aria-hidden="true" />
            <span className="ww-ma__shutter" aria-hidden="true" />
          </div>
        ) : (
          <div className="ww-ma__phonepage ww-jg__arrive" key={phase}>
            <span className="ww-jg__panelhead">
              <Ico name="supplies" />
              <span className="ww-jg__panelname">Supplies</span>
            </span>
            {phase < 3 ? (
              <div className="ww-ma__card">
                <Buttons items={['Photo', 'Link', 'Text']} on="Photo" />
                {phase === 0 ? (
                  <>
                    <span className="ww-ma__button ww-ma__button--wide ww-ma__tap">Take a photo</span>
                    <span className="ww-ma__input">name (optional — I will read it off the photo)</span>
                  </>
                ) : (
                  <>
                    <div className="ww-jg__item">
                      <img className="ww-ma__supplyphoto" src={tabletsPhoto} alt="" />
                      <span className="ww-jg__itemtext">
                        <L tone="agent">Read off the photo</L>
                        <span>{TABLETS.name}</span>
                      </span>
                    </div>
                    <L>In stock now · 1 pc</L>
                  </>
                )}
                <span className={`ww-jg__new${phase === 2 ? ' ww-ma__tap' : ''}`}>+ Add to the house</span>
              </div>
            ) : (
              <>
                <L tone="agent">Added · on the shelf</L>
                <SupplyCard item={TABLETS} />
                <SupplyCard item={WATER} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Books ───────────────────────────────────────────────────────────────── */

const READING = [
  { title: 'The Phoenix Project', author: 'Gene Kim, Kevin Behr', done: 65, note: '4:16 / 6:36 · 65% · 2:20 left' },
  { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', done: 9, note: 'page 52 / 590 · 9%' },
];
const WANT = ['Accelerate', 'Team Topologies', "The Staff Engineer's Path"];
const READ_HEAT = '2 3 2 0 0 1 3  0 2 0 1 3 1 3  3 1 2 0 2 0 0'.split(/\s+/).map(Number);

const Books = () => (
  <Page icon="books" name="Books" aside={<span className="ww-jg__new">+ Book</span>}>
    <div className="ww-ma__cols">
      <div className="ww-ma__col">
        <L>Reading now</L>
        {READING.map((book) => (
          <div key={book.title} className="ww-ma__card">
            <div className="ww-jg__item">
              <span className="ww-jg__swatch ww-jg__swatch--poster ww-ma__poster" aria-hidden="true" />
              <span className="ww-jg__itemtext ww-ma__grow">
                <span className="ww-jg__itemname">{book.title}</span>
                <L>{book.author}</L>
              </span>
              <span className="ww-ma__button">▶ Read</span>
            </div>
            <span className="ww-ma__bar" aria-hidden="true">
              <span style={{ width: `${book.done}%` }} />
            </span>
            <L>{book.note}</L>
          </div>
        ))}
        <L>Want to read · {WANT.length}</L>
        <div className="ww-ma__card ww-ma__card--list">
          {WANT.map((title) => (
            <span key={title} className="ww-ma__row">
              <span>{title}</span>
              <span className="ww-ma__button">▶ Read</span>
            </span>
          ))}
        </div>
      </div>
      <div className="ww-ma__col">
        <L>Read · 3 weeks</L>
        <div className="ww-ma__card">
          <span className="ww-ma__big">
            4 h 59 min <L>137 pages · 26 Oct – 14 Nov</L>
          </span>
          <Heat levels={READ_HEAT} first={26} today={19} />
        </div>
        <div className="ww-ma__card ww-ma__card--warn">
          <L tone="time">Duel of the day</L>
          <span className="ww-jg__itemname">Which of these is better?</span>
          <span className="ww-ma__duel">
            <span>The First 90 Days</span>
            <span>Software Engineering at Google</span>
          </span>
        </div>
      </div>
    </div>
  </Page>
);

/* ─── Movies ──────────────────────────────────────────────────────────────── */

const WATCHING = [
  {
    title: 'Severance',
    year: '2022',
    episode: 'S02E03',
    name: 'Who Is Alive?',
    where: 'Where: Apple TV+ · subscription',
    scores: 'IMDb 8.7 · RT 97% · watched 65%',
    left: '13 / 20 · left: 7',
    verdict: 'Good, would watch again',
    stars: '★★★★☆',
  },
  {
    title: 'Slow Horses',
    year: '2022',
    episode: 'S04E01',
    name: 'Identity Theft',
    where: 'Where: Apple TV+ · subscription',
    scores: 'IMDb 8.3 · RT 98% · watched 75%',
    left: '18 / 24 · left: 6',
    verdict: 'Great, would recommend',
    stars: '★★★★★',
  },
];

const Movies = () => (
  <Page icon="movies" name="Movies" aside={<span className="ww-jg__new">+ Add</span>}>
    <L>Watching now · series</L>
    <div className="ww-ma__cols">
      {WATCHING.map((show) => (
        <div key={show.title} className="ww-ma__card">
          <div className="ww-jg__item">
            <span className="ww-jg__swatch ww-jg__swatch--poster ww-ma__poster" aria-hidden="true" />
            <span className="ww-jg__itemtext">
              <span className="ww-jg__itemname">{show.title}</span>
              <L>{show.year}</L>
            </span>
          </div>
          <span className="ww-jg__episode">
            <span className="ww-jg__box" aria-hidden="true" />
            <L>{show.episode}</L>
            <span className="ww-ma__grow">{show.name}</span>
            <L>Watched</L>
          </span>
          <L>{show.where}</L>
          <L>{show.scores}</L>
          <L>⌄ {show.left}</L>
          <span className="ww-jg__stars">
            <L>{show.verdict}</L>
            <span aria-hidden="true">{show.stars}</span>
          </span>
        </div>
      ))}
    </div>
  </Page>
);

/* ─── Health ──────────────────────────────────────────────────────────────── */

type Med = { name: string; how: string; last: string; doses: boolean[] };
const PROFILES: { who: string; age?: string; visit?: string; meds: Med[] }[] = [
  {
    who: 'Me',
    meds: [
      { name: 'Vitamin D', how: '2000 IU', last: 'not taken since Tuesday, 3 Nov', doses: [false] },
      { name: 'Magnesium', how: '2 tablets', last: 'last one 9 h 40 min ago', doses: [true, false, false] },
    ],
  },
  {
    who: 'Mom',
    age: '67',
    visit: 'Next visit: cardiologist, 16 Nov at 10:30',
    meds: [
      { name: 'Blood pressure pill', how: '5 mg · in the morning', last: 'taken today, 08:10', doses: [true] },
      { name: 'Eye drops', how: 'right eye · 4 a day', last: '3 h ago', doses: [true, true, false, false] },
    ],
  },
];

const Health = () => (
  <Page icon="health" name="Health">
    <div className="ww-ma__cols">
      <div className="ww-ma__col">
        {PROFILES.map((profile) => (
          <div key={profile.who} className="ww-ma__card ww-ma__card--flush">
            <span className="ww-ma__profile">
              <span className="ww-ma__who">
                {profile.who} {profile.age && <L>{profile.age}</L>}
              </span>
              {profile.visit && <span className="ww-ma__sub">{profile.visit}</span>}
              <span className="ww-ma__sub">Medicines stocked until 13 Nov</span>
            </span>
            {profile.meds.map((med) => (
              <span key={med.name} className="ww-ma__row ww-ma__row--pad">
                <span className="ww-jg__itemtext">
                  <span>{med.name}</span>
                  <L>
                    {med.how} · {med.last}
                  </L>
                </span>
                <span className="ww-jg__doses" aria-hidden="true">
                  {med.doses.map((taken, i) => (
                    <span key={i} className={taken ? 'ww-jg__dose ww-jg__dose--taken' : 'ww-jg__dose'} />
                  ))}
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
      <div className="ww-ma__col">
        <div className="ww-ma__card">
          <span className="ww-ma__row">
            <L>Water today</L>
            <L>goal 2 L</L>
          </span>
          <span className="ww-ma__big">
            6 <L>/ 9 sips by now · ≈1.2 L</L>
          </span>
          <span className="ww-ma__bar" aria-hidden="true">
            <span style={{ width: '60%' }} />
          </span>
          <span className="ww-ma__sub">A little behind the pace for 2 L a day</span>
          <span className="ww-ma__actions">
            <span className="ww-jg__new">Sip</span>
            <span className="ww-ma__button">Coffee</span>
            <span className="ww-ma__button">Sweet drink</span>
          </span>
        </div>
        <L>A journal, not medical advice.</L>
      </div>
    </div>
  </Page>
);

/* ─── Nanny ───────────────────────────────────────────────────────────────── */

const THIS_WEEK = [
  { day: 'Mo', date: 9, sum: '2 400' },
  { day: 'Tu', date: 10, sum: '2 400' },
  { day: 'We', date: 11, sum: '2 400' },
  { day: 'Th', date: 12, sum: '2 400' },
  { day: 'Fr', date: 13, sum: '2 400' },
  { day: 'Sa', date: 14, today: true },
  { day: 'Su', date: 15, off: true },
];
const NEXT_WEEK = [16, 17, 18, 19, 20, 21, 22];
const NANNY_ROWS = [
  { what: 'Nanny', when: '13 Nov', sum: '−8 200 UAH' },
  { what: "Nanny's expense", when: '13 Nov · balance 5 780 UAH', sum: '+75 UAH', back: true },
  { what: "Nanny's expense", when: '12 Nov · balance 3 380 UAH', sum: '+950 UAH', back: true },
];

const Nanny = () => (
  <Page icon="nanny" name="Nanny" aside={<L>240 UAH / hour</L>}>
    <div className="ww-ma__cols ww-ma__cols--wide">
      <div className="ww-ma__col">
        <span className="ww-ma__row">
          <L>This week</L>
          <L>12 000 UAH</L>
        </span>
        <span className="ww-ma__week">
          {THIS_WEEK.map((cell) => (
            <span
              key={cell.date}
              className={`ww-ma__weekday${cell.sum ? ' ww-ma__weekday--worked' : ''}${cell.today ? ' ww-ma__weekday--today' : ''}${
                cell.off || cell.today ? ' ww-ma__weekday--off' : ''
              }`}
            >
              <L>{cell.day}</L>
              <span>{cell.date}</span>
              <L>{cell.sum ?? '·'}</L>
            </span>
          ))}
        </span>
        <L>Next week</L>
        <span className="ww-ma__week">
          {NEXT_WEEK.map((date, i) => (
            <span key={date} className={`ww-ma__weekday${i > 4 ? ' ww-ma__weekday--off' : ''}`}>
              <L>{['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'][i]}</L>
              <span>{date}</span>
              <L>·</L>
            </span>
          ))}
        </span>
        <L>Payments</L>
        <div className="ww-ma__card ww-ma__card--list">
          {NANNY_ROWS.map((row, i) => (
            <span key={i} className="ww-ma__row">
              <span className="ww-jg__itemtext">
                <span>{row.what}</span>
                <L>{row.when}</L>
              </span>
              <span className={row.back ? 'ww-ma__sum ww-ma__sum--back' : 'ww-ma__sum'}>{row.sum}</span>
            </span>
          ))}
        </div>
      </div>
      <div className="ww-ma__col">
        <div className="ww-ma__card">
          <L>Overpaid</L>
          <span className="ww-ma__big ww-ma__big--good">−28 UAH</span>
          <L>Settle up · + add an expense</L>
          <L>— the nanny owes</L>
        </div>
        <div className="ww-ma__card">
          <L>Planned (30 days)</L>
          <span className="ww-ma__big">
            48 000 UAH <L>200 h</L>
          </span>
        </div>
        <div className="ww-ma__card">
          <L>Cash (UAH)</L>
          <span className="ww-ma__big">3 400 UAH</span>
        </div>
      </div>
    </div>
  </Page>
);

/* ─── Threat forecast ─────────────────────────────────────────────────────── */

/** The 21-day ribbon: one cell a slot, coloured by what happened in it. */
const RIBBON = 'mmmmommmmmmmoomvmmmmmmmmommmoommmmmmvommmmmmmmommmmmoommmmvmmm'.split('');
const CLASSES = [
  {
    name: 'Attack drones',
    level: 2,
    why: 'MID: a third wave in three hours — at 22:42 a group passed east of the city. The channels agree on the course; no hits confirmed.',
    marks: 'not guessed 13 times of 63',
  },
  {
    name: 'Cruise missiles',
    level: 2,
    why: 'MID: the 21:17 post names three carriers at sea, a first this week. No launches; the usual window is after 03:00.',
    marks: 'not guessed 4 times of 63',
  },
];
const LEVELS = ['Low', 'Medium', 'High', 'Very high'];

const Ribbon = ({ cells = RIBBON }: { cells?: string[] }) => (
  <>
    <span className="ww-jg__ribbon" aria-hidden="true">
      {cells.map((cell, i) => (
        <span key={i} className={`ww-jg__cell ww-jg__cell--${cell}`} />
      ))}
    </span>
    <span className="ww-jg__ribbonlegend ww-jg__label">
      <span>21 days ago</span>
      <span>now</span>
    </span>
  </>
);

const Threat = () => (
  <Page icon="alert" name="Threat forecast" aside={<L>air threat for the next 24 hours</L>}>
    <div className="ww-ma__card ww-ma__card--warn ww-ma__card--slim">
      <span className="ww-ma__row">
        <span className="ww-jg__itemtext">
          <L>Where you are now</L>
          <span>Podilskyi district, Kyiv</span>
        </span>
        <L tone="danger">● Alert · 34 min</L>
      </span>
    </div>
    <div className="ww-ma__cols ww-ma__cols--wide">
      <div className="ww-ma__col">
        <div className="ww-ma__card ww-ma__card--warn">
          <span className="ww-ma__row">
            <span className="ww-jg__itemname">Kyiv</span>
            <L>assessment prepared 13 Nov at 23:21</L>
          </span>
          <Ribbon />
        </div>
        {CLASSES.map((weapon) => (
          <div key={weapon.name} className="ww-ma__card">
            <span className="ww-ma__row">
              <span className="ww-jg__itemname">{weapon.name}</span>
              <L tone="time">{LEVELS[weapon.level - 1]}</L>
            </span>
            <span className="ww-ma__level" aria-hidden="true">
              {LEVELS.map((level, i) => (
                <span key={level} className={i < weapon.level ? 'ww-ma__level--on' : undefined} />
              ))}
            </span>
            <p>{weapon.why}</p>
            <L>{weapon.marks}</L>
          </div>
        ))}
      </div>
      <div className="ww-ma__col">
        <L>Alert map</L>
        <svg className="ww-ma__alertmap" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <rect width="100" height="100" className="ww-ma__mapnight" />
          <path className="ww-ma__region" d="M-5 20 L30 12 L48 26 L40 48 L12 52 L-5 44Z" />
          <path className="ww-ma__region" d="M48 26 L78 18 L105 30 L105 58 L70 60 L40 48Z" />
          <path className="ww-ma__region ww-ma__region--alert" d="M12 52 L40 48 L70 60 L62 86 L30 92 L8 78Z" />
          <path className="ww-ma__region" d="M70 60 L105 58 L105 100 L62 100 L62 86Z" />
          <circle className="ww-ma__here" cx="42" cy="66" r="3" />
        </svg>
      </div>
    </div>
  </Page>
);

/* ─── Home ────────────────────────────────────────────────────────────────── */

/** The cards on the floor plan: where (in % of the plan), what, and its reading. */
const DEVICES: { at: [number, number]; name: string; value: string; note?: string; bad?: boolean }[] = [
  { at: [8, 8], name: 'Power', value: 'On · 5 h', note: 'outage schedule not updated' },
  { at: [52, 6], name: 'Internet', value: '99.9% uptime' },
  { at: [10, 40], name: 'Power station · hall', value: '100%' },
  { at: [50, 36], name: 'Backup router', value: 'Poor · RSRP −104', note: 'restarted 1 day ago', bad: true },
  { at: [10, 70], name: 'Power station · study', value: '99%' },
  { at: [38, 72], name: 'Camera', value: 'Front door' },
  { at: [66, 70], name: 'Who is home?', value: 'Nobody detected' },
];

const Home = () => (
  <Page icon="home" name="Home">
    <Buttons items={['Flat', 'Rental', 'Country house']} on="Country house" />
    <span className="ww-ma__actions">
      <L>Rent · 1 000 USD a month · on the 20th</L>
      <L>Address for routes · 14 Sadova St ✎</L>
    </span>
    <div className="ww-ma__plan">
      {DEVICES.map((device) => (
        <div key={device.name} className="ww-ma__device" style={{ left: `${device.at[0]}%`, top: `${device.at[1]}%` }}>
          <L>{device.name}</L>
          <span className={device.bad ? 'ww-ma__reading ww-ma__reading--bad' : 'ww-ma__reading'}>{device.value}</span>
          {device.note && <L>{device.note}</L>}
        </div>
      ))}
    </div>
    <L>Drag a card with the cursor; on a touch screen press «Arrange the cards» first.</L>
  </Page>
);

/* ─── Routes ──────────────────────────────────────────────────────────────── */

const Weather = ({ temp, air, when }: { temp: string; air: string; when: string }) => (
  <span className="ww-ma__weather">
    <span>
      {temp} · partly cloudy · air {air} · pollen low
    </span>
    <L>{when}</L>
  </span>
);

const Stop = ({ kind, time, where, children }: { kind: string; time: string; where: string; children?: ReactNode }) => (
  <span className="ww-ma__stop">
    <L>{kind}</L>
    <span className="ww-ma__stoptime">
      <span>{time}</span> <span className="ww-ma__sub">{where}</span>
    </span>
    {children}
  </span>
);

const Routes = () => (
  <Page icon="routes" name="Routes">
    <div className="ww-ma__cols">
      <div className="ww-ma__col">
        <div className="ww-ma__card ww-ma__card--grow">
          <L>Now</L>
          <div className="ww-ma__map">
            <RouteMap bare pick={1} />
          </div>
          <L>14 min ago · ±300 m</L>
          <span className="ww-ma__actions">
            <span className="ww-jg__pill ww-jg__pill--time">09:40</span>
            <span>Car service — AutoHub Podil</span>
          </span>
        </div>
      </div>
      <div className="ww-ma__col">
        <L>The next 24 hours</L>
        <div className="ww-ma__card">
          <span className="ww-jg__itemname">Car service — AutoHub Podil</span>
          <span className="ww-ma__sub">leave in 35 min</span>
          <span className="ww-ma__button">Go in Google Maps ↗</span>
          <Stop kind="Leave" time="09:12" where="current location · 14 min ago">
            <Weather temp="4°" air="good · 20" when="Forecast for 09:00 — when you leave" />
            <Buttons items={['on foot 96 min', 'transit 41 min', 'car 22 min']} on="car 22 min" />
          </Stop>
          <Stop kind="Arrive" time="09:34" where="AutoHub Podil, 12 Kyrylivska St" />
          <Stop kind="Leave" time="10:00" where="AutoHub Podil, 12 Kyrylivska St">
            <Buttons items={['on foot 70 min', 'transit 24 min', 'car 16 min']} on="transit 24 min" />
          </Stop>
          <Stop kind="Arrive" time="10:24" where="the office" />
        </div>
      </div>
    </div>
  </Page>
);

/* ─── Sleep ───────────────────────────────────────────────────────────────── */

/** Fourteen nights: when he fell asleep and woke, in hours after 20:00. */
const NIGHTS: [number, number][] = [
  [5.4, 13.2], [5.1, 13.5], [5.8, 13.0], [4.6, 12.4], [5.3, 13.6], [5.9, 14.0], [6.0, 13.3],
  [4.8, 12.9], [5.2, 12.2], [5.6, 13.4], [5.0, 13.1], [6.1, 13.8], [5.3, 12.4], [5.4, 13.7],
];
const SCORES = [
  { date: 'Thu 12 Nov', span: '01:21 → 09:45', score: 57, sleep: ['4 h 45 min', 'too little', 34], steady: ['±16 min', 'steady', 82], pauses: ['12 min', 'pauses', 88] },
  { date: 'Wed 11 Nov', span: '02:05 → 09:00', score: 85, sleep: ['6 h 45 min', 'too little', 78], steady: ['±27 min', 'drifting', 70], pauses: ['10 min', 'pauses', 90] },
] as const;

const Sleep = () => (
  <Page icon="sleep" name="Sleep">
    <Buttons items={['Me', 'Kid']} on="Me" />
    <span className="ww-ma__actions">
      <span className="ww-jg__itemname">☀ Awake</span>
      <span className="ww-ma__sub">up at 09:45 · 4 h 45 min last night</span>
    </span>
    <div className="ww-ma__cols">
      <div className="ww-ma__card">
        <L>Regularity · 14 days · a column is a day, 20:00 to 20:00</L>
        <svg className="ww-ma__nights" viewBox="0 0 140 100" preserveAspectRatio="none" aria-hidden="true">
          {NIGHTS.map(([from, to], i) => (
            <g key={i}>
              <rect className="ww-ma__nightcol" x={i * 10 + 1} y="0" width="8" height="100" />
              <rect className="ww-ma__nightbar" x={i * 10 + 1} y={(from / 24) * 100} width="8" height={((to - from) / 24) * 100} />
            </g>
          ))}
        </svg>
        <span className="ww-jg__ribbonlegend ww-jg__label">
          <span>31 Oct</span>
          <span>13 Nov</span>
        </span>
      </div>
      <div className="ww-ma__card">
        <L>Sleep score</L>
        {SCORES.map((night) => (
          <span key={night.date} className="ww-ma__score">
            <L>
              {night.date} · {night.span}
            </L>
            <span className="ww-ma__big">{night.score}</span>
            {[night.sleep, night.steady, night.pauses].map(([value, word, fill]) => (
              <span key={word} className="ww-ma__meter">
                <span className="ww-ma__bar ww-ma__bar--slate" aria-hidden="true">
                  <span style={{ width: `${fill}%` }} />
                </span>
                <span>{value}</span>
                <L>{word}</L>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  </Page>
);

/* ─── Sport ───────────────────────────────────────────────────────────────── */

const HOURS = [1, 1, 2, 0, 0, 0, 1, 1, 0, 2, 3, 3, 2, 3, 3, 3, 0, 4, 0, 14, 4, 4, 9, 0];
const STEP_HEAT = '3 2 2 3 3 3 3  1 3 2 2 2 2 2  2 2 2 2 2 0 0'.split(/\s+/).map(Number);
const WEEKS = [5, 0, 0, 0, 0, 0, 0, 0];

const Sport = () => (
  <Page icon="sport" name="Sport">
    <div className="ww-ma__cols">
      <div className="ww-ma__card">
        <L>Today</L>
        <span className="ww-ma__sub">no sync yet today — the last data is from 13 Nov · synced 2 h ago</span>
        <span className="ww-ma__big">
          5 243 <L>steps</L>
        </span>
        <span className="ww-ma__bar ww-ma__bar--ochre" aria-hidden="true">
          <span style={{ width: '52%' }} />
        </span>
        <L>4 757 more to 10 000</L>
        <span className="ww-ma__stats">
          <span className="ww-jg__itemtext">
            <L>Distance</L>
            <span>3.5 km</span>
          </span>
          <span className="ww-jg__itemtext">
            <L>Calories today</L>
            <span>601 kcal</span>
          </span>
        </span>
        <span className="ww-ma__bars" aria-hidden="true">
          {HOURS.map((steps, i) => (
            <span key={i} style={{ height: `${(steps / 14) * 100}%` }} />
          ))}
        </span>
        <L>most active hour 19:00 · 1 283 steps</L>
      </div>
      <div className="ww-ma__col">
        <div className="ww-ma__card">
          <L>Three weeks</L>
          <span className="ww-ma__big">
            8 278 steps a day <L>6 of 19 days ≥ 10 000</L>
          </span>
          <Heat levels={STEP_HEAT} first={26} today={19} />
        </div>
        <div className="ww-ma__card">
          <L>Workouts</L>
          <span className="ww-ma__actions ww-ma__actions--spread">
            <span className="ww-ma__big">
              1 <L>workout in 8 weeks</L>
            </span>
            <span className="ww-ma__bars ww-ma__bars--weeks" aria-hidden="true">
              {WEEKS.map((mins, i) => (
                <span key={i} style={{ height: `${Math.max(4, (mins / 5) * 100)}%` }} />
              ))}
            </span>
          </span>
          <span className="ww-ma__row">
            <span>Treadmill run</span>
            <L>24 Sep · 5 min · 597 m</L>
          </span>
        </div>
      </div>
    </div>
  </Page>
);

/* ─── Music ───────────────────────────────────────────────────────────────── */

const PLAYED = [
  { track: 'Paranoid Android', by: 'Radiohead · OK Computer', when: '2h ago' },
  { track: 'Karma Police', by: 'Radiohead · OK Computer', when: '2h ago' },
  { track: 'Teardrop', by: 'Massive Attack · Mezzanine', when: '2h ago' },
  { track: 'Roads', by: 'Portishead · Dummy', when: '3h ago' },
];
const TOP = [
  { track: 'Glory Box', by: 'Portishead', score: '3.77' },
  { track: 'Angel', by: 'Massive Attack', score: '2.64' },
  { track: 'Idioteque', by: 'Radiohead', score: '2.51' },
];
const PLAY_HEAT = '2 2 2 3 3 2 1  0 3 1 1 1 2 2  2 1 2 2 2 0 0'.split(/\s+/).map(Number);

const Music = () => (
  <Page icon="music" name="Music">
    <div className="ww-ma__cols ww-ma__cols--wide">
      <div className="ww-ma__col">
        <div className="ww-ma__cols">
          <div className="ww-ma__card">
            <L>Listened · 3 weeks</L>
            <span className="ww-ma__big">
              186 tracks <L>12 h 6 min</L>
            </span>
            <Heat levels={PLAY_HEAT} first={26} today={19} />
          </div>
          <div className="ww-ma__card ww-ma__card--warn">
            <span className="ww-ma__row">
              <L tone="time">✕ Duel · songs from the top 20</L>
              <L>listen</L>
            </span>
            <span className="ww-jg__itemname">Which of these is better?</span>
            <span className="ww-ma__duel ww-ma__duel--covers">
              <span>
                <span className="ww-jg__swatch ww-ma__cover ww-ma__cover--a" aria-hidden="true" />
                Glory Box
                <L>Portishead</L>
              </span>
              <span>
                <span className="ww-jg__swatch ww-ma__cover ww-ma__cover--b" aria-hidden="true" />
                Teardrop
                <L>Massive Attack</L>
              </span>
            </span>
            <span className="ww-ma__button ww-ma__button--wide">A draw</span>
          </div>
        </div>
        <L>Top 100 · 96 on the playlist · updated 40 h ago</L>
        <div className="ww-ma__card ww-ma__card--list">
          {TOP.map((row, i) => (
            <span key={row.track} className="ww-ma__row">
              <span className="ww-ma__actions">
                <L>{i + 1}</L>
                <span className="ww-jg__itemtext">
                  <span>{row.track}</span>
                  <L>{row.by}</L>
                </span>
              </span>
              <L>{row.score}</L>
            </span>
          ))}
        </div>
      </div>
      <div className="ww-ma__col">
        <L>The last 20</L>
        <div className="ww-ma__card ww-ma__card--list">
          {PLAYED.map((row) => (
            <span key={row.track} className="ww-ma__row">
              <span className="ww-jg__itemtext">
                <span>{row.track}</span>
                <L>{row.by}</L>
              </span>
              <L>{row.when}</L>
            </span>
          ))}
        </div>
      </div>
    </div>
  </Page>
);

/* ─── Family tree ─────────────────────────────────────────────────────────── */

const FINDINGS = [
  { text: 'Found a brother of great-grandfather Petro: he lived in Lviv, worked on the railway from 1931 and is buried there', kind: 'Recorded', when: '10 days ago' },
  { text: 'Great-grandmother Hanna had a sister, Maria — it was she who came to register the death in 1929', kind: 'Recorded', when: '11 days ago', files: '1 file' },
  { text: 'The village where great-grandfather was born in 1918 was founded in 1901 by settlers from Poltava — and its 1918 parish register survives', kind: 'Recorded', when: '11 Oct' },
  { text: 'An award sheet from November 1944: in a fight near the border he took out a machine-gun crew and brought back its maps', kind: 'Found', when: '11 Oct', files: '1 file' },
];

const Tree = () => (
  <Page icon="tree" name="Family tree">
    <div className="ww-ma__card ww-ma__card--slim">
      <span className="ww-ma__actions">
        <span className="ww-jg__new">Open the tree in Gramps ↗</span>
      </span>
    </div>
    <L>Latest findings</L>
    <Buttons items={['Unread · 44', 'All · 78']} on="Unread · 44" />
    {FINDINGS.map((finding) => (
      <div key={finding.text} className="ww-ma__card ww-ma__card--slim">
        <span className="ww-ma__row">
          <span className="ww-jg__itemtext">
            <span>› {finding.text}</span>
            <L>
              {finding.kind} · Claude Code · {finding.when}
              {finding.files ? ` · ${finding.files}` : ''}
            </L>
          </span>
          <Ico name="check" />
        </span>
      </div>
    ))}
  </Page>
);

/* ─── How one is born: the Coffee miniapp ─────────────────────────────────── */

const BIRTH_ASK_STREAM = ['Read(bag-front.jpg)', 'WebSearch(Funt Coffee Суха Гватемала)', 'Write(coffee-bags.html)'];
const BIRTH_BUILD_STREAM = [
  'Write(packages/db-schema/src/coffee.ts)',
  'Write(apps/web/src/routes/coffee.tsx)',
  'Bash(pnpm --filter web test)',
  'Bash(railway up --ci)',
];
/** asked · the agent works · the artifact · «make it permanent» · the agent builds ·
 *  done, the row is in the sidebar · the app opens the page */
const BIRTH_MS = (() => {
  const worked = 1800 + (BIRTH_ASK_STREAM.length + 1) * STREAM_MS;
  const asked = worked + 2600;
  const building = asked + 1800;
  const built = building + (BIRTH_BUILD_STREAM.length + 1) * STREAM_MS;
  return [0, 1800, worked, asked, building, built, built + 2400] as const;
})();

function CoffeeBirth({ moment, t }: { moment: number; t: number }) {
  const agentHasIt = moment === 1 || moment === 4 || moment === 0 || moment === 3;
  return (
    <div className="ww-jg__page ww-ma__task">
      <span className="ww-jg__title">Keep track of my coffee</span>
      <span className="ww-jg__label">ID 91c4e7a0</span>
      <Fields
        fields={[
          agentHasIt
            ? { label: 'Status', value: 'In progress', tone: 'time' }
            : { label: 'Status', value: 'Paused', tone: 'hold' },
          { label: 'Priority', value: 'Low' },
          { label: 'Assignee', value: agentHasIt ? 'Claude Code' : '@me' },
          { label: 'Created', value: 'Nov 13, 08:40' },
        ]}
      />
      <div className="ww-jg__timeline ww-jg__timeline--fade">
        {moment === 5 && (
          <div className="ww-jg__arrive" key="built">
            <Comment who="Claude Code" tag="Session report" when="now">
              <p>Done: Coffee is a page of its own now — myclaw.app/coffee, and it is in the sidebar.</p>
            </Comment>
          </div>
        )}
        {moment === 4 && <InFlight key="building" lines={BIRTH_BUILD_STREAM} since={BIRTH_MS[4]} t={t} />}
        {moment >= 3 && (
          <div className="ww-jg__arrive" key="permanent">
            <Comment who="@me" when={moment === 3 ? 'now' : '2m ago'} plain>
              <p>
                I like it. <strong>Make this artifact permanent — create a miniapp.</strong>
              </p>
            </Comment>
          </div>
        )}
        {moment >= 2 && (
          <div className="ww-jg__arrive" key="artifact">
            <Comment who="Claude Code" tag="Session report" when={moment === 2 ? 'now' : '5m ago'}>
              <p>Recorded the bag. Here it is — tell me what you think of it right on the card:</p>
              <div className="ww-ma__artifact">
                <BagCard bag={BAGS[0]} rated={false} />
              </div>
            </Comment>
          </div>
        )}
        {moment === 1 && <InFlight key="asking" lines={BIRTH_ASK_STREAM} since={BIRTH_MS[1]} t={t} />}
        <Comment who="@me" when={moment < 2 ? 'now' : '6m ago'} plain>
          <p>I opened a new bag of coffee. Keep track of my bags and of what I think of each.</p>
          <Thumb src={dryGuatemala} alt="A bag of Funt Coffee, Dry Guatemala" />
        </Comment>
      </div>
    </div>
  );
}

/* ─── The slide ───────────────────────────────────────────────────────────── */

type Miniapp = {
  name: string;
  icon: IconName;
  path: string;
  section: string;
  page: (props: { sub?: number; phone?: number; silpo?: number; t?: number }) => JSX.Element;
  /** subpages the page walks through by itself before settling back on its overview */
  tour?: { path: string }[];
};
/** In the order they are revealed — which is also the order of the sidebar here,
 *  so every click appends a row at its foot. The sections are the product's own. */
const MINIAPPS: Miniapp[] = [
  { name: 'Coffee', icon: 'coffee', path: 'coffee', section: 'Daily', page: Coffee },
  { name: 'Money', icon: 'money', path: 'money', section: 'Daily', page: Money, tour: MONEY_TOUR },
  { name: 'Supplies', icon: 'supplies', path: 'supplies', section: 'Daily', page: Supplies },
  { name: 'Books', icon: 'books', path: 'books', section: 'Daily', page: Books },
  { name: 'Movies', icon: 'movies', path: 'movies', section: 'Daily', page: Movies },
  { name: 'Health', icon: 'health', path: 'health', section: 'Daily', page: Health },
  { name: 'Nanny', icon: 'nanny', path: 'nanny', section: 'Daily', page: Nanny },
  { name: 'Threat forecast', icon: 'alert', path: 'threats', section: 'Miniapps', page: Threat },
  { name: 'Home', icon: 'home', path: 'home', section: 'Miniapps', page: Home },
  { name: 'Routes', icon: 'routes', path: 'routes', section: 'Miniapps', page: Routes },
  { name: 'Sleep', icon: 'sleep', path: 'sleep', section: 'Miniapps', page: Sleep },
  { name: 'Sport', icon: 'sport', path: 'sport', section: 'Miniapps', page: Sport },
  { name: 'Music', icon: 'music', path: 'music', section: 'Miniapps', page: Music },
  { name: 'Family tree', icon: 'tree', path: 'family-tree', section: 'Reference', page: Tree },
];

/** The slide's frames: one per miniapp — and Supplies has a second, on a phone. */
const FRAMES: { app: number; mobile?: true; silpo?: true }[] = MINIAPPS.flatMap((app, i) =>
  app.name === 'Supplies'
    ? [{ app: i }, { app: i, mobile: true as const }, { app: i, silpo: true as const }]
    : [{ app: i }],
);

/** The sidebar with the first `count` miniapps in it. */
function navOf(count: number): NavGroup[] {
  const groups: NavGroup[] = [{ section: 'Tasks & agents', items: [{ name: 'Tasks', icon: 'tasks' }] }];
  MINIAPPS.slice(0, count).forEach((app) => {
    let group = groups.find((g) => g.section === app.section);
    if (!group) {
      group = { section: app.section, items: [] };
      groups.push(group);
    }
    group.items.push({ name: app.name, icon: app.icon });
  });
  return groups;
}

function Scene({ stage }: { stage: number }) {
  // only the first frame has a clock: it plays the birth of the Coffee page
  const t = useClock(0);
  const born = stage > 1 || t >= BIRTH_MS[6];
  const moment = stage > 1 ? 6 : BIRTH_MS.reduce((m, at, i) => (t >= at ? i : m), 0);
  const frame = FRAMES[stage - 1];
  const current = MINIAPPS[frame.app];
  const CurrentPage = current.page;
  // a page with a tour walks its subpages on a clock of its own, restarted per frame;
  // step 0 and everything after the last subpage is the overview
  const tStage = useClock(stage);
  const step = current.tour ? Math.floor(tStage / TOUR_MS) : 0;
  const sub = current.tour && step >= 1 && step <= current.tour.length ? step : 0;
  // the mobile frame plays on the same per-frame clock
  const phone = frame.mobile ? PHONE_MS.reduce<number>((m, at, i) => (tStage >= at ? i : m), 0) : undefined;
  const silpo = frame.silpo ? SILPO_MS.reduce<number>((m, at, i) => (tStage >= at ? i : m), 0) : undefined;
  useAnimating(
    (stage === 1 && !born) ||
      (silpo !== undefined && silpo < SILPO_MS.length - 1) ||
      (!!current.tour && step <= current.tour.length) ||
      (phone !== undefined && phone < PHONE_MS.length - 1),
  );
  // the row exists from the moment the agent reports it built the page
  const rows = stage === 1 && moment < 5 ? 0 : frame.app + 1;
  const onPage = stage > 1 || born;
  return (
    <>
      <Browser
        url={
          onPage
            ? `myclaw.app/${sub > 0 && current.tour ? current.tour[sub - 1].path : current.path}`
            : 'myclaw.app/tasks/91c4e7a0'
        }
      >
        <App
          active={onPage ? current.name : 'Tasks'}
          fresh={frame.mobile || frame.silpo ? undefined : current.name}
          lit={onPage ? [] : [current.name]}
          nav={navOf(rows)}
          dense
        >
          {onPage ? (
            <CurrentPage key={current.name} sub={sub} phone={phone} silpo={silpo} t={tStage} />
          ) : (
            <CoffeeBirth moment={moment} t={t} />
          )}
        </App>
      </Browser>
      {phone !== undefined && <Phone phase={phone} />}
      {silpo !== undefined && <SilpoPhone phase={silpo} />}
    </>
  );
}

export const MiniappsSlide: SlideDefinition = {
  id: 'improve-miniapps',
  maxRevealStages: FRAMES.length,
  initialRevealStage: 1,
  content: ({ revealStage }) => {
    const stage = Math.min(Math.max(revealStage, 1), FRAMES.length);
    const mobile = !!FRAMES[stage - 1].mobile || !!FRAMES[stage - 1].silpo;
    return (
      <>
        <CornerRings corner="bottom-right" />
        <div className="ww-imp ww-imp--claim">
          <div className="ww-asst__claim ww-asst__claim--great">
            <span className="ww-asst__verdict">
              <span aria-hidden="true">✓</span>
              fixed
            </span>
            <span key={mobile ? 'mobile' : 'miniapps'} className={mobile && FRAMES[stage - 1].silpo ? undefined : 'ww-jg__arrive'}>
              {mobile ? 'also available as a mobile app' : 'artifacts that stay: miniapps'}
            </span>
          </div>
          <Scene stage={stage} />
        </div>
      </>
    );
  },
  notes:
    'An artifact does not have to die with its task. The first frame plays by itself — talk over it: '
    + 'I tell the agent about a new bag of coffee and ask it to keep track; it answers with an '
    + 'artifact — the bag as a card I can rate. And then the sentence that matters: «make this '
    + 'artifact permanent — create a miniapp». The agent writes the table and the page, tests, '
    + 'deploys — watch the sidebar — and Coffee is a page of the app. That is how every one of '
    + 'them was born: a task, an artifact, «keep it». '
    + 'Then one more on every click, and each is the best UX for one corner of my life, written '
    + 'and kept up by the agents working the queue: '
    + '[2] Money — net worth, this month in and out against the budget, the last transactions. It '
    + 'then walks its own subpages by itself, about three seconds each — budget, income, accounts '
    + '— and comes back; keep talking, do not click through it. '
    + '[3] Supplies — what is about to run out, the agent\'s arithmetic, and a yes / no to reorder; '
    + 'under it the shelf itself: what is in stock, at what pace it goes, when to order. '
    + '[click] And the headline changes: it is also a mobile app. Watch the phone — it plays by '
    + 'itself: I open Supplies, photograph a bag of dishwasher tablets, the agent reads the name off '
    + 'the photo, I press Add — and it is on the shelf, on the phone and on the big screen. That is '
    + 'how everything on this page got there: I have never typed a product name. '
    + '[click] And ordering — it plays by itself, on both screens. This is my shopping list, by '
    + 'shop: eggs, sliced Gouda, non-alcoholic beer. Below it, dashed, are the agent\'s proposals: '
    + 'every three days it reads my supermarket RECEIPTS through the chain\'s own MCP connector and '
    + 'notices what I usually buy and have not bought — «yogurt: last 35 days ago, usually every 4 '
    + 'days». One tap takes it. Then, out of sight, the agent fills my real Silpo cart through that '
    + 'connector — finds each line in the catalogue, adds it, reads the cart back. Nothing to '
    + 'watch: on the phone a button simply appears: open in the Silpo app. I tap — and I am in the '
    + 'supermarket\'s own app, on that cart, one button from paying. The agent cannot press that '
    + 'one: the connector has no checkout tool, and I would not want one. '
    + 'Honest: on the slide the cart fills by itself for clarity — in real life I ask for it, '
    + 'never on a schedule, because it is the same cart the app shows and I may be standing at the '
    + 'shelf. The four lines are from my real order of 13 November — real names, prices and pack '
    + 'sizes; the app\'s screen is drawn after my own phone, translated into English — I had an '
    + 'empty cart and a placed order to go by, so a filled cart is those two combined. '
    + '[4] Books — what I read, how far, three weeks as a heatmap, and a duel that ranks my shelf. '
    + '[5] Movies — the next episode to tick, where it streams, my own stars. '
    + '[6] Health — who takes what and whether they took it today, and water. '
    + '[7] Nanny — her week, what I owe her, what she spent. '
    + '[8] Threat forecast — is there an air alert now, 21 days of them, and the next 24 hours per '
    + 'weapon class with the reasoning, from the channels the agent reads. '
    + '[9] Home — the house on a floor plan: power, internet, the batteries. '
    + '[10] Routes — the next 24 hours: when to leave, by what, in what weather. '
    + '[11] Sleep — regularity and a score per night. '
    + '[12] Sport — steps, three weeks, workouts (say it: one in eight weeks). '
    + '[13] Music — what I listen to, and duels that rank my top hundred. '
    + '[14] Family tree — what the agents dug up in the archives this month. '
    + 'There are more: work hours, important dates, my sole-proprietor books, a wall display. '
    + 'None of them is a chat. Every one of them started as a task. So chat is no longer the only '
    + 'UX — it is the one I use when nothing better exists yet. '
    + 'Honest about the picture: recreations of the real pages — their sections and controls are the '
    + 'real ones — with invented data, because the real ones hold my real life. The exception is '
    + 'Coffee: those are my real bags and my own photos of them (the verdicts are sharpened — in '
    + 'real life I have mostly said «OK»). The birth of Coffee is staged; the real page was built '
    + 'the same way, over more than one task.',
};
