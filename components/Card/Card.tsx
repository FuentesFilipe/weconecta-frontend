import { Files, SquarePen, Trash2, SquaresUnite, Link } from 'lucide-react';
import { JSX, useState } from 'react';

import { Card } from '@/components/ui/card';

import './index.css';

const mockData = [
    {
        id: 1,
        title: 'Câncer de Mama',
        questionnaire_url: 'https://exemplo/questionario/1'
    },
    {
        id: 2,
        title: 'Problemas Cardíacos',
        questionnaire_url: 'https://exemplo/questionario/2'
    },
    {
        id: 3,
        title: 'Avaliação de Desempenho Trimestral',
        questionnaire_url: 'https://exemplo/questionario/3'
    }
];

type CardComponentProps = {
    id: number;
    initialTitle: string;
    url: string;
    onDelete: (id: number) => void;
    onUpdateTitle: (id: number, newTitle: string) => void;
};

function CardComponent({ id, initialTitle, url, onDelete, onUpdateTitle }: CardComponentProps): JSX.Element {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [title, setTitle] = useState<string>(initialTitle);

    const handleFinishEditing = (): void => {
        setIsEditing(false);
        onUpdateTitle(id, title);
    };

    const handleStartEditing = (): void => setIsEditing(true);
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>): void => setTitle(e.target.value);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Enter') handleFinishEditing();
    };

    const handleDeleteClick = (): void => {
        onDelete(id);
    };

    const handleCopyLink = (): void => {
        navigator.clipboard
            .writeText(url)
            .then(() => {
                alert('URL copiada para a área de transferência!');
            })
            .catch((err) => {
                alert(err);
            });
    };

    return (
        <Card className='card-box'>
            <section className='top-button-alignment'>
                <SquarePen className='top-icons' onClick={handleStartEditing} />
                <a href={url}>
                    <SquaresUnite className='top-icons' />
                </a>
                <Trash2 className='top-icons' onClick={handleDeleteClick} />
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
                        maxLength={50}
                    />
                ) : (
                    <h2 onClick={handleStartEditing} title={title}>
                        {title}
                    </h2>
                )}
            </div>
            <Link className='footer-icon-alignment' onClick={handleCopyLink} />
        </Card>
    );
}

export function CardContainer(): JSX.Element {
    const [cards, setCards] = useState(mockData);

    const handleDeleteCard = (idToDelete: number): void => {
        setCards((currentCards) => currentCards.filter((card) => card.id !== idToDelete));
    };

    const handleUpdateTitle = (idToUpdate: number, newTitle: string): void => {
        setCards((currentCards) =>
            currentCards.map((card) => (card.id === idToUpdate ? { ...card, title: newTitle } : card))
        );
    };

    return (
        <div className='cards-display'>
            {cards.map((card) => (
                <CardComponent
                    key={card.id}
                    id={card.id}
                    initialTitle={card.title}
                    url={card.questionnaire_url}
                    onDelete={handleDeleteCard}
                    onUpdateTitle={handleUpdateTitle}
                />
            ))}
        </div>
    );
}
