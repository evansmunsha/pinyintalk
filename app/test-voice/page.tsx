import { Bi } from "@/components/Bi";
import { VoiceLoop } from "@/components/VoiceLoop";
import { T } from "@/lib/ui-text";

export default function TestVoicePage() {
  return (
    <main className="mx-auto w-full max-w-md space-y-5 px-4 py-8">
      <h1 className="text-2xl"><Bi label={T.talkToMei} align="start" /></h1>
      <p className="text-stone-600"><Bi label={T.testVoiceHelp} align="start" /></p>
      <VoiceLoop />
    </main>
  );
}
