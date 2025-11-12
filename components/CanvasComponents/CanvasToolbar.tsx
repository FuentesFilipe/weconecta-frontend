'use client';

import { AlignCenterVertical, RefreshCcw, Save, Undo2 } from 'lucide-react';

interface CanvasToolbarProps {
    onSave: () => void;
    onGoBack: () => void;
    onOrganizeCanvas: () => void;
    clearLocalStorage: () => void;
}

export default function CanvasToolbar({ onSave, onGoBack, onOrganizeCanvas, clearLocalStorage }: CanvasToolbarProps) {
    const buttonStyle = {
        backgroundColor: '#C1C1C1',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '12px 16px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.2s ease-in-out'
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.style.backgroundColor = '#C1C1C1';
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
        e.currentTarget.style.backgroundColor = '#FF894E';
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.style.backgroundColor = '#C1C1C1';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    };

    return (
        <>
            {/* Toolbar superior */}
            <div style={{
                position: 'absolute',
                zIndex: 1000,
                justifyContent: 'space-between',
                display: 'flex',
                flexDirection: 'row-reverse',
                flex: 1,
                padding: '20px',
                paddingRight: '30px',
                width: '-webkit-fill-available',
                gap: '5px'
            }}>
                <button
                    style={buttonStyle}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onClick={onSave}
                >
                    <Save className='w=4 h=4' />
                    Salvar
                </button>

                <button style={buttonStyle} onClick={clearLocalStorage} onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}>
                    <RefreshCcw className='w=4 h=4' />
                </button>

                <button
                    onClick={onGoBack}
                    style={buttonStyle}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <Undo2 className='w=4 h=4' />
                    Voltar
                </button>
            </div>

            {/* Botão de organizar canvas */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '30px',
                    right: '30px',
                    zIndex: 1000
                }}
            >
                <button
                    onClick={onOrganizeCanvas}
                    style={{
                        backgroundColor: '#FF894E',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '60px',
                        height: '60px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                        transition: 'background-color 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                        e.currentTarget.style.backgroundColor = '#FF894E';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                    }}
                >
                    <AlignCenterVertical className='w=4 h=4' />
                </button>
            </div>
        </>
    );
}
