import type { GeneratedTypes as GT } from './payload-types';

declare module 'payload' {
  // This tells TS: "extend Payload's GeneratedTypes with my generated types"
  interface GeneratedTypes extends GT {}
}
