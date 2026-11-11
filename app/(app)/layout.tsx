import Navigation from "@/components/Navigation";
import { PwaInstallButton } from "@/components/PwaInstallButton";
import { ToneLegend } from "@/components/ToneLegend";
import { requireUserId } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUserId();
  return (
    <div className="min-h-dvh bg-stone-50">
      <Navigation />
      <main className="mx-auto w-full max-w-2xl px-4 pb-28 pt-6 md:ml-56 md:max-w-none md:px-8 md:pb-10 md:[&>*]:mx-auto md:[&>*]:max-w-2xl">
        <div className="mb-2 flex items-center justify-end gap-3">
          <PwaInstallButton />
          <ToneLegend />
        </div>
        {children}
      </main>
    </div>
  );
}
