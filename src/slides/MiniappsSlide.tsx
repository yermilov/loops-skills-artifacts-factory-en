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
import eggsPhoto from '../assets/silpo/eggs.webp';
import goudaPhoto from '../assets/silpo/gouda.webp';
import stellaPhoto from '../assets/silpo/stella.webp';
import yogurtPhoto from '../assets/silpo/yogurt.webp';
import elegantPuzzleCover from '../assets/books/elegant-puzzle.jpg';
import archModernizationCover from '../assets/books/architecture-modernization.jpg';
import selfishGeneCover from '../assets/books/selfish-gene.jpg';
import platformEngineeringCover from '../assets/books/platform-engineering.png';
import seAtGoogleCover from '../assets/books/software-engineering-at-google.jpg';
import chaosMonkeysCover from '../assets/books/chaos-monkeys.jpg';
import ddiaCover from '../assets/books/ddia.jpg';
import staffEngineersPathCover from '../assets/books/staff-engineers-path.jpg';
import howNotToBeWrongCover from '../assets/books/how-not-to-be-wrong.jpg';
import goodStrategyCover from '../assets/books/good-strategy-bad-strategy.jpg';
import thinkingFastAndSlowCover from '../assets/books/thinking-fast-and-slow.jpg';
import releaseItCover from '../assets/books/release-it.jpg';
import teamTopologiesCover from '../assets/books/team-topologies.jpg';
import makingThingsHappenCover from '../assets/books/making-things-happen.jpg';
import superPumpedCover from '../assets/books/super-pumped.jpg';
import rehearsalPoster from '../assets/movies/the-rehearsal.jpg';
import seeEverythingPoster from '../assets/movies/you-can-see-everything.jpg';
import droneMap from '../assets/threat/drone-map-kyiv.jpg';

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
 *   Coffee · Money · Supplies · Books · Movies · Health ·
 *   Threat forecast · Home · Routes · Sleep · Sport · Music · Family tree.
 * (The app has more — the nanny's hours, work hours, important dates, his
 * sole-proprietor books, a wall display; the notes say so.)
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
 *  fee. The pictures are the catalogue's own (the order's `image` URLs, saved to
 *  src/assets/silpo/ at Yarik's word on 14.11.2026 — the deck must not load them
 *  from images.silpo.ua, it has to work offline). */
const CART: { list: string; name: string; qty: number; pack: string; price: number; photo: string }[] = [
  { list: 'Eggs', name: 'Eggs «Yasensvit»', qty: 1, pack: '15 pcs', price: 114.45, photo: eggsPhoto },
  { list: 'Sliced Gouda', name: 'Gouda Veldhuyzen Kaas, sliced', qty: 2, pack: '150 g', price: 119, photo: goudaPhoto },
  { list: 'Non-alcoholic beer', name: 'Stella Artois, non-alcoholic', qty: 8, pack: 'can', price: 61.99, photo: stellaPhoto },
  { list: REBUY[0].name, name: 'Yogurt «Halychyna», no sugar', qty: 4, pack: '300 g', price: 35.99, photo: yogurtPhoto },
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
                  <img className="ww-sp__tile" src={line.photo} alt="" />
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

/** His real shelf, read on 14.11.2026 off the live page (/books) and `books_list`:
 *  the two books open now with their progress lines as the page prints them, and
 *  the top 13 of «Read · 32» — all nine of his five-star books and the first four
 *  four-star ones, in the page's own order: stars first, then the duel strength
 *  inside a star bucket (the page prints it as a mono number beside the stars —
 *  left out here at Yarik's word), then the finish date. The
 *  list is longer than the card, so it scrolls by itself, slowly, down and back
 *  (CSS, `ww-ma__scroll`; export mode stops it at the top). Subtitles are cut to
 *  fit; the covers are the ones the page shows, saved to src/assets/books/ (never
 *  hot-linked — offline mode). The page's heatmap, queue and duel are left out at
 *  Yarik's word. */
const READING = [
  { title: 'An Elegant Puzzle', author: 'Will Larson · audio', cover: elegantPuzzleCover, done: 69, note: '4:34 / 6:36 · 69% · 2:02 left' },
  {
    title: 'Architecture Modernization',
    author: 'Nick Tune, Jean-Georges Perrin',
    cover: archModernizationCover,
    done: 9,
    note: 'page 42 / 488 · 9%',
  },
];
const READ_TOTAL = 32;
const TOP_BOOKS: { title: string; author: string; when: string; cover: string; stars?: number }[] = [
  { title: 'The Selfish Gene', author: 'Richard Dawkins · audio', when: '24d ago', cover: selfishGeneCover },
  { title: 'Platform Engineering', author: 'Camille Fournier, Ian Nowland', when: '13mo ago', cover: platformEngineeringCover },
  { title: 'Software Engineering at Google', author: 'Titus Winters, Tom Manshreck, Hyrum Wright', when: '35mo ago', cover: seAtGoogleCover },
  { title: 'Chaos Monkeys', author: 'Antonio García Martínez', when: '35mo ago', cover: chaosMonkeysCover },
  { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann, Chris Riccomini', when: '3mo ago', cover: ddiaCover },
  { title: "Staff Engineer's Path", author: 'Tanya Reilly', when: '26d ago', cover: staffEngineersPathCover },
  { title: 'How Not to Be Wrong', author: 'Jordan Ellenberg', when: '35mo ago', cover: howNotToBeWrongCover },
  { title: 'Good Strategy/Bad Strategy', author: 'Richard Rumelt', when: '35mo ago', cover: goodStrategyCover },
  { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', when: '35mo ago', cover: thinkingFastAndSlowCover },
  { title: 'Release It!', author: 'Michael T. Nygard', when: '35mo ago', cover: releaseItCover, stars: 4 },
  { title: 'Team Topologies', author: 'Matthew Skelton, Manuel Pais · audio', when: '27d ago', cover: teamTopologiesCover, stars: 4 },
  { title: 'Making Things Happen', author: 'Scott Berkun', when: '35mo ago', cover: makingThingsHappenCover, stars: 4 },
  { title: 'Super Pumped', author: 'Mike Isaac', when: '35mo ago', cover: superPumpedCover, stars: 4 },
];

const Books = () => (
  <Page icon="books" name="Books" aside={<span className="ww-jg__new">+ Book</span>}>
    <div className="ww-ma__cols ww-ma__cols--books">
      <div className="ww-ma__col">
        <L>Reading now</L>
        {READING.map((book) => (
          <div key={book.title} className="ww-ma__card ww-ma__card--slim">
            <div className="ww-jg__item">
              <img className="ww-ma__bookcover" src={book.cover} alt="" />
              <span className="ww-jg__itemtext ww-ma__grow">
                <span className="ww-ma__row">
                  <span className="ww-jg__itemname ww-ma__clip">{book.title}</span>
                  <span className="ww-ma__button">▶ Read</span>
                </span>
                <L>{book.author}</L>
                <L tone="ink">{book.note}</L>
                <span className="ww-ma__bar" aria-hidden="true">
                  <span style={{ width: `${book.done}%` }} />
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="ww-ma__col">
        <L>Read · {READ_TOTAL}</L>
        <div className="ww-ma__card ww-ma__card--list ww-ma__scroll">
          <span className="ww-ma__scrollbody">
          {TOP_BOOKS.map((book, i) => (
            <span key={book.title} className="ww-ma__row ww-ma__rank">
              <L>{i + 1}</L>
              <img className="ww-ma__bookcover ww-ma__bookcover--sm" src={book.cover} alt="" />
              <span className="ww-jg__itemtext">
                <span className="ww-ma__clip">{book.title}</span>
                <L>
                  {book.author} · {book.when}
                </L>
              </span>
              <span className="ww-ma__rankstars" aria-hidden="true">
                {'★★★★★☆☆☆☆☆'.slice(5 - (book.stars ?? 5), 10 - (book.stars ?? 5))}
              </span>
            </span>
          ))}
          </span>
        </div>
      </div>
    </div>
  </Page>
);

/* ─── Movies ──────────────────────────────────────────────────────────────── */

/** Only the recommendations — the page's «Порада» card (apps/web/src/components/
 *  suggestion-card.tsx, seen live on /movies on 14.11.2026: a ✦ label, the poster,
 *  title, kind · year, the agent's pitch, where it streams, the scores, «Add» / «Not
 *  this»). The FORM is the product's; the two titles are Yarik's own picks for the
 *  room — both by Nathan Fielder, both on his real list — not the two cards that
 *  were pending that day (Everything Everywhere All at Once, Fleabag). So this is
 *  a reconstruction and the notes say so. What is real on them: the posters (saved
 *  to src/assets/movies/), years, where-to-watch and scores as his page shows them,
 *  his 5★ for The Rehearsal and 4★ for the book Bad Blood, the film's premise and
 *  running time (TMDB). The pitches are written for this slide in the agent's
 *  manner: argue from his ratings, name the risk. */
const ADVICE = [
  {
    title: 'The Rehearsal',
    kind: 'Series · 2022',
    poster: rehearsalPoster,
    pitch:
      'Nathan Fielder builds full-size replicas of real places and hires actors, so that ordinary people can ' +
      'rehearse the hardest conversations of their lives — and then it stops being about them. Season two turns ' +
      'the method on airline pilots. You gave it 5★, «would watch again», and Nathan for You is on your list. ' +
      'Two seasons, twelve episodes. The risk: the awkwardness is the point.',
    where: 'Watch: HBO Max',
    scores: 'IMDb 8.5 · 38K · RT 96% · audience 89%',
  },
  {
    title: 'You Can See Everything',
    kind: 'Film · 2026',
    poster: seeEverythingPoster,
    pitch:
      'From Nathan Fielder (The Rehearsal, 5★) and Lance Oppenheim: thirty-four days before prison, Elizabeth ' +
      'Holmes of Theranos invites a sceptical film crew to document her every step. You gave the book Bad Blood ' +
      '4★ — this is the same story with her in the room. The risk: 2 h 55 min, and it is not streaming in ' +
      'Ukraine yet.',
    where: 'Not in Ukraine yet',
    scores: 'RT 100% · Metacritic 95%',
  },
];

const Movies = () => (
  <Page icon="movies" name="Movies" aside={<span className="ww-jg__new">+ Add</span>}>
    <div className="ww-ma__cols ww-ma__cols--even">
      {ADVICE.map((item) => (
        <div key={item.title} className="ww-ma__card ww-ma__card--warn ww-ma__advice">
          <div className="ww-jg__item">
            <img className="ww-ma__bookcover" src={item.poster} alt="" />
            <span className="ww-jg__itemtext">
              <L tone="time">✦ Recommendation</L>
              <span className="ww-ma__advicetitle">{item.title}</span>
              <L>{item.kind}</L>
            </span>
          </div>
          <span className="ww-ma__pitch">{item.pitch}</span>
          <L>{item.where}</L>
          <L>{item.scores}</L>
          <span className="ww-ma__actions">
            <span className="ww-ma__button ww-ma__button--wide ww-ma__button--yes ww-ma__grow">✓ Add</span>
            <span className="ww-ma__button">✕ Not this</span>
          </span>
        </div>
      ))}
    </div>
  </Page>
);

/* ─── Health ──────────────────────────────────────────────────────────────── */

/** Only his own card and the water — read on 14.11.2026 off the live page (/medical)
 *  with `pills_list` and `water_today`, at Yarik's word («show only my pills and
 *  water»). Real: his two scheduled pills, their doses, the «last one … ago» lines
 *  and the dose circles as the page drew them that evening; the water card's
 *  numbers (sips done / due by now, litres, the split by drink, the goal) and its
 *  wording. Left out on purpose: the children's profiles (names, ages, medicines,
 *  doctors) — never to be shown — and his as-needed medicines. */
type Med = { name: string; how?: string; last: string; doses: boolean[] };
const MY_MEDS: Med[] = [
  { name: 'Vitamin D', last: 'not taken since Tuesday, 3 Nov', doses: [false] },
  { name: 'Valerian', how: '2 tablets', last: 'last one 4 h 27 min ago', doses: [true, false, false] },
];
/** litres of the day's 2 L goal, in the order the bar stacks them */
const DRUNK = [
  { kind: 'water', label: 'Water', litres: 0.52 },
  { kind: 'sweet', label: 'Sweet', litres: 0.66 },
  { kind: 'coffee', label: 'Coffee', litres: 0.6 },
];
const WATER_GOAL = 2;
const WATER_BY_NOW = 1.58;

const Health = () => (
  <Page icon="health" name="Health">
    <div className="ww-ma__cols">
      <div className="ww-ma__col">
        <div className="ww-ma__card ww-ma__card--flush">
          <span className="ww-ma__profile">
            <span className="ww-ma__who">Me</span>
          </span>
          {MY_MEDS.map((med) => (
            <span key={med.name} className="ww-ma__row ww-ma__row--pad ww-ma__med">
              <span className="ww-jg__itemtext">
                <span>{med.name}</span>
                {med.how && <L>{med.how}</L>}
                <L>{med.last}</L>
              </span>
              <span className="ww-jg__doses" aria-hidden="true">
                {med.doses.map((taken, i) => (
                  <span key={i} className={taken ? 'ww-jg__dose ww-jg__dose--taken' : 'ww-jg__dose'}>
                    {taken ? '✓' : ''}
                  </span>
                ))}
              </span>
            </span>
          ))}
        </div>
        <L>A journal, not medical advice.</L>
      </div>
      <div className="ww-ma__col">
        <div className="ww-ma__card ww-ma__water">
          <span className="ww-ma__row">
            <L>Water today</L>
            <L>goal {WATER_GOAL} L</L>
          </span>
          <span className="ww-ma__row">
            <span className="ww-ma__big">
              89 <L>/ 79 sips by now</L>
            </span>
            <L tone="ink">≈1.78 L / {WATER_BY_NOW} L</L>
          </span>
          <span className="ww-ma__drunk" aria-hidden="true">
            {DRUNK.map((part) => (
              <span
                key={part.kind}
                className={`ww-ma__drunk--${part.kind}`}
                style={{ width: `${(part.litres / WATER_GOAL) * 100}%` }}
              />
            ))}
            <span className="ww-ma__drunktick" style={{ left: `${(WATER_BY_NOW / WATER_GOAL) * 100}%` }} />
          </span>
          <span className="ww-ma__sub">On pace · {WATER_GOAL} L a day</span>
          <span className="ww-ma__actions">
            {DRUNK.map((part) => (
              <L key={part.kind}>
                <span className={`ww-ma__dot ww-ma__drunk--${part.kind}`} aria-hidden="true" /> {part.label} {part.litres} L
              </L>
            ))}
          </span>
          <span className="ww-ma__actions">
            <span className="ww-jg__new">Sip</span>
            <span className="ww-ma__button">Coffee</span>
            <span className="ww-ma__button">Sweet</span>
            <L>− 1 sip</L>
          </span>
        </div>
      </div>
    </div>
  </Page>
);

/* ─── Threat forecast ─────────────────────────────────────────────────────── */

/** Kyiv as the real page (/attack, the «Київ» tab) showed it on the evening of
 *  14.11.2026 — copied at Yarik's word, read off the live page and `attack_list`:
 *  no alert for 10 h 35 min, the assessment prepared at 21:06, and the two classes
 *  at the top of its list with their real levels (the page has twelve; ten more
 *  were low or none). The rationales are the agent's own, translated from Ukrainian
 *  and cut to their first argument. Left out: the «where you are now» card (it
 *  names where he really is) and the city switch. The map is his own screenshot
 *  of the page's embedded alert map that evening (src/assets/threat/): Chernihiv
 *  region under alert, one drone marked in it, Kyiv below, clear.
 *  The 21-day ribbon: the page draws alerts as a continuous strip; here it is
 *  sampled into 63 cells — m calm, o an alert, v a strike-heavy stretch. */
const RIBBON = 'vommmvmmmvmmmmmvmmomooommmovmmoommmommovommmmoommommmmmommmmmmm'.split('');
const CLASSES = [
  {
    name: 'Ballistic (Iskander-M / KN-23 / S-400)',
    level: 2,
    why: 'MID: the 21:00 register names up to 40 missiles, the city of Kyiv among the main targets; the US 48-hour warning still stands. Not HIGH: no launchers on the line, no target on the city.',
  },
  {
    name: 'Jet Shahed / Geran-4/5',
    level: 1,
    why: 'LOW: no new target on the capital — the jets crossed Kyiv region in transit, no alert in the city.',
  },
];
const LEVELS = ['Low', 'Medium', 'High'];

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
  <Page icon="alert" name="Threat forecast" aside={<L>air threat for Kyiv · the next 24 hours</L>}>
    <div className="ww-ma__cols ww-ma__cols--wide">
      <div className="ww-ma__col">
        <div className="ww-ma__card ww-ma__card--calm">
          <span className="ww-ma__row">
            <span className="ww-jg__itemname">Kyiv</span>
            <L tone="ink">No alert · 10 h 35 min</L>
          </span>
          <Ribbon />
        </div>
        <L>Assessment prepared 14 Nov at 21:06</L>
        {CLASSES.map((weapon) => (
          <div key={weapon.name} className="ww-ma__card">
            <span className="ww-ma__row">
              <span className="ww-jg__itemname">{weapon.name}</span>
              <L tone={weapon.level > 1 ? 'time' : undefined}>{LEVELS[weapon.level - 1]}</L>
            </span>
            <span className={`ww-ma__level${weapon.level === 1 ? ' ww-ma__level--low' : ''}`} aria-hidden="true">
              {LEVELS.map((level, i) => (
                <span key={level} className={i < weapon.level ? 'ww-ma__level--on' : undefined} />
              ))}
            </span>
            <p>{weapon.why}</p>
            <L>Disagree with the level</L>
          </div>
        ))}
      </div>
      <div className="ww-ma__col">
        <L>Alert map</L>
        <img className="ww-ma__alertmap" src={droneMap} alt="" />
      </div>
    </div>
  </Page>
);

/* ─── Home ────────────────────────────────────────────────────────────────── */

/** His Kyiv flat, as the real page (/home, its first house) drew it on the evening
 *  of 14.11.2026 — at Yarik's word («use my Kyiv home — it's cooler»). Real: the
 *  walls (the plan's own segments, viewBox 1304 × 932, read off the page's SVG and
 *  chained into polylines), where each card sits on the plan (% of it), and every
 *  reading. Left out on purpose: the house switch's street names, the address, the
 *  rent and the utilities line. */
const FLAT_WALLS = [
  '351 368 351 727 480 727 480 671',
  '442 280 442 80 1217 173 1217 351',
  '1217 405 1217 514 884 514',
  '480 599 480 514 808 514',
  '480 554 565 554 565 712 480 712',
  '758 514 758 637',
  '758 695 758 779 758 818 1249 818 1217 514',
  '758 554 623 554 623 697 623 718 758 718',
  '775 311 714 311 714 377 755 377 775 377 775 311',
  '1217 262 1278 262 1278 463 1217 463',
  '30 223 30 54 63 53 332 53',
  '30 223 30 256 135 256 135 367 351 368',
  '442 280 442 380 421 380',
  '332 53 332 124 366 124',
  '383 368 366 124',
  '379 283 442 280',
];
/** The cards on the floor plan: where (in % of the plan), what, and its reading —
 *  and what the page opens under the plan when the card is clicked (read by
 *  clicking each one that evening; translated, the longest panels cut to their
 *  first screen). Kept off the slide: the family's names in «Who is home?», the
 *  Wi-Fi network's name and the access point's address, serial numbers — and the
 *  «Who is home?» card altogether, at Yarik's word. */
type Device = {
  at: [number, number];
  name: string;
  value: string;
  note?: string;
  bad?: boolean;
  /** what the click opens; a card without it stays on the plan but is not clicked
   *  (the three room sensors open the same panel — one is enough, at Yarik's word) */
  about?: string;
  /** the panel's 24-hour charts: the reading now, its range over the day, and the
   *  curve — the page's own line (viewBox 100 × 56, y down), kept as the points
   *  where it changes level and drawn as steps */
  charts?: { label: string; now: string; range: string; line: string }[];
  rows?: [string, string][];
  foot?: string;
};
const DEVICES: Device[] = [
  {
    at: [10, 7.1],
    name: 'Study',
    value: '20° · 49.3%',
  },
  {
    at: [57.1, 15],
    name: 'Living room',
    value: '21.4° · 44.8%',
    about: 'Online · the last 24 hours',
    charts: [
      { label: 'Temperature', now: '21.4°C', range: '21.1°C – 21.4°C', line: '0 51,39 36,48 20,56 5,100 5' },
      { label: 'Humidity', now: '44.8%', range: '44.8% – 46.4%', line: '0 5,5 11,14 14,22 22,31 31,39 36,48 39,56 36,73 45,91 48,100 51' },
    ],
    rows: [
      ['Humidity alert', 'below 40% · not active'],
      ['Temperature alert', 'above 23.5°C · not active'],
    ],
  },
  {
    at: [73.4, 61.7],
    name: 'Bedroom',
    value: '21.4° · 44.4%',
  },
  {
    at: [30.6, 16],
    name: 'Fridge',
    value: '9.1°',
    about: 'Online · the last 24 hours',
    charts: [
      { label: 'Temperature', now: '9.1°C', range: '8.8°C – 9.4°C', line: '0 13,1 28,2 43,7 20,9 36,25 51,27 43,29 13,32 28,33 51,35 36,42 43,45 13,48 20,51 36,56 28,59 13,62 20,66 13,74 5,76 28,85 36,86 20,91 28,100 28' },
    ],
    rows: [
      ['Temperature alert', 'above 15°C · not active'],
    ],
  },
  {
    at: [16.2, 29.2],
    name: 'Vacuum',
    value: 'At the dock',
    about: 'Dreame L10 Ultra · checked 22:52',
    rows: [
      ['State', 'At the dock'],
      ['Battery', '100%'],
      ['Task', 'Finished'],
      ['Error', 'No errors'],
      ['Water level', 'No warnings'],
    ],
    foot: 'Start cleaning · Pause · To the dock · Clean one room',
  },
  {
    at: [37.7, 47.5],
    name: 'Washer',
    value: 'Offline',
    bad: true,
    about: 'Electrolux · washing and drying',
    rows: [
      ['Now', 'Not connected · readings hidden'],
      ['Last wash', 'Washed successfully'],
      ['Programme', 'Cotton'],
      ['Started', '7 Nov at 07:15'],
      ['Finished', '7 Nov at 10:39'],
      ['Took', '3 h 24 min'],
    ],
  },
  {
    at: [7.1, 82.3],
    name: 'Internet',
    value: '100% uptime',
    about: 'Measured 1 min ago · the last 5 min',
    rows: [
      ['Signal', '−66 dBm'],
      ['Link rate', '351 Mbit/s'],
      ['To the router', '17 ms'],
      ['To the internet', '17 ms'],
      ['Loss', '0%'],
      ['DNS · HTTPS', '2/2 · 2/2'],
      ['Speed test, every 6 h', '↓ 18 · ↑ 114 Mbit/s'],
    ],
  },
  {
    at: [0, 63],
    name: 'Power',
    value: 'On · 7 h',
    note: 'outage possible until 01:30',
    about: 'Power is on · can be cut at any moment',
    charts: [
      { label: 'Voltage', now: '235 V', range: '0 – 247 V', line: '0 7,4 8,5 7,7 6,8 7,15 6,17 8,34 7,38 8,42 7,48 8,53 19,55 51,70 30,71 8,72 7,75 9,77 7,81 8,82 9,83 8,88 7,90 8,92 9,93 8,96 9,99 8,100 7' },
    ],
    rows: [
      ['On for', '7 h'],
      ['Outage window', 'lasts until 01:30'],
      ['Tomorrow', '11:00 – 14:30'],
      ['', '19:30 – 23:00'],
    ],
  },
  {
    at: [42.2, 28],
    name: 'EcoFlow 2',
    value: '98%',
    about: 'DELTA 2 + extra battery · at 22:52',
    rows: [
      ['Charge', '98% · ≈ 2 019 Wh of 2 048'],
      ['Grid', 'On · 234 V · 50 Hz'],
      ['Without the grid', '~59 h at this load'],
      ['In → out', '32 W → 32 W'],
      ['Health', '99% · 80 cycles'],
      ['Battery · inverter', '31 °C · 46 °C'],
    ],
  },
];
/** «x y,x y,…» change points → a stepped polyline: hold the level, then jump. */
const stepLine = (line: string) =>
  line
    .split(',')
    .map((point, i, all) => (i === 0 ? point : `${point.split(' ')[0]} ${all[i - 1].split(' ')[1]} ${point}`))
    .join(' ');
/** how long the frame rests on each card before it clicks the next one */
const HOME_MS = 3000;
/** the cards the frame clicks, in order */
const HOME_WALK = DEVICES.filter((device) => device.about);
/** the walk ends — and the PDF rests — on the last card */
export const HOME_WALK_MS = (HOME_WALK.length - 1) * HOME_MS;

const Home = ({ t = 0 }: { t?: number }) => {
  const open = HOME_WALK[Math.min(Math.floor(t / HOME_MS), HOME_WALK.length - 1)];
  return (
    <Page icon="home" name="Home" aside={<Buttons items={['Flat', 'Rental', 'Country house']} on="Flat" />}>
      <div className="ww-ma__cols ww-ma__cols--home">
        <div className="ww-ma__plan">
          <div className="ww-ma__flat">
            <svg viewBox="0 0 1304 932" aria-hidden="true">
              {FLAT_WALLS.map((wall) => (
                <polyline key={wall} points={wall} />
              ))}
            </svg>
            {DEVICES.map((device) => (
              <div
                key={device.name}
                className={`ww-ma__device${device === open ? ' ww-ma__device--on' : ''}`}
                style={{ left: `${device.at[0]}%`, top: `${device.at[1]}%` }}
              >
                <L>{device.name}</L>
                <span className={device.bad ? 'ww-ma__reading ww-ma__reading--bad' : 'ww-ma__reading'}>{device.value}</span>
                {device.note && <L>{device.note}</L>}
              </div>
            ))}
          </div>
        </div>
        <div key={open.name} className="ww-ma__card ww-ma__card--list ww-ma__detail ww-jg__arrive">
          <span className="ww-jg__itemtext ww-ma__detailhead">
            <span className="ww-ma__who">{open.name}</span>
            <L>{open.about}</L>
          </span>
          {open.charts?.map((chart) => (
            <span key={chart.label} className="ww-ma__chart24">
              <span className="ww-ma__row">
                <L>{chart.label}</L>
                <span>{chart.now}</span>
              </span>
              <svg viewBox="0 -3 100 62" preserveAspectRatio="none" aria-hidden="true">
                <polyline points={stepLine(chart.line)} />
              </svg>
              <span className="ww-ma__row">
                <L>24 h</L>
                <L>{chart.range}</L>
              </span>
            </span>
          ))}
          {open.rows?.map(([label, value]) => (
            <span key={label + value} className="ww-ma__row">
              <L>{label}</L>
              <span className={open.bad && label === 'Now' ? 'ww-ma__reading--bad' : undefined}>{value}</span>
            </span>
          ))}
          {open.foot && (
            <span className="ww-ma__row">
              <L>{open.foot}</L>
            </span>
          )}
        </div>
      </div>
    </Page>
  );
};

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

/* ─── …and how Home was born: the real task ───────────────────────────────── */

/** The Home page's device cards did not start as «build me a smart-home page». They
 *  started as one question in the queue — task 6a0e0cfa, «Can you list all devices
 *  connected to my home WiFi?», 31.08.2026 — and grew over two weeks of his replies
 *  in that same thread (read on 14.11.2026 with `get_task_comments`). What is real
 *  here: the title, the id, the dates, his replies (translated from Ukrainian, the
 *  second shortened), the scan's method and count (three ping sweeps, the ARP
 *  cache, 14 devices, 5 unidentified), Home Assistant private on Railway, the
 *  Dreame integration and its version. Compressed for the stage: the thread has
 *  50+ comments (router screenshots, cloud accounts, permissions asked and given)
 *  and the page's cards were built across later tasks too — the last report here
 *  stands for all of that, and the notes say so. The tool lines are the kind of
 *  calls it made, not a transcript. */
const HOME_SCAN_STREAM = ['Bash(ping sweep 192.168.0.1–254, three passes)', 'Bash(arp -a)', 'Write(home-network.html)'];
const HOME_BUILD_STREAM = [
  'Bash(railway up · home-assistant, private)',
  'Bash(install dreame-vacuum v2.0.0b25)',
  'Edit(miniapps/home/src/mcp.ts)',
  'Write(apps/web/src/components/home-plan.tsx)',
  'Bash(railway up --ci)',
];
/** asked · the agent scans · the inventory · «what can each one tell us?» · the
 *  answer · «Home Assistant on Railway» · the agent builds · done, the row is in the
 *  sidebar · the app opens the page */
const HOME_BIRTH_MS = (() => {
  const scanned = 1400 + (HOME_SCAN_STREAM.length + 1) * STREAM_MS;
  const asked = scanned + 2800;
  const answered = asked + 2200;
  const decided = answered + 2400;
  const building = decided + 1800;
  const built = building + (HOME_BUILD_STREAM.length + 1) * STREAM_MS;
  return [0, 1400, scanned, asked, answered, decided, building, built, built + 2600] as const;
})();
const HOME_BORN_MS = HOME_BIRTH_MS[HOME_BIRTH_MS.length - 1];

function HomeBirth({ moment, t }: { moment: number; t: number }) {
  const agentHasIt = moment <= 1 || moment === 3 || moment === 5 || moment === 6;
  return (
    <div className="ww-jg__page ww-ma__task">
      <span className="ww-jg__title">Can you list all devices connected to my home WiFi?</span>
      <span className="ww-jg__label">ID 6a0e0cfa</span>
      <Fields
        fields={[
          agentHasIt
            ? { label: 'Status', value: 'In progress', tone: 'time' }
            : { label: 'Status', value: 'Paused', tone: 'hold' },
          { label: 'Priority', value: 'Low' },
          { label: 'Assignee', value: agentHasIt ? 'Claude Code' : '@me' },
          { label: 'Created', value: 'Aug 31' },
        ]}
      />
      <div className="ww-jg__timeline ww-jg__timeline--fade">
        {moment === 7 && (
          <div className="ww-jg__arrive" key="built">
            <Comment who="Claude Code" tag="Session report" when="Sep 13">
              <p>
                Done: Home Assistant runs privately on Railway, the vacuum is connected — and every device is a card
                on the plan of the flat: myclaw.app/home.
              </p>
            </Comment>
          </div>
        )}
        {moment === 6 && <InFlight key="building" lines={HOME_BUILD_STREAM} since={HOME_BIRTH_MS[6]} t={t} />}
        {moment >= 5 && (
          <div className="ww-jg__arrive" key="decided">
            <Comment who="@me" when="Sep 12" plain>
              <p>
                <strong>OK, let&apos;s set up Home Assistant on Railway.</strong>
              </p>
            </Comment>
          </div>
        )}
        {moment >= 4 && (
          <div className="ww-jg__arrive" key="answered">
            <Comment who="Claude Code" tag="Session report" when="Sep 10">
              <p>Researched what each device opens on the local network, beyond the Shelly ones — the table is in the artifact.</p>
            </Comment>
          </div>
        )}
        {moment >= 3 && (
          <div className="ww-jg__arrive" key="asked">
            <Comment who="@me" when="Sep 7" plain>
              <p>And what information can we pull out of each device? Which APIs do they open on the local network?</p>
            </Comment>
          </div>
        )}
        {moment >= 2 && (
          <div className="ww-jg__arrive" key="inventory">
            <Comment who="Claude Code" tag="Session report" when="Sep 2">
              <p>Scanned the home network and made an inventory: 14 devices. Five of them I could not identify.</p>
            </Comment>
          </div>
        )}
        {moment <= 1 && <InFlight key="scanning" lines={HOME_SCAN_STREAM} since={HOME_BIRTH_MS[1]} t={t} />}
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
  // Home is the second page with a birth: its frame replays the real task it grew
  // out of, on the per-frame clock, and only then opens the page and walks its cards
  const homeBirth = current.name === 'Home';
  const hMoment = HOME_BIRTH_MS.reduce<number>((m, at, i) => (tStage >= at ? i : m), 0);
  const hBorn = !homeBirth || tStage >= HOME_BORN_MS;
  useAnimating(
    (stage === 1 && !born) ||
      (silpo !== undefined && silpo < SILPO_MS.length - 1) ||
      (!!current.tour && step <= current.tour.length) ||
      (homeBirth && tStage < HOME_BORN_MS + HOME_WALK_MS) ||
      (phone !== undefined && phone < PHONE_MS.length - 1),
  );
  // the row exists from the moment the agent reports it built the page
  const rows = stage === 1 && moment < 5 ? 0 : homeBirth && hMoment < 7 ? frame.app : frame.app + 1;
  const onPage = (stage > 1 || born) && hBorn;
  return (
    <>
      <Browser
        url={
          onPage
            ? `myclaw.app/${sub > 0 && current.tour ? current.tour[sub - 1].path : current.path}`
            : homeBirth
              ? 'myclaw.app/tasks/6a0e0cfa'
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
            <CurrentPage
              key={current.name}
              sub={sub}
              phone={phone}
              silpo={silpo}
              t={homeBirth ? Math.max(0, tStage - HOME_BORN_MS) : tStage}
            />
          ) : homeBirth ? (
            <HomeBirth moment={hMoment} t={tStage} />
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
    + '[4] Books — the two I am reading now and how far, and my real '
    + 'ranking: the five-star books first, ordered by the duels the page asks me («which of these '
    + 'is better?»). Real titles, real progress, real order, as of 14 November. '
    + '[5] Movies — just one corner of the page: what to watch next. The agent argues from my own '
    + 'ratings, names the risk, and I answer with one button — Add or Not this. Honest: the card is '
    + 'the product\'s, but these two titles are MY recommendations to you — The Rehearsal and You Can '
    + 'See Everything, both Nathan Fielder — and the pitches are written for this slide. '
    + '[6] Health — only my own corner of it: the pills I take and whether I took them today, and '
    + 'water — sips against the pace for 2 L a day, split into water, sweet and coffee. Real, as '
    + 'of the evening of 14 November. (The family\'s profiles are on the real page and not here.) '
    + '[7] Threat forecast — Kyiv exactly as my page showed it on the evening of 14 November: no '
    + 'alert for ten hours, 21 days of alerts as a ribbon, and the next 24 hours per weapon class — '
    + 'twelve of them, two shown — each with the agent\'s reasoning from the channels it reads, and '
    + 'a button to disagree with the level. (Rationales translated and shortened.) The map is a '
    + 'screenshot of that evening: Chernihiv region under alert with a drone in it, Kyiv clear. '
    + '[8] Home — and this one shows where it came from, like Coffee did. The frame first replays '
    + 'the real task, about twenty seconds: on 31 August I asked one question — «can you list all '
    + 'devices connected to my home WiFi?». It scanned: 14 devices, five it could not name. I asked '
    + 'what each of them can tell us; then «let\'s set up Home Assistant on Railway». Two weeks, one '
    + 'thread — and then the page opens: my flat in Kyiv on its real floor plan, and the frame '
    + 'clicks through the cards by itself, three seconds each: the living room\'s temperature and '
    + 'humidity with their 24-hour curves, the fridge, the vacuum, the washer (offline since its last '
    + 'wash), internet, power — the dip in the voltage chart is a real outage — and the battery: 59 '
    + 'hours without the grid. Real readings, the evening of 14 November. Honest: the task is real '
    + '— its title, dates and my replies (translated) — but compressed: the thread has fifty-odd '
    + 'comments, and the cards were built over later tasks too. '
    + '[9] Routes — the next 24 hours: when to leave, by what, in what weather. '
    + '[10] Sleep — regularity and a score per night. '
    + '[11] Sport — steps, three weeks, workouts (say it: one in eight weeks). '
    + '[12] Music — what I listen to, and duels that rank my top hundred. '
    + '[13] Family tree — what the agents dug up in the archives this month. '
    + 'There are more: the nanny\'s hours, work hours, important dates, my sole-proprietor books, a wall display. '
    + 'None of them is a chat. Every one of them started as a task. So chat is no longer the only '
    + 'UX — it is the one I use when nothing better exists yet. '
    + 'Honest about the picture: recreations of the real pages — their sections and controls are the '
    + 'real ones. Coffee, Supplies, Books, Health, the Threat forecast and Home carry my real data (Coffee\'s verdicts are '
    + 'sharpened — in real life I have mostly said «OK»; Health shows only my own card); Movies is '
    + 'my two picks in the product\'s card; the rest have invented data, because the real ones hold '
    + 'my real life. The birth of Coffee is staged; the real page was built the same way, over more '
    + 'than one task.',
};
