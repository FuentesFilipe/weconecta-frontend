import { ChatHistoryResponse, ChatMessageDto, NextResponseDto, SendAnswerRequest } from '@/dtos/ChatMessageDto';
import { useEffect, useRef, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

type Params = {
    surveyId: number;
    clientId: string;
};
 
export function useSurveyConvo ({ surveyId, clientId }: Params) {
    // lista de mensagens da conversa
    const [messages, setMessages] = useState<ChatMessageDto[]>([]);
    // flags de carregamento e envio
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    // erro
    const [error, setError] = useState<string | null>(null);
    // paginacao por cursor
    const [cursor, setCursor] = useState<string | null>(null);
    // referencia para rolar a lista ate o final
    const bottomRef = useRef<HTMLDivElement | null>(null);

    // ao trocar survey/client id limpa estado e busca hisorico
    useEffect(() =>{
        if (!surveyId || !clientId) return;
        setMessages([]);
        setCursor(null);
        void fetchHistory();
    }, [surveyId, clientId]);

    // busca historico de conversa
    async function fetchHistory(next?: string) {
        setLoading(true);
        setError(null);
        try {
            const url = new URL(`${API_BASE}/core/survey-answer/history`);
            url.searchParams.set('surveyId', String(surveyId));
            url.searchParams.set('clientId', clientId);
            if (next) url.searchParams.set('cursor', next);

            const res = await fetch(url.toString(), {credentials: 'include'});
            if (!res.ok) throw new Error('Falha ao carregar historico');
            const data: ChatHistoryResponse = await res.json();

            // ordena por createdAT, remove duplicados por ID
            setMessages(prev => dedupeAndSort([...prev, ...data.messages]));
            setCursor(data.nextCursor ?? null);

            scrollToBottomSoon();
        } catch (e: any) {
            setError(e.message ?? 'Erro ao carregar historico');
        } finally {
            setLoading (false);
        }
    }

    // envia uma resposta e anexa mensagens retornadas
    async function  sendAnswer (payload: Omit<SendAnswerRequest, 'surveyId' | 'clientId'>) {
        setSending(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/core/survey-answer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({ surveyId, clientId, ...payload })
            });
            if (!res.ok) throw new Error('Falha ao enviar a resposta');
            const data: NextResponseDto = await res.json();

            // suporte a appended 
            const appended = 'appended' in data ? data.appended : data.messages;
            setMessages(prev => dedupeAndSort([...prev, ...appended]));
            scrollToBottomSoon();
        } catch (e: any) {
            setError(e.message ?? 'Erro ao enviar a resposta');
        } finally {
            setSending(false);
        }
    }

    // envia texto livre
    function sendText(content: string, surveyElementId?: number) {
        return sendAnswer({ content, surveyElementId});
    }

    // envia selecao de opcoes
    function sendOptions(selectedOptionIds: number[], surveyElementId?: number) {
        return sendAnswer({ selectedOptionsIds: selectedOptionIds, surveyElementId});
    }

    // scroll suave
    function scrollToBottomSoon(){
        requestAnimationFrame(() => {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth'});
        });
    }

    return {
        messages, 
        loading,
        error,
        hasMore: !!cursor,
        fetchMore: () => cursor && fetchHistory(cursor),
        sendText,
        sendOptions,
        sending,
        bottomRef
    };
}

// utilitario, dedupa por id e ordena por createdAT
function dedupeAndSort(list: ChatMessageDto[]) {
    const map = new Map<string, ChatMessageDto>();
    list.forEach(m => map.set(m.id, m));
    return Array.from(map.values()).sort(
        (a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()   
    );
}

