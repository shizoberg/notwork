export function matchChatKey(
  prefix: string,
  participantId: string,
  group: { id: string; participantIds: string[] } | null,
  expectedGroupId?: string,
) {
  if (!group || !group.participantIds.includes(participantId))
    throw new Error("Sohbet için aktif eşleşmen olmalı");
  if (expectedGroupId && expectedGroupId !== group.id)
    throw new Error("Grubun değişti. Yeni grubunun sohbetini aç.");
  return `${prefix}/group-chats/${encodeURIComponent(group.id)}.json`;
}
