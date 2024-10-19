import type { Accessor, Setter } from 'solid-js';
import type { CreateEventFn } from './types';
export declare const createVideoEvents: (setPaused: Setter<boolean>, setIsVideoLoading: Setter<boolean>, video: HTMLVideoElement) => () => void;
export declare const createUserEvents: (setCanBeUnmuted: Setter<boolean>, videoCanUnmute: Accessor<boolean>) => () => void;
export declare const createEvents: CreateEventFn;
