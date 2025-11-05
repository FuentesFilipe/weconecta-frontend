'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowRight, Paperclip } from "lucide-react";
import { useState } from 'react';
import { Loading } from '../../components/ui';
import { SurveyDto } from '../../dtos/SurveyDto';
import { useGetSurveyByIdAndClientId } from '../../services/core/surveys/queries';
import './index.css';

export default function ChatbotWrapper() {
    const params = new URLSearchParams(window.location.search);
    // Id do questionário
    const questionarioId = Number(params.get('s')) ?? undefined;
    // Id de quem gerou o link para o questionário
    const clientId = params.get('c') ?? undefined;

    const { data: survey, isLoading, error } = useGetSurveyByIdAndClientId(questionarioId, clientId);

    if (!questionarioId || !clientId) {
        return <div>Parâmetros do questionário inválidos.</div>;
    }

    if (error) {
        return <div>Erro ao carregar o questionário.</div>;
    }

    if (isLoading) {
        return <Loading />;
    }

    if (!survey) {
        return <></>;
    }

    return (
        <Chatbot survey={survey} clientId={clientId} />
    );
}

function Chatbot({ survey, clientId }: { survey: SurveyDto, clientId: string }) {
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            console.log('Mensagem enviada:', input, 'Questionário ID:', survey.id, 'Client ID:', clientId);
            setInput('');
        }
    };

    return (
        <div className="chatbot-container">
            <Card className="chatbot-main">
                <CardHeader className="chatbot-header">
                    <div aria-label='logo-group'>
                        <img
                            src="/logo_padrao_horizontal.png"
                            className="weconecta-logo" />
                    </div>
                </CardHeader>

                <CardContent className="chatbot-messages">
                    {/* Área das mensagens */}
                </CardContent>

                <CardFooter className="chatbot-input-container">
                    <form onSubmit={handleSubmit} className="chatbot-input-wrapper">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="attachment-icon"
                        >
                            <Paperclip className="w-5 h-5 icon-orange" />
                        </Button>

                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Digite sua resposta aqui..."
                            className="chatbot-input"
                        />

                        <Button
                            type="submit"
                            variant="ghost"
                            size="icon"
                            className="send-icon"
                        >
                            <ArrowRight className="w-5 h-5" color="#e46f2c" />
                        </Button>

                    </form>
                </CardFooter>
            </Card>
        </div>
    );
}
