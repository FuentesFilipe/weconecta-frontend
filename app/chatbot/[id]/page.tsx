import Chatbot from '../Chatbot';

interface ChatbotPageProps {
    params: {
        id: string;
    };
}

export default function ChatbotPage({ params }: ChatbotPageProps) {
    return <Chatbot questionarioId={params.id} />;
}
