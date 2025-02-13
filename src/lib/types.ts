export interface ThemeData {
  name: string;
  maxVotes: number;
  formId: string;
}

export interface VoteData {
  themeId: string;
  voterName: string;
}

export interface FormData {
  title: string;
  description?: string;
  themes: ThemeData[];
}

export interface CachedTheme {
  id: string;
  name: string;
  maxVotes: number;
  _count: {
    votes: number;
  };
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}
