export const views = {
  MINI: 'mini',
  NORMAL: 'normal',
} as const;

export type ViewType = typeof views[keyof typeof views];

export const stages = {
  TERMS: 'TERMS',
  QUESTION: 'QUESTION',
  NORMAL: 'NORMAL',
  CHOOSENFT: 'CHOOSENFT',
};

export type StageType = typeof stages[keyof typeof stages];

export enum FirstPartyDatumType {
  SHORT_TEXT = 'SHORT_TEXT',
  LONG_TEXT = 'LONG_TEXT',
  EMAIL = 'EMAIL',
}

export type FirstPartyAnswers = {
  question_type: FirstPartyDatumType;
  question: string;
  answer: string;
};

export const envs = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
} as const;

export type EnvType = typeof envs[keyof typeof envs];

export type CheckoutWidgetProps = {};
