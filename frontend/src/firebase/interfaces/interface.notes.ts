export enum AccessPolicyType {
  PRIVATE,
  PUBLIC,
  GROUP
}
  
export const accessPolicyTypeToString = (policy: AccessPolicyType): string => {
  switch (policy) {
    case AccessPolicyType.PRIVATE:
      return 'private';
    case AccessPolicyType.PUBLIC:
      return 'public';
    case AccessPolicyType.GROUP:
      return 'group';
    default:
      throw new Error('Invalid access policy');
  }
};

export const stringToAccessPolicyType = (policy: string): AccessPolicyType => {
  switch (policy.toLowerCase()) {
    case 'private':
      return AccessPolicyType.PRIVATE;
    case 'public':
      return AccessPolicyType.PUBLIC;
    case 'group':
      return AccessPolicyType.GROUP;
    default:
      throw new Error('Invalid access policy string');
  }
};

export interface NoteAccessPolicy {
  type: string;
  allowed_users?: string[];
  allowed_groups?: string[];
}

export interface Note {
  id: string;
  user_id: string;
  subject_id: string;
  title: string;
  content: string;
  date: Date;
  access_policy: NoteAccessPolicy;
  note_ratings: NoteRating[];
  view_counter: number;
}

// Types for the create note input
export interface CreateNoteInput {
  user_id: string;
  subject_id: string;
  title: string;
  content: string;
  access_policy: AccessPolicyType;
  allowed_users?: string[];  // Only used when access_policy is GROUP/PUBLIC
  allowed_groups?: string[]; // Only used when access_policy is GROUP/PUBLIC
}

export interface NoteRating {
  rating: number;
  rated_by_uid: string;
  date: Date;
}