export default function WorkoutEditLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-surface">
      <div className="mx-auto max-w-md min-h-dvh">
        {children}
      </div>
    </div>
  );
}
