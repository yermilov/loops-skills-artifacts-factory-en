import { SlideDefinition } from '../types/slides';
import { CornerRings } from '../components/wawtech';

/**
 * What `/loop` actually is, in the same room as the other mechanism slides:
 * a cron entry the harness keeps, and a prompt it sends in your name when it
 * fires. The model is not looping. Nothing in its text says «loop».
 *
 * Read off the installed CLI (2.1.321) rather than memory: `/loop <interval>`
 * registers a SESSION-SCOPED cron task — the same machinery as the CronCreate
 * tool, in memory unless `persist: true` writes it to
 * `.claude/scheduled_tasks.json`. A fire arrives as a scheduler event whose
 * source is `schedule_wakeup` (cron) or `loop_wakeup` (the self-paced form,
 * where the model itself calls ScheduleWakeup and passes the same prompt
 * back). Hooks see it on UserPromptSubmit like any other prompt. And the CLI
 * says the rest itself: «Runs until you close this session · For durable
 * cloud-based loops, use /schedule».
 */

type Turn = { from: 'harness' | 'model'; text: string };

/** The transcript as it grows, one tick at a time. */
const TURNS: Turn[][] = [
  [],
  [{ from: 'harness', text: 'take the next task from the queue, do it, report back' }],
  [
    { from: 'harness', text: 'take the next task from the queue, do it, report back' },
    { from: 'model', text: '⏺ whats_next() · did it · reported back' },
  ],
  [
    { from: 'harness', text: 'take the next task from the queue, do it, report back' },
    { from: 'model', text: '⏺ whats_next() · did it · reported back' },
    { from: 'harness', text: 'take the next task from the queue, do it, report back' },
  ],
];

export const LoopIsCronSlide: SlideDefinition = {
  id: 'loop-is-cron',
  title: (
    <>
      A loop is a cron <span className="ww-llm__titlesub">— and a prompt sent in your name</span>
    </>
  ),
  maxRevealStages: 4,
  initialRevealStage: 1,
  content: ({ revealStage }) => (
    <>
      <CornerRings corner="top-right" />
      <div className="ww-llm ww-agent ww-cron">
        {/* The model's text: user turns it never knows it did not receive. */}
        <div className="ww-llm__panel">
          <h3 className="ww-llm__label">What the model is given</h3>
          <div className="ww-llm__script">
            {TURNS[revealStage - 1].length === 0 ? (
              <div className="ww-agent__nothing">nothing — a loop writes nothing into the text</div>
            ) : (
              TURNS[revealStage - 1].map((turn, i) =>
                turn.from === 'harness' ? (
                  <div key={i} className="ww-cron__turn">
                    <div className="ww-llm__line">
                      <span className="ww-llm__who ww-agent__who--user">User:</span> {turn.text}
                    </div>
                    <div className="ww-cron__tag">typed by the harness, not by me</div>
                  </div>
                ) : (
                  <div key={i} className="ww-cron__answer">
                    {turn.text}
                  </div>
                )
              )
            )}
          </div>
        </div>

        <div className="ww-llm__engine ww-agent__engine">
          <div className={`ww-agent__box ww-agent__box--harness${revealStage !== 3 ? ' is-busy' : ''}`}>
            <span className="ww-agent__box-name">Harness</span>
            <span className="ww-agent__box-state">
              {revealStage === 1 ? 'kept the schedule' : revealStage === 3 ? 'waiting' : 'fired · sent the prompt'}
            </span>
          </div>
          <span className="ww-llm__arrow ww-agent__updown" aria-hidden="true">
            ↕
          </span>
          <div className={`ww-agent__box ww-agent__box--model${revealStage === 3 ? ' is-busy' : ''}`}>
            <span className="ww-agent__box-name">Language model</span>
            <span className="ww-agent__box-state">
              {revealStage === 3 ? 'answering a user' : 'nothing to loop'}
            </span>
          </div>
        </div>

        {/* The schedule itself — the whole of the feature. */}
        <div className="ww-llm__panel ww-llm__panel--out">
          <h3 className="ww-llm__label">What the harness keeps</h3>
          <div className="ww-cron__job">
            <div className="ww-cron__cmd">/loop 10m take the next task…</div>
            <div className="ww-cron__row">
              <span>every</span>
              <strong>10 minutes</strong>
            </div>
            <div className="ww-cron__row">
              <span>scope</span>
              <strong>this session</strong>
            </div>
            <div className="ww-cron__row">
              <span>on fire</span>
              <strong>send the prompt as the user</strong>
            </div>
          </div>
          <div className={`ww-cron__note${revealStage >= 4 ? '' : ' ww-cmd__line--hidden'}`}>
            Close the terminal and the loop is gone with it.
          </div>
        </div>
      </div>
    </>
  ),
  notes:
    'So what is a loop, actually? Not a thing the model does. '
    + 'Beat 1 — you type /loop, and all that happens is the harness writes down a schedule. The '
    + 'model\'s text has not changed at all; nothing in it says «loop». '
    + 'Beat 2 — the timer fires, and the harness types your prompt FOR you. It arrives as a user '
    + 'turn, in your name. '
    + 'Beat 3 — the model does what it always does with a user turn: answers it. It cannot tell '
    + 'the difference, and that is the whole trick. '
    + 'Beat 4 — the timer fires again, same text. A loop is a cron entry plus a prompt. '
    + 'The details, read off the CLI itself (2.1.321), if anyone asks: /loop with an interval '
    + 'registers a session-scoped cron task — the same machinery as its CronCreate tool, held in '
    + 'memory unless persist writes it to .claude/scheduled_tasks.json. Without an interval it is '
    + 'self-paced: the model itself calls ScheduleWakeup with a delay between one minute and one '
    + 'hour and hands the same prompt back. Either way a fire reaches the session as a scheduler '
    + 'event — source schedule_wakeup, or loop_wakeup for the self-paced one — and hooks see it '
    + 'on UserPromptSubmit like any other prompt. '
    + 'And the sentence the CLI prints itself is the bridge to the next part: «Runs until you '
    + 'close this session.» That is exactly why my own loop is not /loop but a runner that opens '
    + 'a pane per task — the queue has to drain while the laptop is shut.',
};
