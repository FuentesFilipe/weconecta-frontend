'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import './index.css';
import { Icon } from 'lucide-react';

interface ChatbotProps {
  questionarioId?: string;
}

export default function Chatbot({ questionarioId }: ChatbotProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      console.log('Mensagem enviada:', input, 'Questionário ID:', questionarioId);
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
              
            </Button>

            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua resposta aqui..."
              className="chatbot-input"
            />
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
