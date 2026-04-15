import { pastPapersDataExtended } from './past-papers-extended';

export const pastPapersData = [...pastPapersDataExtended] as const;

export type PastPaperData = (typeof pastPapersData)[number];
