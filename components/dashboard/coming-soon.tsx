export function ComingSoon({ moduleName, phase }: { moduleName: string; phase: number }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-lg border border-dashed border-border text-center">
      <h1 className="text-lg font-semibold text-ink-900">{moduleName}</h1>
      <p className="mt-1 max-w-sm text-sm text-ink-500">
        This module is scoped for Phase {phase} of the build and isn't wired up yet. The route, navigation entry, and
        access control for it already exist so it's ready to be built next.
      </p>
    </div>
  );
}
