import { useEffect, useState } from 'react';
import type { Activity, Goal, Macros, Sex } from '@/db/types';
import { clearAllData, exportData, updateProfile } from '@/db/repository';
import { useProfile } from '@/db/useProfile';
import { calculateTargets } from '@/shared/lib/nutrition';
import { getStoredTheme, setTheme, THEME, type Theme } from '@/shared/lib/theme';
import { LOCALE_OPTIONS, useLocaleStore, useT } from '@/shared/i18n';
import { getAccessCode, setAccessCode } from '@/shared/api/client';
import { haptic } from '@/shared/lib/haptics';
import { Button } from '@/shared/ui/Button';
import { Field, OptionRow, SegmentedControl } from '@/shared/ui/Field';
import { MacroSummary } from '@/shared/ui/MacroSummary';
import { Sheet } from '@/shared/ui/Sheet';
import { useToast } from '@/shared/ui/Toast';
import { ACTIVITY_OPTIONS, GOAL_OPTIONS } from '@/features/onboarding/constants';
import { MacroTargetsEditor } from '@/features/onboarding/MacroTargetsEditor';

export function ProfilePage() {
  const profile = useProfile();
  const toast = useToast();
  const t = useT();
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  const [sheet, setSheet] = useState<'body' | 'targets' | 'access' | null>(null);
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);

  if (!profile) return null;

  const bodyLine = t.profile.bodyLine(
    profile.sex === 'male',
    profile.age,
    profile.heightCm,
    profile.weightKg,
  );

  const reset = async () => {
    if (!confirm(t.profile.confirmDelete)) return;
    await clearAllData();
    location.href = '/';
  };

  const download = async () => {
    const json = await exportData();
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `yomiq-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    // Safari starts the download asynchronously; revoking right away cancels it.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.show(t.toast.exported);
  };

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-30 flex items-center gap-1 border-b border-line bg-bg/85 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 backdrop-blur-xl">
        <h1 className="text-[24px] font-bold tracking-tight">{t.profile.title}</h1>
      </header>

      <div className="flex flex-col gap-6 px-4 py-5">
        <section className="flex flex-col gap-2">
          <MacroSummary macros={profile.targets} />
          <p className="px-1 text-center text-[12.5px] text-faint">
            {profile.targetsOverridden ? t.profile.targetManual : t.profile.targetAuto}
          </p>
        </section>

        <Group title={t.profile.data}>
          <Row label={t.profile.bodyStats} value={bodyLine} onClick={() => setSheet('body')} />
          <Row
            label={t.profile.dailyTarget}
            value={`${profile.targets.kcal} ${t.common.kcal}`}
            onClick={() => setSheet('targets')}
          />
        </Group>

        <Group title={t.profile.app}>
          <div className="flex flex-col gap-2.5 border-b border-line px-4 py-3.5">
            <span className="text-[13px] font-medium text-muted">{t.profile.language}</span>
            <SegmentedControl value={locale} onChange={setLocale} options={LOCALE_OPTIONS} />
          </div>
          <div className="flex flex-col gap-2.5 border-b border-line px-4 py-3.5">
            <span className="text-[13px] font-medium text-muted">{t.profile.theme}</span>
            <SegmentedControl
              value={theme}
              onChange={(value) => {
                setTheme(value);
                setThemeState(value);
              }}
              options={(Object.keys(THEME) as Theme[]).map((value) => ({
                value,
                label: t.theme[value],
              }))}
            />
          </div>
          <Row
            label={t.profile.accessCode}
            value={getAccessCode() ? t.profile.set : t.profile.notSet}
            onClick={() => setSheet('access')}
          />
        </Group>

        <Group title={t.profile.diaryData}>
          <Row label={t.profile.export} value="" onClick={() => void download()} />
        </Group>

        <Button variant="danger" block onClick={() => void reset()}>
          {t.profile.deleteAll}
        </Button>

        <p className="pb-2 text-center text-[12px] text-faint">
          {t.profile.footer}
        </p>
      </div>

      <BodySheet
        open={sheet === 'body'}
        onClose={() => setSheet(null)}
        profile={profile}
        onSaved={() => toast.show(t.toast.statsUpdated)}
      />
      <TargetsSheet
        open={sheet === 'targets'}
        onClose={() => setSheet(null)}
        targets={profile.targets}
        computed={() => calculateTargets(profile)}
        onSaved={() => toast.show(t.toast.targetUpdated)}
      />
      <AccessCodeSheet open={sheet === 'access'} onClose={() => setSheet(null)} />
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="px-1 text-[13px] font-medium text-muted">{title}</h2>
      <div className="overflow-hidden rounded-card border border-line bg-surface">{children}</div>
    </section>
  );
}

function Row({ label, value, onClick }: { label: string; value: string; onClick: () => void }) {
  return (
    <button
      onClick={() => {
        haptic('tap');
        onClick();
      }}
      className="flex w-full items-center gap-3 border-b border-line px-4 py-3.5 text-left last:border-b-0 active:bg-surface-2"
    >
      <span className="flex-1 text-[15.5px]">{label}</span>
      <span className="text-[14px] text-faint">{value}</span>
    </button>
  );
}

type BodyProfile = {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: Activity;
  goal: Goal;
  targetsOverridden: boolean;
};

/** Numbers stay strings while editing, otherwise clearing a field snaps it to 0. */
type BodyForm = Omit<BodyProfile, 'age' | 'heightCm' | 'weightKg' | 'targetsOverridden'> & {
  age: string;
  heightCm: string;
  weightKg: string;
};

function toForm(profile: BodyProfile): BodyForm {
  return {
    sex: profile.sex,
    age: String(profile.age),
    heightCm: String(profile.heightCm),
    weightKg: String(profile.weightKg),
    activity: profile.activity,
    goal: profile.goal,
  };
}

function BodySheet({
  open,
  onClose,
  profile,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  profile: BodyProfile;
  onSaved: () => void;
}) {
  const t = useT();
  const [form, setForm] = useState(() => toForm(profile));

  useEffect(() => {
    if (open) setForm(toForm(profile));
  }, [open, profile]);

  const save = async () => {
    const body = {
      sex: form.sex,
      age: Number(form.age) || profile.age,
      heightCm: Number(form.heightCm) || profile.heightCm,
      weightKg: Number(form.weightKg.replace(',', '.')) || profile.weightKg,
      activity: form.activity,
      goal: form.goal,
    };
    // A hand-set target survives body edits; an automatic one follows them.
    await updateProfile(
      profile.targetsOverridden ? body : { ...body, targets: calculateTargets(body) },
    );
    haptic('success');
    onClose();
    onSaved();
  };

  return (
    <Sheet open={open} onClose={onClose} title={t.profile.bodyTitle} tall>
      <div className="flex flex-col gap-4">
        <SegmentedControl
          value={form.sex}
          onChange={(sex) => setForm({ ...form, sex })}
          options={[
            { value: 'male', label: t.body.male },
            { value: 'female', label: t.body.female },
          ]}
        />

        <Field
          label={t.body.age}
          suffix={t.body.years}
          type="number"
          inputMode="numeric"
          value={form.age}
          onChange={(e) => setForm({ ...form, age: e.target.value })}
        />
        <Field
          label={t.body.height}
          suffix={t.body.cm}
          type="number"
          inputMode="numeric"
          value={form.heightCm}
          onChange={(e) => setForm({ ...form, heightCm: e.target.value })}
        />
        <Field
          label={t.body.weight}
          suffix={t.body.kg}
          type="number"
          inputMode="decimal"
          value={form.weightKg}
          onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
        />

        <span className="px-1 text-[13px] font-medium text-muted">{t.body.activity}</span>
        <div className="flex flex-col gap-2">
          {ACTIVITY_OPTIONS.map((option) => (
            <OptionRow
              key={option.value}
              {...option}
              {...t.activity[option.value]}
              selected={form.activity}
              onSelect={(activity) => setForm({ ...form, activity })}
            />
          ))}
        </div>

        <span className="px-1 text-[13px] font-medium text-muted">{t.body.goal}</span>
        <div className="flex flex-col gap-2">
          {GOAL_OPTIONS.map((option) => (
            <OptionRow
              key={option.value}
              {...option}
              {...t.goal[option.value]}
              selected={form.goal}
              onSelect={(goal) => setForm({ ...form, goal })}
            />
          ))}
        </div>

        <Button size="lg" block onClick={() => void save()}>
          {t.common.save}
        </Button>
      </div>
    </Sheet>
  );
}

function TargetsSheet({
  open,
  onClose,
  targets,
  computed,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  targets: Macros;
  computed: () => Macros;
  onSaved: () => void;
}) {
  const t = useT();
  const [draft, setDraft] = useState(targets);

  useEffect(() => {
    if (open) setDraft(targets);
  }, [open, targets]);

  const save = async () => {
    await updateProfile({
      targets: draft,
      targetsOverridden: JSON.stringify(draft) !== JSON.stringify(computed()),
    });
    haptic('success');
    onClose();
    onSaved();
  };

  return (
    <Sheet open={open} onClose={onClose} title={t.profile.targetTitle} tall>
      <div className="flex flex-col gap-5">
        <MacroTargetsEditor targets={draft} onChange={setDraft} onReset={() => setDraft(computed())} />
        <Button size="lg" block disabled={draft.kcal <= 0} onClick={() => void save()}>
          {t.common.save}
        </Button>
      </div>
    </Sheet>
  );
}

function AccessCodeSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT();
  const [code, setCode] = useState('');

  useEffect(() => {
    if (open) setCode(getAccessCode());
  }, [open]);

  return (
    <Sheet open={open} onClose={onClose} title={t.profile.accessTitle}>
      <div className="flex flex-col gap-4">
        <p className="text-[14px] leading-snug text-muted">{t.profile.accessHelp}</p>
        <Field
          label={t.profile.code}
          type="password"
          autoComplete="off"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <Button
          size="lg"
          block
          onClick={() => {
            setAccessCode(code.trim());
            haptic('success');
            onClose();
          }}
        >
          {t.common.save}
        </Button>
      </div>
    </Sheet>
  );
}
