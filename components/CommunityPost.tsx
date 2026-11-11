import { AudioClip } from "@/components/AudioClip";
import { Bi } from "@/components/Bi";
import { CommunityQuestionReport } from "@/components/CommunityQuestionReport";
import { CommunityRoleBadge } from "@/components/CommunityRoleBadge";
import { CommunityVoiceFeedback } from "@/components/CommunityVoiceFeedback";
import { Pinyin } from "@/components/Pinyin";
import { PrivateChatInviteButton } from "@/components/PrivateChatInviteButton";
import { TeacherReplyForm } from "@/components/TeacherReplyForm";
import { UserAvatar } from "@/components/UserAvatar";

type CommunityPostData = {
  id: string;
  userId: string;
  text: string;
  meaning: string | null;
  level: string;
  voiceNoteUrl: string | null;
  groupId: string | null;
  createdAt: Date;
  user: { name: string; profileImageUrl: string | null; role: string; nativeSpeaker: boolean };
  group: { name: string } | null;
  responses: Array<{
    id: string;
    teacherName: string;
    teacherId: string | null;
    text: string;
    examplePinyin: string | null;
    voiceNoteUrl: string | null;
    teacher: { name: string; profileImageUrl: string | null; role: string; nativeSpeaker: boolean } | null;
  }>;
  voiceFeedback: Array<{
    id: string;
    rating: string;
    comment: string | null;
    user: { id: string; name: string; profileImageUrl: string | null; role: string; nativeSpeaker: boolean };
  }>;
};

const LEVEL_LABEL: Record<string, { py: string; en: string }> = {
  beginner: { py: "chūjí", en: "Beginner" },
  tones: { py: "shēngdiào", en: "Tones" },
  travel: { py: "lǚxíng", en: "Travel" },
};

export function CommunityPost({
  question,
  currentUserId,
  canReply,
}: {
  question: CommunityPostData;
  currentUserId: string;
  canReply: boolean;
}) {
  return (
    <article className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-stone-600">
        <div className="flex flex-wrap items-center gap-2">
          <UserAvatar name={question.user.name} imageUrl={question.user.profileImageUrl} size={36} />
          <span className="font-medium text-stone-800">{question.user.name}</span>
          <CommunityRoleBadge role={question.user.role} nativeSpeaker={question.user.nativeSpeaker} />
          <PrivateChatInviteButton userId={question.userId} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {question.group && <span className="rounded-full bg-teal-50 px-3 py-1"><Bi label={{ py: question.group.name, en: "Group post" }} /></span>}
          <span className="rounded-full bg-stone-100 px-3 py-1"><Bi label={LEVEL_LABEL[question.level] ?? LEVEL_LABEL.beginner} /></span>
        </div>
      </div>
      <div>
        <p className="break-words text-xl font-semibold"><Pinyin text={question.text} /></p>
        {question.meaning && <p className="mt-1 break-words text-sm text-stone-600">{question.meaning}</p>}
      </div>
      {question.voiceNoteUrl && <AudioClip src={question.voiceNoteUrl} label={{ py: "xuéshēng lùyīn", en: "Learner voice note" }} />}
      {question.voiceNoteUrl && <CommunityVoiceFeedback questionId={question.id} votes={question.voiceFeedback} currentUserId={currentUserId} />}
      <CommunityQuestionReport questionId={question.id} />
      {question.responses.length === 0 ? (
        <p className="text-stone-500"><Bi label={{ py: "děngdài lǎoshī huídá", en: "Waiting for a teacher reply" }} align="start" /></p>
      ) : (
        question.responses.map((response) => (
          <div key={response.id} className="space-y-2 rounded-xl bg-teal-50 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <UserAvatar name={response.teacher?.name ?? response.teacherName} imageUrl={response.teacher?.profileImageUrl ?? null} size={36} />
              <span className="font-medium">{response.teacher?.name ?? response.teacherName}</span>
              <CommunityRoleBadge role={response.teacher?.role ?? "teacher"} nativeSpeaker={response.teacher?.nativeSpeaker ?? false} />
              {response.teacherId && <PrivateChatInviteButton userId={response.teacherId} />}
            </div>
            <p className="text-teal-800"><Bi label={{ py: "lǎoshī huífù", en: "Teacher reply" }} align="start" /></p>
            <p className="break-words">{response.text}</p>
            {response.examplePinyin && <p className="break-words text-xl font-semibold"><Pinyin text={response.examplePinyin} /></p>}
            {response.voiceNoteUrl && <AudioClip src={response.voiceNoteUrl} label={{ py: "lǎoshī lùyīn", en: "Teacher voice note" }} />}
          </div>
        ))
      )}
      {canReply && <TeacherReplyForm questionId={question.id} />}
    </article>
  );
}
