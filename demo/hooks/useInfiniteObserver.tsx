import { useEffect, useRef } from 'react';

type InfiniteObserverProps = {
    targetRef: React.RefObject<Element>;
    hasMorePages: boolean;
    isLoading: boolean;
    onIntersect: () => void;
    deps?: any[];
};

export const useInfiniteObserver = ({
    targetRef,
    hasMorePages,
    isLoading,
    onIntersect,
    deps = [],
}: InfiniteObserverProps) => {
    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        if (isLoading || !hasMorePages) return;

        const handleIntersect = (entries: IntersectionObserverEntry[]) => {
            const [entry] = entries;
            if (entry?.isIntersecting && hasMorePages && !isLoading) {
                onIntersect();
            }
        };

        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        observerRef.current = new IntersectionObserver(handleIntersect, {
            root: null,
            rootMargin: '100px',
            threshold: 0.1,
        });

        const currentTarget = targetRef.current;
        if (currentTarget) {
            observerRef.current.observe(currentTarget);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [targetRef, hasMorePages, isLoading, onIntersect, ...deps]);
};