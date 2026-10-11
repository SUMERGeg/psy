'use client';

import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import type { ConversationContent } from '@/content/types';
import { createConversationMessage, toggleThought } from '@/lib/conversation';
import { tryCopyHandle as tryCopyText } from '@/lib/interactions';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { RoundArrow } from '@/components/ui/RoundArrow';
import ui from '@/components/ui/ui.module.css';
import styles from './conversation.module.css';

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;
const steps = ['Тема', 'Мысли', 'Фраза'];

export function ConversationBuilder({ content, instagramUrl }: { content: ConversationContent; instagramUrl: string | null }) {
  const enhanced = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const radioName = useId();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [edited, setEdited] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [limit, setLimit] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copying' | 'copied' | 'leaving' | 'error'>('idle');
  const [flight, setFlight] = useState<{ key: number; title: string; style: CSSProperties } | null>(null);
  const flightSequence = useRef(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const mounted = useRef(false);
  const copyVersion = useRef(0);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldFocusStep = useRef(false);
  const selectEditor = useRef(false);
  const generated = createConversationMessage(content, direction, selected);
  const message = edited ?? generated;
  const chosenDirection = content.directions.find((item) => item.id === direction);
  const thoughts = selected.map((id) => content.thoughts.find((item) => item.id === id)).filter((item) => item !== undefined);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (copyTimer.current) clearTimeout(copyTimer.current);
      if (flightTimer.current) clearTimeout(flightTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!shouldFocusStep.current) return;
    shouldFocusStep.current = false;
    const frame = requestAnimationFrame(() => {
      headingRef.current?.focus({ preventScroll: true });
      headingRef.current?.scrollIntoView({ block: 'nearest', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    });
    return () => cancelAnimationFrame(frame);
  }, [step]);

  useEffect(() => {
    if (!editing) return;
    const frame = requestAnimationFrame(() => {
      editorRef.current?.focus();
      if (selectEditor.current) { editorRef.current?.select(); selectEditor.current = false; }
    });
    return () => cancelAnimationFrame(frame);
  }, [editing, step]);

  const clearCopy = () => {
    copyVersion.current += 1;
    if (copyTimer.current) clearTimeout(copyTimer.current);
    setCopyState('idle');
  };
  const goToStep = (next: number) => {
    if (next === step) return;
    shouldFocusStep.current = true;
    setStep(next);
  };
  const chooseThought = (id: string, event: MouseEvent<HTMLButtonElement>) => {
    if (!selected.includes(id) && selected.length === 3) { setLimit(true); return; }
    clearCopy();
    setLimit(false);
    const adding = !selected.includes(id);
    setSelected(toggleThought(selected, id));
    if (!adding || !paperRef.current || !window.matchMedia('(min-width: 64rem) and (prefers-reduced-motion: no-preference)').matches) return;
    const from = event.currentTarget.getBoundingClientRect();
    const to = paperRef.current.getBoundingClientRect();
    if (to.top >= window.innerHeight || to.bottom <= 0) return;
    if (flightTimer.current) clearTimeout(flightTimer.current);
    const thought = content.thoughts.find((item) => item.id === id);
    if (!thought) return;
    setFlight({ key: ++flightSequence.current, title: thought.title, style: {
      left: from.left, top: from.top, width: from.width, height: from.height,
      '--flight-x': `${to.left + to.width / 2 - from.left - from.width / 2}px`,
      '--flight-y': `${to.top + 70 + selected.length * 46 - from.top}px`,
    } as CSSProperties });
    flightTimer.current = setTimeout(() => setFlight(null), 520);
  };
  const reset = () => {
    clearCopy();
    setDirection(null); setSelected([]); setEdited(null); setEditing(false); setLimit(false); setFlight(null);
    if (flightTimer.current) clearTimeout(flightTimer.current);
    if (step === 1) headingRef.current?.focus();
    else goToStep(1);
  };
  const copy = async () => {
    if (!message.trim() || copyState === 'copying') return;
    clearCopy();
    const version = copyVersion.current;
    setCopyState('copying');
    const copied = await tryCopyText(message, navigator.clipboard);
    if (!mounted.current || version !== copyVersion.current) return;
    setCopyState(copied ? 'copied' : 'error');
    if (copied) copyTimer.current = setTimeout(() => {
      setCopyState('leaving');
      copyTimer.current = setTimeout(() => setCopyState('idle'), 240);
    }, 3500);
  };
  const selectText = () => {
    if (editing && editorRef.current) { editorRef.current.focus(); editorRef.current.select(); }
    else { selectEditor.current = true; setEditing(true); }
  };

  return <section data-reveal id="conversation" className={styles.section} aria-labelledby="conversation-title">
    <header className={styles.introduction}>
      <div><p className={styles.eyebrow}>Небольшое пространство для себя</p><h2 id="conversation-title">{content.title.split('\n').map((line, index) => <span key={line}>{index > 0 ? ' ' : ''}{line}</span>)}</h2></div>
      <div className={styles.introCopy}><p>{content.introduction}</p><a className={styles.jumpLink} href="#conversation-workspace">Собрать первые слова <span aria-hidden="true">↓</span></a></div>
    </header>
    <div id="conversation-workspace" tabIndex={-1} className={styles.workspace} data-step={step}>
      <div className={styles.choices}>
        <nav aria-label="Шаги составления разговора" className={styles.steps}><ol>{steps.map((label, index) => <li key={label}>
          <button type="button" aria-current={step === index + 1 ? 'step' : undefined} disabled={!enhanced || (index > 0 && !direction) || (index === 2 && !selected.length)} onClick={() => goToStep(index + 1)}>
            <span aria-hidden="true">0{index + 1}</span>{label}
          </button>
        </li>)}</ol></nav>
        <div key={step} className={styles.stage}>
          <h3 ref={headingRef} tabIndex={-1} className={styles.stageTitle}>{step === 1 ? 'О чём хочется поговорить?' : step === 2 ? 'Что откликается сейчас?' : 'Первые слова уже есть.'}</h3>
          <p className={styles.instruction}>{step === 1 ? 'Выберите направление. Его можно будет поменять.' : step === 2 ? 'Выберите от одной до трёх мыслей. Здесь можно сомневаться и менять выбор.' : 'Прочитайте фразу. Можно изменить слова, убрать лишнее или добавить своё.'}</p>
          {step === 1 && <fieldset className={styles.directions} disabled={!enhanced}>
            <legend className={styles.srOnly}>Направление разговора</legend>
            {content.directions.map((item, index) => <label key={item.id} className={styles.direction}>
              <input type="radio" name={radioName} value={item.id} checked={direction === item.id} onChange={() => { clearCopy(); setDirection(item.id); }} />
              <span className={styles.directionNumber} aria-hidden="true">0{index + 1}</span>
              <span className={styles.directionCopy}><strong>{item.title}</strong><span>{item.hint}</span></span>
              <span className={styles.radioMark} aria-hidden="true" />
            </label>)}
          </fieldset>}
          {step === 2 && <>
            <div className={styles.thoughts} role="group" aria-label="Мысли для начала разговора">{content.thoughts.map((thought, index) => <button key={thought.id} type="button" className={styles.thought} aria-pressed={selected.includes(thought.id)} aria-disabled={!selected.includes(thought.id) && selected.length === 3} disabled={!enhanced} onClick={(event) => chooseThought(thought.id, event)}>
              <span className={styles.thoughtNumber} aria-hidden="true">0{index + 1}</span><span>{thought.title}</span><span className={styles.thoughtMark} aria-hidden="true">{selected.includes(thought.id) ? '✓' : '+'}</span>
            </button>)}</div>
            <p role="status" className={styles.selectionNote}>{limit ? 'Можно выбрать до трёх мыслей. Уберите одну, чтобы добавить другую.' : `Выбрано ${selected.length} из 3. Повторное нажатие уберёт карточку.`}</p>
          </>}
          {step === 3 && <div className={styles.review}>
            <p className={styles.reviewLabel}>Вы выбрали</p><p className={styles.reviewDirection}>{chosenDirection?.title}</p>
            <ol>{thoughts.map((thought) => <li key={thought.id}>{thought.title}</li>)}</ol>
            <p className={styles.reviewHint}>Фраза — только отправная точка. Оставьте в ней то, что звучит по-вашему.</p>
          </div>}
          <div className={styles.stageActions}>
            {step < 3 && <button type="button" className={`${ui.button} ${ui.primary}`} disabled={!enhanced || (step === 1 ? !direction : !selected.length)} onClick={() => goToStep(step + 1)}>{step === 1 ? 'Выбрать мысли' : 'Собрать фразу'}<RoundArrow /></button>}
            {step > 1 && <button type="button" className={styles.quietButton} onClick={() => goToStep(step - 1)}>← Назад</button>}
            {direction && <button type="button" className={styles.quietButton} onClick={reset}>Начать заново</button>}
          </div>
        </div>
      </div>
      <div ref={paperRef} className={styles.paper} aria-label="Ваша формулировка">
        <div className={styles.paperHeader}><span>Ваши слова</span><span aria-hidden="true">{String(selected.length).padStart(2, '0')} / 03</span></div>
        {step < 3 && thoughts.length > 0 && <ol className={styles.paperThoughts}>{thoughts.map((thought) => <li key={thought.id}><span>{thought.title}</span><button type="button" aria-label={`Убрать мысль «${thought.title}»`} onClick={() => { clearCopy(); setLimit(false); setSelected(toggleThought(selected, thought.id)); }}>×</button></li>)}</ol>}
        <div className={styles.document}>
          {editing && step === 3 ? <textarea ref={editorRef} aria-label="Изменить формулировку" className={styles.editor} maxLength={1500} value={message} onChange={(event) => { clearCopy(); setEdited(event.target.value); }} />
            : message ? message.split('\n\n').map((paragraph, index) => <p key={index}>{paragraph}</p>)
            : <><p className={styles.emptyPhrase}>{chosenDirection ? chosenDirection.opening : 'Здесь появятся\nваши первые слова.'}</p><p className={styles.paperHint}>{direction ? 'Добавьте мысли, которые откликаются, — и фраза сложится.' : 'Начните с выбора направления. Готовый запрос не нужен.'}</p></>}
        </div>
        {step === 3 && <>
          <div className={styles.editActions}>
            <button type="button" className={styles.quietButton} onClick={() => setEditing(!editing)}>{editing ? 'Готово' : 'Изменить слова'}</button>
            {edited !== null && <button type="button" className={styles.quietButton} onClick={() => { clearCopy(); setEdited(null); setEditing(false); }}>Обновить по карточкам</button>}
          </div>
          {edited !== null && <p className={styles.editNote}>Ваши правки сохраняются при переходе между шагами.</p>}
          <div className={styles.resultActions}>
            <button type="button" className={`${ui.button} ${ui.primary}`} onClick={copy} disabled={!message.trim() || copyState === 'copying'}>Скопировать фразу<RoundArrow /></button>
            {instagramUrl && <ButtonLink href={instagramUrl} variant="secondary">Открыть Instagram<RoundArrow direction="diagonal" /></ButtonLink>}
          </div>
          <div role="status" aria-atomic="true" className={styles.copyFeedback} data-state={copyState}>
            {(copyState === 'copied' || copyState === 'leaving') && <span>✓ Фраза скопирована</span>}
            {copyState === 'error' && <><p>Не удалось скопировать. Можно выделить текст и скопировать вручную.</p><button type="button" className={styles.quietButton} onClick={selectText}>Выделить текст</button></>}
          </div>
          <p className={styles.contactNote}>В Instagram откроется профиль Анны. Фразу можно вставить самостоятельно.</p>
        </>}
      </div>
    </div>
    <noscript><p className={styles.privacy}>Для сборки фразы включите JavaScript. Профиль Анны доступен по обычным ссылкам на странице.</p></noscript>
    <footer className={styles.sectionFooter}><p>{content.privacy}</p><p>{content.attribution}</p></footer>
    {flight && <div className={styles.flightLayer} aria-hidden="true"><div key={flight.key} className={styles.flyingThought} style={flight.style}>{flight.title}</div></div>}
  </section>;
}
