import { useEffect } from 'react';

type InfiniteObserverProps = {
    targetRef: React.RefObject<Element>;
    hasMorePages: boolean;
    isLoading: boolean;
    onIntersect: () => void;
    deps: any[];
};

export const useInfiniteObserver = ({
    targetRef,
    hasMorePages,
    isLoading,
    onIntersect,
    deps = [],
}: InfiniteObserverProps) => {
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMorePages && !isLoading) {
                    onIntersect();
                }
            },
            { threshold: 1.0 }
        );

        if (targetRef.current) {
            observer.observe(targetRef.current);
        }

        return () => {
            if (targetRef.current) {
                observer.unobserve(targetRef.current);
            }
        };
    }, [targetRef, hasMorePages, isLoading, ...deps]);
};