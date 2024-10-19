import type { JSX, Component, Accessor, Setter } from 'solid-js';
export type VideoProps = {
    source: string;
    type: JSX.SourceHTMLAttributes<HTMLSourceElement>['type'];
    onFailed?: OnFailedFn;
};
export type OnFailedFn = (video: HTMLVideoElement, retry: () => Promise<void>, canBeUnmuted: boolean) => void | Promise<void>;
export type VideoFn = Component<Omit<JSX.VideoHTMLAttributes<HTMLVideoElement>, 'autoplay'> & {
    autoplay?: JSX.VideoHTMLAttributes<HTMLVideoElement>['autoplay'] | Accessor<JSX.VideoHTMLAttributes<HTMLVideoElement>['autoplay']>;
} & {
    onFailed?: OnFailedFn;
}>;
export type CreateEventFn = (props: {
    setPaused: Setter<boolean>;
    video: HTMLVideoElement;
    setCanBeUnmuted: Setter<boolean>;
    videoCanUnmute: Accessor<boolean>;
    setIsVideoLoading: Setter<boolean>;
}) => () => void;
