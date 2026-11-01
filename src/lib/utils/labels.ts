import { redirect } from 'next/navigation';
export const CALL_STATUSES = [['connected', 'Connected'], ['not_connected', 'Not connected'], ['busy', 'Busy'], ['switched_off', 'Switched off'],
  ['invalid_number', 'Invalid number'], ['disconnected', 'Disconnected'], ['call_back_requested', 'Call back requested']] as const;
export const INTERESTS = [['unknown', 'Unknown'], ['interested', 'Interested'], ['not_interested', 'Not interested'],
  ['maybe_later', 'Maybe later'], ['registered', 'Registered']] as const;
export const MOCK_TEST_STATUSES = [
  ['interested', 'Interested'],
  ['not_interested', 'Not interested'],
  ['already_attended', 'Already attended'],
  ['not_attended_yet', 'Not attended yet'],
] as const;
export const label = (list: readonly (readonly [string, string])[], v?: string | null) => list.find(([k]) => k === v)?.[1] ?? '—';
export const callValues = CALL_STATUSES.map(([k]) => k) as [string, ...string[]];
export const interestValues = INTERESTS.map(([k]) => k) as [string, ...string[]];
export const mockTestValues = MOCK_TEST_STATUSES.map(([k]) => k) as [string, ...string[]];
export const fail = (path: string, msg: string): never =>
  redirect(`${path}${path.includes('?') ? '&' : '?'}error=${encodeURIComponent(msg)}`);
