import { BottomNav } from "@/components/common/BottomNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="flex-1 overflow-y-auto bg-surface pb-20">
        <div className="mx-auto max-w-md px-6 pt-12 pb-6">{children}</div>
      </main>
      <BottomNav />
    </>
  );
}
