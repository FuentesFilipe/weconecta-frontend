'use client';

import { Button } from '@/components/Button';
import { SurveysElementModal } from '@/components/Modal/SurveysElementModal';
import { useGetAllSurveysElements } from '@/services/core/surveysElements/queries';
import React from 'react';

export default function HomePage() {
    const { data, isLoading } = useGetAllSurveysElements({});

    const [selectedId, setSelectedId] = React.useState<number | null>(null);

    if (!data) {
        return <p>Vazio</p>
    }

    return (
        <>
            {selectedId && <SurveysElementModal id={selectedId} open={true} onClose={() => setSelectedId(null)} />}
            {data.map((item) => (
                <Button key={item.id} onClick={() => setSelectedId(item.id)}>
                    <span>{item.description}</span>
                </Button>
            ))}
        </>
    );
}








