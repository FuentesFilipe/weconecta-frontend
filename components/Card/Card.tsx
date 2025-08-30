import { Files, SquarePen, Trash2, SquaresUnite, Link } from 'lucide-react';
import { JSX, useState } from 'react';

import { Card } from '@/components/ui/card';

import './index.css';

type CardComponentProps = {
    onDelete: () => void;
};

function CardComponent({ onDelete }: CardComponentProps): JSX.Element {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [title, setTitle] = useState<string>('SEGUNDO TEXTINHO');

    const handleFinishEditing = (): void => setIsEditing(false);
    const handleStartEditing = (): void => setIsEditing(true);
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>): void => setTitle(e.target.value);
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Enter') handleFinishEditing();
    };

    const handleDeleteClick = (): void => {
        onDelete();
    };

    return (
        <Card className='card-box'>
            <section className='top-button-alignment'>
                <SquarePen className='top-icons' onClick={handleStartEditing} style={{ cursor: 'pointer' }} />
                <SquaresUnite className='top-icons' />
                <Trash2 className='top-icons' onClick={handleDeleteClick} style={{ cursor: 'pointer' }} />
            </section>
            <Files className='center-icon-alignment' />
            <div className='footer-text'>
                <h3>Questionário</h3>
                {isEditing ? (
                    <input
                        type='text'
                        value={title}
                        onChange={handleTitleChange}
                        onBlur={handleFinishEditing}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        className='h2-input'
                    />
                ) : (
                    <h2 onClick={handleStartEditing}>{title}</h2>
                )}
            </div>
            <Link className='footer-icon-alignment' />
        </Card>
    );
}

export function CardContainer(): JSX.Element {
    const [isCardVisible, setIsCardVisible] = useState<boolean>(true);

    const handleRequestDelete = (): void => {
        setIsCardVisible(false);
    };

    if (!isCardVisible) {
        return (
            <div style={{ padding: '20px' }}>
                <button onClick={() => setIsCardVisible(true)}></button>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <CardComponent onDelete={handleRequestDelete} />
        </div>
    );
}
