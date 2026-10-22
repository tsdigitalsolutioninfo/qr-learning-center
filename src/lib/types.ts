/* eslint-disable @typescript-eslint/no-explicit-any */
// PostgREST embedded relations are untyped until `supabase gen types` is added; rows are treated as loose records.
export type Row = Record<string, any>;
