import { dateFromToday, uniqueSuffix } from '../../shared/test-data';

export interface TestAnnouncement {
  title: string;
  message: string;
  publishDate: string;
}

export function newTestAnnouncement(): TestAnnouncement {
  return {
    title: `Test announcement ${uniqueSuffix()}`,
    message: 'The cafeteria opens an hour later on Friday.',
    publishDate: dateFromToday(3),
  };
}
