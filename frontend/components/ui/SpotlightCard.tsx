'use client';

import React, { useRef } from 'react';
import './SpotlightCard.css';

interface SpotlightCardProps extends React.PropsWithChildren {
    className?: string;
    spotlightColor?: string;
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({
    children,
    className = '',
    spotlightColor = 'rgba(255, 255, 255, 0.25)'
}) => {
    const divRef = useRef<HTMLDivElement>(null);

    const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = e => {
        if (!divRef.current) return;

        const rect = divRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        divRef.current.style.setProperty('--mouse-x', `${x}px`);
        divRef.current.style.setProperty('--mouse-y', `${y}px`);
        divRef.current.style.setProperty('--spotlight-color', spotlightColor);
    };

    // Ensure className combines with card-spotlight
    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            className={`card-spotlight ${className}`}
            style={{} as React.CSSProperties} // Empty styles to suppress type error if needed, or pass props
        >
            {children}
        </div>
    );
};

export default SpotlightCard;
