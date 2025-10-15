'use client';

import React from 'react';

export default function CanvaLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
            <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
                {children}
            </div>
        </div>
    );
}
