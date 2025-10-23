'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  BarChart2, 
  FileText, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';
import styles from './page.module.css';

// Dados mockados para demonstração
const questionariosData = [
  { nome: 'Câncer de mama', respondidos: 46 },
  { nome: 'Câncer de próstata', respondidos: 17 },
  { nome: 'Câncer de pele', respondidos: 19 },
  { nome: 'Obesidade', respondidos: 29 },
];

const respostasData = [
  { mes: 'Jan', respondidos: 100, enviados: 200 },
  { mes: 'Fev', respondidos: 150, enviados: 300 },
  { mes: 'Mar', respondidos: 200, enviados: 350 },
  { mes: 'Abr', respondidos: 250, enviados: 400 },
  { mes: 'Mai', respondidos: 300, enviados: 450 },
  { mes: 'Jun', respondidos: 350, enviados: 500 },
  { mes: 'Jul', respondidos: 400, enviados: 550 },
  { mes: 'Ago', respondidos: 450, enviados: 600 },
  { mes: 'Set', respondidos: 500, enviados: 650 },
  { mes: 'Out', respondidos: 550, enviados: 700 },
  { mes: 'Nov', respondidos: 600, enviados: 750 },
  { mes: 'Dez', respondidos: 650, enviados: 800 },
];

export default function MetricasContent() {
  const summaryItems = [
    {
      icon: <BarChart2 className="text-blue-500" />,
      value: 512,
      label: 'Respondidos',
      trend: '+10% desde ontem',
      bgColor: 'bg-blue-50'
    },
    {
      icon: <FileText className="text-green-500" />,
      value: 10,
      label: 'Criados',
      trend: '+8% desde ontem',
      bgColor: 'bg-green-50'
    },
    {
      icon: <CheckCircle className="text-cyan-500" />,
      value: 500,
      label: 'Saudáveis',
      trend: '+3% desde ontem',
      bgColor: 'bg-cyan-50'
    },
    {
      icon: <AlertTriangle className="text-red-500" />,
      value: 12,
      label: 'Críticos',
      trend: '+3% desde ontem',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      
      {/* Linha 1: Questionários (esquerda) e Métricas (direita) */}
      <div className={styles.metricsContainer}>
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4 text-orange-500">Questionários</h2>
          <p className="text-sm text-gray-500 mb-4">Resumo</p>
          <div className={styles.questionariosSummaryCard}>
            {summaryItems.map((item) => (
              <div key={item.label} className={styles.summaryItem}>
                <div className={`${styles.summaryItemIcon} ${item.bgColor}`}>
                  {item.icon}
                </div>
                <div className={styles.summaryItemValue}>{item.value}</div>
                <div className={styles.summaryItemLabel}>{item.label}</div>
                <div className={`${styles.summaryItemTrend} ${
                  item.trend.includes('+') ? 'positive' : 'negative'
                }`}>
                  {item.trend}
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4 text-orange-500">Métricas</h2>
          <div className={styles.barChartContainer}>
            <div className={styles.barChartBars}>
              {[
                { respondidos: 50, enviados: 30 },
                { respondidos: 70, enviados: 60 },
                { respondidos: 45, enviados: 50 },
                { respondidos: 40, enviados: 45 },
                { respondidos: 50, enviados: 25 },
                { respondidos: 55, enviados: 35 },
              ].map((bar, index) => (
                <div key={index} className={styles.barChartBar}>
                  <div className={styles.barChartBarStack}>
                    <div 
                      className={styles.barChartBarSegment}
                      style={{ 
                        height: `${bar.respondidos}%`,
                        backgroundColor: '#ff7300',
                        order: 2
                      }}
                    />
                    <div 
                      className={styles.barChartBarSegment}
                      style={{ 
                        height: `${bar.enviados}%`,
                        backgroundColor: '#d1d5db',
                        borderRadius: '4px 4px 0 0',
                        order: 1
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.barChartLegend}>
              <div className={styles.barChartLegendItem}>
                <div className={`${styles.barChartLegendDot} respondidos`} />
                <span>Respondidos</span>
              </div>
              <div className={styles.barChartLegendItem}>
                <div className={`${styles.barChartLegendDot} enviados`} />
                <span>Enviados</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Linha 2: Top Questionários (esquerda) e Respostas (direita) */}
      <div className={styles.metricsContainer}>
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4 text-orange-500">Top Questionários</h2>
          <div className={styles.topQuestionariosContainer}>
            <div className={styles.topQuestionariosHeader}>
              <div>#</div>
              <div>Nome</div>
              <div>Respondidos</div>
              <div>%</div>
            </div>
            {questionariosData.map((item, index) => (
              <div key={item.nome} className={styles.topQuestionarioItem}>
                <div className={styles.topQuestionarioIndex}>
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div className={styles.topQuestionarioName}>{item.nome}</div>
                <div className={styles.progressBarContainer}>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressBarFill}
                      style={{ width: `${item.respondidos}%` }}
                    />
                  </div>
                </div>
                <div className={styles.topQuestionarioPercentage}>
                  {item.respondidos}%
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4 text-orange-500">Respostas</h2>
          <div className={styles.areaChartContainer}>
            <svg viewBox="0 0 400 200" className={styles.areaChartSvg}>
              <defs>
                <linearGradient id="gradientUltimoMes" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#ff7300', stopOpacity: 0.6 }} />
                  <stop offset="100%" style={{ stopColor: '#ff7300', stopOpacity: 0.1 }} />
                </linearGradient>
                <linearGradient id="gradientEsseMes" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#1e3a8a', stopOpacity: 0.4 }} />
                  <stop offset="100%" style={{ stopColor: '#1e3a8a', stopOpacity: 0.05 }} />
                </linearGradient>
              </defs>
              
              {/* Área Esse Mês */}
              <path
                d="M 20,120 L 60,100 L 100,130 L 140,125 L 180,140 L 220,135 L 260,145 L 300,130 L 340,110 L 380,90 L 380,200 L 20,200 Z"
                fill="url(#gradientEsseMes)"
              />
              <polyline
                points="20,120 60,100 100,130 140,125 180,140 220,135 260,145 300,130 340,110 380,90"
                fill="none"
                stroke="#1e3a8a"
                strokeWidth="2"
              />
              {[20, 60, 100, 140, 180, 220, 260, 300, 340, 380].map((x, i) => {
                const y = [120, 100, 130, 125, 140, 135, 145, 130, 110, 90][i];
                return <circle key={`esse-${i}`} cx={x} cy={y} r="3" fill="#1e3a8a" />;
              })}
              
              {/* Área Último Mês */}
              <path
                d="M 20,80 L 60,85 L 100,70 L 140,90 L 180,75 L 220,80 L 260,85 L 300,75 L 340,95 L 380,60 L 380,200 L 20,200 Z"
                fill="url(#gradientUltimoMes)"
              />
              <polyline
                points="20,80 60,85 100,70 140,90 180,75 220,80 260,85 300,75 340,95 380,60"
                fill="none"
                stroke="#ff7300"
                strokeWidth="2"
              />
              {[20, 60, 100, 140, 180, 220, 260, 300, 340, 380].map((x, i) => {
                const y = [80, 85, 70, 90, 75, 80, 85, 75, 95, 60][i];
                return <circle key={`ultimo-${i}`} cx={x} cy={y} r="3" fill="#ff7300" />;
              })}
            </svg>
            
            <div className={styles.areaChartLegend}>
              <div className={styles.areaChartLegendItem}>
                <div className={styles.areaChartLegendLabel}>
                  <div className={`${styles.areaChartLegendDot} ultimoMes`} />
                  <span>Último Mês</span>
                </div>
                <div className={`${styles.areaChartLegendValue} ultimoMes`}>4102</div>
              </div>
              <div className={styles.areaChartLegendItem}>
                <div className={styles.areaChartLegendLabel}>
                  <div className={`${styles.areaChartLegendDot} esseMes`} />
                  <span>Esse Mês</span>
                </div>
                <div className={`${styles.areaChartLegendValue} esseMes`}>5320</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Linha 3: Respondidos (esquerda) e Questionários (direita) */}
      <div className={styles.metricsContainer}>
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4 text-orange-500">Respondidos</h2>
          <div className="flex items-center justify-between">
            <div className={styles.respondidosInfo}>
              <div className={styles.respondidosLabel}>Total Respondido</div>
              <div className={styles.respondidosValue}>6000</div>
              <div className={styles.respondidosDescription}>48% a mais que o último mês.</div>
            </div>
            <div className={styles.radialProgressContainer}>
              <svg viewBox="0 0 120 120" className={styles.radialProgress}>
                <circle 
                  cx="60" 
                  cy="60" 
                  r="50" 
                  className={styles.radialProgressBackground}
                />
                <circle 
                  cx="60" 
                  cy="60" 
                  r="50" 
                  className={styles.radialProgressForeground}
                  strokeDasharray="314.159"
                  strokeDashoffset={`${314.159 * (1 - 0.8)}`}
                />
              </svg>
              <div className={styles.radialProgressText}>80%</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4 text-orange-500">Questionários</h2>
          <div className={styles.lineChartContainer}>
            <svg viewBox="0 0 800 300" className={styles.lineChartSvg}>
              <defs>
                <linearGradient id="gradientQuestionarios" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#ff7300', stopOpacity: 0.4 }} />
                  <stop offset="100%" style={{ stopColor: '#ff7300', stopOpacity: 0.05 }} />
                </linearGradient>
              </defs>
              
              {/* Linhas horizontais de grade */}
              {[0, 100, 200, 300, 400, 500].map((value, i) => {
                const y = 250 - (value / 500) * 200;
                return (
                  <g key={`grid-${i}`}>
                    <line x1="50" y1={y} x2="750" y2={y} stroke="#e5e7eb" strokeWidth="1" />
                    <text x="20" y={y + 5} className={styles.lineChartAxisLabel}>{value}</text>
                  </g>
                );
              })}
              
              {/* Área preenchida */}
              <path
                d="M 50,230 L 100,220 L 150,225 L 200,240 L 250,150 L 300,160 L 350,140 L 400,80 L 450,70 L 500,100 L 550,90 L 600,110 L 650,180 L 700,160 L 750,140 L 750,250 L 50,250 Z"
                fill="url(#gradientQuestionarios)"
              />
              
              {/* Linha */}
              <polyline
                points="50,230 100,220 150,225 200,240 250,150 300,160 350,140 400,80 450,70 500,100 550,90 600,110 650,180 700,160 750,140"
                fill="none"
                stroke="#ff7300"
                strokeWidth="3"
              />
              
              {/* Pontos */}
              {[
                [50, 230], [100, 220], [150, 225], [200, 240], [250, 150], 
                [300, 160], [350, 140], [400, 80], [450, 70], [500, 100], 
                [550, 90], [600, 110], [650, 180], [700, 160], [750, 140]
              ].map(([x, y], i) => (
                <circle key={`point-${i}`} cx={x} cy={y} r="4" fill="#ff7300" />
              ))}
              
              {/* Labels do eixo X */}
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => {
                const x = 50 + (i * 58);
                return (
                  <text key={`month-${i}`} x={x} y="275" className={styles.lineChartAxisLabel} textAnchor="middle">
                    {month}
                  </text>
                );
              })}
            </svg>
          </div>
        </Card>
      </div>
    </div>
  );
}
