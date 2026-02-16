'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Grid } from 'lucide-react';

interface SortableItemProps {
    id: string;
    children: React.ReactNode;
    className?: string;
}

export default function SortableItem({ id, children, className }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col relative group ${className}`}
        >
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-50 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing hover:bg-slate-100 transition-all z-20 text-slate-400 hover:text-slate-600"
            >
                <Grid className="w-4 h-4" />
            </div>

            {/* Content */}
            <div className="flex-1 w-full h-full overflow-hidden">
                {children}
            </div>
        </div>
    );
}
