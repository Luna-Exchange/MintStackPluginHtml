export const views = {
  MINI: "mini",
  NORMAL: "normal",
} as const;

export type ViewType = typeof views[keyof typeof views];

export const stages = {
  TERMS : 'TERMS',
  QUESTION : 'QUESTION',
  NORMAL : 'NORMAL',
  CHOOOSENFT : 'CHOOSENFT'
}

export type StageType = typeof stages[keyof typeof stages];

export enum FirstPartyDatumType {
  SHORT_TEXT = "SHORT_TEXT",
  LONG_TEXT = "LONG_TEXT",
  EMAIL = "EMAIL",
}

export type FirstPartyAnswers = {
  question_type: FirstPartyDatumType;
  question: string;
  answer: string;
};

export type CheckoutWidgetProps = {};
