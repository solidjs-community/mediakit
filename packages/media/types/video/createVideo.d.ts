import type { VideoFn, VideoProps } from './types';
export declare const unwrapValue: <T>(value: T | (() => T)) => T;
export declare function createVideo(props: VideoProps): {
    Video: VideoFn;
    play: () => Promise<void>;
    pause: () => void;
    paused: import("solid-js").Accessor<boolean>;
    canBeUnmuted: import("solid-js").Accessor<boolean>;
    isVideoLoading: import("solid-js").Accessor<boolean>;
};
