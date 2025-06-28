export interface RecentSearch {
  term: string;
  type: 'FLIGHT' | 'HOTEL' | 'BUS';
  id?: string;
  timestamp: number; // Unix timestamp in milliseconds
}
