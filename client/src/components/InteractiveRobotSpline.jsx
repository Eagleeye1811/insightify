import React, { Suspense, lazy } from 'react';

const Spline = lazy(() => import('@splinetool/react-spline'));

export function InteractiveRobotSpline({ scene, className }) {
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
}
