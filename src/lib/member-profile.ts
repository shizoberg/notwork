export type NotworkMemberBadge = {
  code: "verified-event-member";
  label: "Doğrulanmış Notwork Üyesi";
  description: "En az bir Notwork etkinliğine katıldı.";
};

export type NotworkMemberReference = {
  id: string;
  targetUsername: string;
  authorUsername: string;
  authorName: string;
  skill: string;
  message: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  reviewedAt: string;
};

export type NotworkMemberEventCode = {
  eventId: string;
  code: string;
  issuedAt: string;
};

export type NotworkMemberConnection = {
  id: string;
  username: string;
  name: string;
  headline: string;
  photoUrl: string;
  email: string;
  instagram: string;
  linkedin: string;
  website: string;
  eventId: string;
  publicCode: string;
  sharedGroupCount: number;
  publicProfileEnabled: boolean;
};

export type PublicNotworkMemberReference = Pick<
  NotworkMemberReference,
  "id" | "authorUsername" | "authorName" | "skill" | "message" | "createdAt"
>;

export type NotworkMemberProfile = {
  id: string;
  memberId: string;
  username: string;
  email: string;
  name: string;
  headline: string;
  bio: string;
  photoUrl: string;
  skills: string[];
  experiences: Array<{
    company: string;
    role: string;
  }>;
  links: {
    linkedin: string;
    instagram: string;
    website: string;
  };
  attendedEvents: string[];
  eventCodes: NotworkMemberEventCode[];
  verifiedMember: boolean;
  publicProfileEnabled: boolean;
  badge?: NotworkMemberBadge;
  status: "invited" | "active" | "suspended";
  mustChangePassword: boolean;
  credentialIssuedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type PublicNotworkMemberProfile = Pick<
  NotworkMemberProfile,
  | "username"
  | "name"
  | "headline"
  | "bio"
  | "photoUrl"
  | "skills"
  | "experiences"
  | "links"
  | "attendedEvents"
  | "verifiedMember"
  | "badge"
> & {
  references: PublicNotworkMemberReference[];
};

export type TemporaryMemberCredential = {
  name: string;
  email: string;
  username: string;
  temporaryPassword: string;
};

export type MemberProfilesAdminPayload = {
  profiles: NotworkMemberProfile[];
  references: NotworkMemberReference[];
  credentials?: TemporaryMemberCredential[];
  sourceCount?: number;
  syncedCount?: number;
};
