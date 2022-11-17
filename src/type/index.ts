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
