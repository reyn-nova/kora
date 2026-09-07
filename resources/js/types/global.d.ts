/* eslint-disable @typescript-eslint/no-explicit-any */
declare function route(name: string, params?: Record<string, any>): string;
declare function route(): { current(name?: string): boolean };
