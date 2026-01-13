import React, { Suspense, lazy, memo } from 'react';

const Spline = lazy(() => import('@splinetool/react-spline'));

export const InteractiveRobotSpline = memo(({ scene, className }) => {
    return (
        <Suspense
            fallback={
                <div className={`w-full h-full ${className}`}></div>
            }
        >
            <Spline
                scene={scene}
                className={className}
            />
        </Suspense>
    );
});
