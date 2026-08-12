import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import type { Activity, Goal, Macros, Sex } from '@/db/types';
import { saveProfile } from '@/db/repository';
import { calculateTargets } from '@/shared/lib/nutrition';
import { haptic } from '@/shared/lib/haptics';
import { Button } from '@/shared/ui/Button';
import { Field, OptionRow, SegmentedControl } from '@/shared/ui/Field';
import {
  IconCamera,
  IconChevronLeft,
  IconMic,
  IconStar,
  type IconComponent,
} from '@/shared/ui/icons';
import { Logo } from '@/shared/ui/SplashScreen';
import { MacroTargetsEditor } from './MacroTargetsEditor';
import { ACTIVITY_OPTIONS, GOAL_OPTIONS, STEPS } from './constants';

type Form = {
  sex: Sex;
  age: string;
  heightCm: string;
  weightKg: string;
  activity: Activity;
  goal: Goal;
};

const INITIAL: Form = {
  sex: 'male',
  age: '30',
  heightCm: '175',
  weightKg: '75',
  activity: 'light',
  goal: 'lose',
};

export function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(INITIAL);
  const [targets, setTargets] = useState<Macros | null>(null);
  const [saving, setSaving] = useState(false);

  const body = useMemo(
    () => ({
      sex: form.sex,
      age: Number(form.age) || 0,
      heightCm: Number(form.heightCm) || 0,
      weightKg: Number(form.weightKg) || 0,
      activity: form.activity,
      goal: form.goal,
    }),
    [form],
  );

  const bodyValid = body.age >= 10 && body.age <= 100 && body.heightCm >= 100 && body.weightKg >= 30;
  const canAdvance = step !== 2 || bodyValid;

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const goNext = () => {
    haptic('select');
    // Computed once on entering the last step so manual edits are not clobbered.
    if (step === STEPS.length - 2) setTargets(calculateTargets(body));
    setStep((current) => Math.min(STEPS.length - 1, current + 1));
  };

  const finish = async () => {
    if (!targets) return;
    setSaving(true);
    const computed = calculateTargets(body);
    await saveProfile({
      ...body,
      targets,
      targetsOverridden: JSON.stringify(computed) !== JSON.stringify(targets),
    });
    haptic('success');
    navigate('/', { replace: true });
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <header className="flex items-center gap-3 py-2">
        {step > 0 ? (
          <button
            onClick={() => setStep((current) => current - 1)}
            aria-label="Back"
            className="-ml-2 grid size-10 place-items-center rounded-full text-muted active:bg-surface-2"
          >
            <IconChevronLeft />
          </button>
        ) : (
          <div className="size-10" />
        )}
        <div className="flex flex-1 gap-1.5">
          {STEPS.map((_, index) => (
            <span
              key={index}
              className={
                'h-1 flex-1 rounded-full transition-colors ' +
                (index <= step ? 'bg-accent' : 'bg-surface-2')
              }
            />
          ))}
        </div>
        <div className="size-10" />
      </header>

      <div key={step} className="flex-1 py-6 [animation:yq-pop-in_320ms_var(--ease-smooth)]">
        {step === 0 && <IntroStep />}

        {step === 1 && (
          <StepShell title="Your sex" hint="Needed for the metabolic rate formula">
            <SegmentedControl
              value={form.sex}
              onChange={(value) => set('sex', value)}
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
              ]}
            />
          </StepShell>
        )}

        {step === 2 && (
          <StepShell title="Body stats" hint="You can change these anytime">
            <div className="flex flex-col gap-3">
              <Field
                label="Age"
                suffix="yrs"
                type="number"
                inputMode="numeric"
                value={form.age}
                onChange={(e) => set('age', e.target.value)}
              />
              <Field
                label="Height"
                suffix="cm"
                type="number"
                inputMode="numeric"
                value={form.heightCm}
                onChange={(e) => set('heightCm', e.target.value)}
              />
              <Field
                label="Weight"
                suffix="kg"
                type="number"
                inputMode="decimal"
                value={form.weightKg}
                onChange={(e) => set('weightKg', e.target.value)}
              />
            </div>
            {!bodyValid && (
              <p className="px-1 text-[13px] text-muted">Double-check these values — something looks off.</p>
            )}
          </StepShell>
        )}

        {step === 3 && (
          <StepShell title="Activity level" hint="Counting both work and workouts">
            <div className="flex flex-col gap-2">
              {ACTIVITY_OPTIONS.map((option) => (
                <OptionRow
                  key={option.value}
                  {...option}
                  selected={form.activity}
                  onSelect={(value) => set('activity', value)}
                />
              ))}
            </div>
          </StepShell>
        )}

        {step === 4 && (
          <StepShell title="Your goal" hint="This sets your daily target">
            <div className="flex flex-col gap-2">
              {GOAL_OPTIONS.map((option) => (
                <OptionRow
                  key={option.value}
                  {...option}
                  selected={form.goal}
                  onSelect={(value) => set('goal', value)}
                />
              ))}
            </div>
          </StepShell>
        )}

        {step === 5 && targets && (
          <StepShell title="Your daily target" hint="Calculated with the Mifflin-St Jeor formula">
            <MacroTargetsEditor
              targets={targets}
              onChange={setTargets}
              onReset={() => setTargets(calculateTargets(body))}
            />
          </StepShell>
        )}
      </div>

      <footer className="pt-2">
        {step === STEPS.length - 1 ? (
          <Button size="lg" block loading={saving} onClick={finish}>
            Start tracking
          </Button>
        ) : (
          <Button size="lg" block disabled={!canAdvance} onClick={goNext}>
            {step === 0 ? "Let's go" : 'Next'}
          </Button>
        )}
      </footer>
    </div>
  );
}

function StepShell({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[30px] leading-tight font-bold tracking-tight">{title}</h1>
        <p className="text-[15px] text-muted">{hint}</p>
      </div>
      {children}
    </section>
  );
}

function IntroStep() {
  return (
    <section className="flex h-full flex-col items-center justify-center gap-6 text-center">
      <Logo size={76} />
      <div className="flex flex-col gap-2">
        <h1 className="text-[34px] leading-tight font-bold tracking-tight">Yomiq</h1>
        <p className="max-w-xs text-[16px] text-muted">
          Snap a photo, speak, or type — calories and macros get calculated for you.
        </p>
      </div>
      <ul className="flex w-full max-w-xs flex-col gap-3 text-left text-[15px] text-muted">
        <Highlight icon={IconCamera} text="Photo of a meal → weight and calories" />
        <Highlight icon={IconMic} text="Voice and text instead of searching a database" />
        <Highlight icon={IconStar} text="Frequent meals — added in one tap" />
      </ul>
    </section>
  );
}

function Highlight({ icon: Icon, text }: { icon: IconComponent; text: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-accent">
        <Icon size={18} />
      </span>
      {text}
    </li>
  );
}
