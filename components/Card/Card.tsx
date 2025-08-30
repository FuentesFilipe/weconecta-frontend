import { Files, SquarePen, Trash2, SquaresUnite, Link } from 'lucide-react';

import { Card } from '@/components/ui/card';

import './index.css';

export function CardComponent() {
    return (
        <Card className='card-box'>
            <section className='top-button-alignment'>
                <SquarePen className='top-icons' />
                <SquaresUnite className='top-icons' />
                <Trash2 className='top-icons' />
            </section>
            <Files className='center-icon-alignment' />
            <div className='footer-text'>
                <h4>TEXTO UM</h4>
                <strong>
                    <h4>SEGUNDO TEXTINHO</h4>
                </strong>
            </div>
            <Link className='footer-icon-alignment' />
        </Card>
    );
}
