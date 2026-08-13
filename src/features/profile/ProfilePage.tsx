import { useEffect, useState } from 'react';
import type { Activity, Goal, Macros, Sex } from '@/db/types';
import { clearAllData, exportData, updateProfile } from '@/db/repository';
import { useProfile } from '@/db/useProfile';
import { calculateTargets } from '@/shared/lib/nutrition';
import { getStoredTheme, setTheme, THEME_LABEL, type Theme } from '@/shared/lib/theme';
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

  const [sheet, setSheet] = useState<'body' | 'targets' | 'access' | null>(null);
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);

  if (!profile) return null;

  const bodyLine = `${profile.sex === 'male' ? 'M' : 'F'} · ${profile.age} yrs · ${profile.heightCm} cm · ${profile.weightKg} kg`;

  const reset = async () => {
    if (!confirm('Delete your profile and all entries? This cannot be undone.')) return;
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
    URL.revokeObjectURL(url);
    toast.show('File exported');
  };

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-30 flex items-center gap-1 border-b border-line bg-bg/85 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 backdrop-blur-xl">
        <h1 className="text-[24px] font-bold tracking-tight">Profile</h1>
      </header>

      <div className="flex flex-col gap-6 px-4 py-5">
        <section className="flex flex-col gap-2">
          <MacroSummary macros={profile.targets} />
          <p className="px-1 text-center text-[12.5px] text-faint">
            {profile.targetsOverridden ? 'Target set manually' : 'Target calculated automatically'}
          </p>
        </section>

        <Group title="Data">
          <Row label="Body stats" value={bodyLine} onClick={() => setSheet('body')} />
          <Row
            label="Daily target"
            value={`${profile.targets.kcal} kcal`}
            onClick={() => setSheet('targets')}
          />
        </Group>

        <Group title="App">
          <div className="flex flex-col gap-2.5 px-4 py-3.5">
            <span className="text-[13px] font-medium text-muted">Theme</span>
            <SegmentedControl
              value={theme}
              onChange={(value) => {
                setTheme(value);
                setThemeState(value);
              }}
              options={(['dark', 'light', 'system'] as Theme[]).map((value) => ({
                value,
                label: THEME_LABEL[value],
              }))}
            />
          </div>
          <Row
            label="Recognition access code"
            value={getAccessCode() ? 'Set' : 'Not set'}
            onClick={() => setSheet('access')}
          />
        </Group>

        <Group title="Diary Data">
          <Row label="Export to JSON" value="" onClick={() => void download()} />
        </Group>

        <Button variant="danger" block onClick={() => void reset()}>
          Delete All Data
        </Button>

        <p className="pb-2 text-center text-[12px] text-faint">
          Yomiq · entries are stored only on this device
        </p>
      </div>

      <BodySheet
        open={sheet === 'body'}
        onClose={() => setSheet(null)}
        profile={profile}
        onSaved={() => toast.show('Stats updated')}
      />
      <TargetsSheet
        open={sheet === 'targets'}
        onClose={() => setSheet(null)}
        targets={profile.targets}
        computed={() => calculateTargets(profile)}
        onSaved={() => toast.show('Target updated')}
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

function BodySheet({
  open,
  onClose,
  profile,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  profile: { sex: Sex; age: number; heightCm: number; weightKg: number; activity: Activity; goal: Goal; targetsOverridden: boolean };
  onSaved: () => void;
}) {
  const [form, setForm] = useState(profile);

  useEffect(() => {
    if (open) setForm(profile);
  }, [open, profile]);

  const save = async () => {
    const body = {
      sex: form.sex,
      age: Number(form.age) || profile.age,
      heightCm: Number(form.heightCm) || profile.heightCm,
      weightKg: Number(form.weightKg) || profile.weightKg,
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
    <Sheet open={open} onClose={onClose} title="Body Stats" tall>
      <div className="flex flex-col gap-4">
        <SegmentedControl
          value={form.sex}
          onChange={(sex) => setForm({ ...form, sex })}
          options={[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
          ]}
        />

        <Field
          label="Age"
          suffix="yrs"
          type="number"
          inputMode="numeric"
          value={String(form.age)}
          onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
        />
        <Field
          label="Height"
          suffix="cm"
          type="number"
          inputMode="numeric"
          value={String(form.heightCm)}
          onChange={(e) => setForm({ ...form, heightCm: Number(e.target.value) })}
        />
        <Field
          label="Weight"
          suffix="kg"
          type="number"
          inputMode="decimal"
          value={String(form.weightKg)}
          onChange={(e) => setForm({ ...form, weightKg: Number(e.target.value) })}
        />

        <span className="px-1 text-[13px] font-medium text-muted">Activity level</span>
        <div className="flex flex-col gap-2">
          {ACTIVITY_OPTIONS.map((option) => (
            <OptionRow
              key={option.value}
              {...option}
              selected={form.activity}
              onSelect={(activity) => setForm({ ...form, activity })}
            />
          ))}
        </div>

        <span className="px-1 text-[13px] font-medium text-muted">Goal</span>
        <div className="flex flex-col gap-2">
          {GOAL_OPTIONS.map((option) => (
            <OptionRow
              key={option.value}
              {...option}
              selected={form.goal}
              onSelect={(goal) => setForm({ ...form, goal })}
            />
          ))}
        </div>

        <Button size="lg" block onClick={() => void save()}>
          Save
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
    <Sheet open={open} onClose={onClose} title="Daily Target" tall>
      <div className="flex flex-col gap-5">
        <MacroTargetsEditor targets={draft} onChange={setDraft} onReset={() => setDraft(computed())} />
        <Button size="lg" block onClick={() => void save()}>
          Save
        </Button>
      </div>
    </Sheet>
  );
}

function AccessCodeSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [code, setCode] = useState('');

  useEffect(() => {
    if (open) setCode(getAccessCode());
  }, [open]);

  return (
    <Sheet open={open} onClose={onClose} title="Access Code">
      <div className="flex flex-col gap-4">
        <p className="text-[14px] leading-snug text-muted">
          Only needed if <code className="text-text">APP_ACCESS_CODE</code> is set on the server. It
          protects recognition from other people's requests hitting your OpenAI key.
        </p>
        <Field
          label="Code"
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
          Save
        </Button>
      </div>
    </Sheet>
  );
}
