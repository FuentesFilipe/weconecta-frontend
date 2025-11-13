'use client';

import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { 
  BarChart2, 
  FileText, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';
import styles from './page.module.css';
import { useGetAllSurveys, useGetSurveysGroupedByMonth } from '@/services/core/surveys/queries';
import { 
  useGetAllSurveysStatistics, 
  useGetAnswersGroupedByMonth,
  useGetAnswersByCurrentAndPreviousMonth 
} from '@/services/core/surveyAnswer/queries';
import { Skeleton } from '@/components/ui/skeleton';

export default function MetricasContent() {
  // Busca todos os questionários
  const { data: surveysData, isLoading: surveysLoading } = useGetAllSurveys({});
  const surveys = surveysData?.[0] || [];

  // Busca estatísticas de todos os questionários
  const surveyIds = useMemo(() => surveys.filter(s => s.id).map(s => s.id!), [surveys]);
  const { data: statisticsData, isLoading: statisticsLoading } = useGetAllSurveysStatistics(surveyIds);

  // Busca dados históricos
  const { data: monthlyAnswersData, isLoading: monthlyAnswersLoading } = useGetAnswersGroupedByMonth(6);
  const { data: monthlyComparisonData, isLoading: monthlyComparisonLoading } = useGetAnswersByCurrentAndPreviousMonth();
  const { data: monthlySurveysData, isLoading: monthlySurveysLoading } = useGetSurveysGroupedByMonth(12);

  // Calcula totais agregados
  const totals = useMemo(() => {
    if (!statisticsData) {
      return {
        totalStarted: 0,
        totalFinished: 0,
        totalInProgress: 0,
        totalSurveys: 0,
      };
    }

    return statisticsData.reduce(
      (acc, item) => ({
        totalStarted: acc.totalStarted + item.statistics.totalStarted,
        totalFinished: acc.totalFinished + item.statistics.totalFinished,
        totalInProgress: acc.totalInProgress + item.statistics.totalInProgress,
        totalSurveys: acc.totalSurveys + 1,
      }),
      { totalStarted: 0, totalFinished: 0, totalInProgress: 0, totalSurveys: 0 }
    );
  }, [statisticsData]);

  // Prepara dados dos questionários com estatísticas
  const questionariosData = useMemo(() => {
    if (!surveys.length || !statisticsData) return [];

    return surveys
      .map((survey) => {
        const stats = statisticsData.find((s) => s.surveyId === survey.id);
        return {
          id: survey.id,
          nome: survey.title,
          respondidos: stats?.statistics.totalFinished || 0,
          iniciados: stats?.statistics.totalStarted || 0,
          emProgresso: stats?.statistics.totalInProgress || 0,
        };
      })
      .sort((a, b) => b.respondidos - a.respondidos)
      .slice(0, 4); // Top 4
  }, [surveys, statisticsData]);

  const isLoading = surveysLoading || statisticsLoading || monthlyAnswersLoading || monthlyComparisonLoading || monthlySurveysLoading;

  // Prepara dados do gráfico de barras (últimos 6 meses)
  const barChartData = useMemo(() => {
    if (!monthlyAnswersData || monthlyAnswersData.length === 0) {
      return Array(6).fill({ respondidos: 0, enviados: 0 });
    }

    // Garantir que temos dados para os últimos 6 meses
    const last6Months = monthlyAnswersData.slice(-6);
    const maxValue = Math.max(...last6Months.map(d => d.count), 1);

    return last6Months.map(item => ({
      respondidos: maxValue > 0 ? (item.count / maxValue) * 100 : 0,
      enviados: maxValue > 0 ? ((item.count * 0.8) / maxValue) * 100 : 0, // Aproximação: enviados = 80% dos respondidos
    }));
  }, [monthlyAnswersData]);

  // Prepara dados do gráfico de área (últimos 10 meses)
  const areaChartData = useMemo(() => {
    if (!monthlyAnswersData || monthlyAnswersData.length === 0) {
      return { currentMonth: [], previousMonth: [] };
    }

    const last10Months = monthlyAnswersData.slice(-10);
    const maxValue = Math.max(...last10Months.map(d => d.count), 1);
    
    // Dividir em dois períodos: últimos 5 meses (mês atual) e 5 anteriores (mês anterior)
    const currentPeriod = last10Months.slice(-5);
    const previousPeriod = last10Months.slice(-10, -5);

    const normalize = (value: number) => {
      const normalized = maxValue > 0 ? (value / maxValue) * 180 : 0;
      return Math.max(10, Math.min(190, 200 - normalized)); // Inverter para gráfico (valores maiores no topo)
    };

    return {
      currentMonth: currentPeriod.map(item => normalize(item.count)),
      previousMonth: previousPeriod.map(item => normalize(item.count)),
    };
  }, [monthlyAnswersData]);

  // Prepara dados do gráfico de linha (questionários criados por mês)
  const lineChartData = useMemo(() => {
    if (!monthlySurveysData || monthlySurveysData.length === 0) {
      return { points: [], maxValue: 1, months: [] };
    }

    const last12Months = monthlySurveysData.slice(-12);
    const maxValue = Math.max(...last12Months.map(d => d.count), 1);
    
    const normalize = (value: number) => {
      const normalized = maxValue > 0 ? (value / maxValue) * 200 : 0;
      return Math.max(10, Math.min(240, 250 - normalized)); // Inverter para gráfico
    };

    const points = last12Months.map((item, index) => {
      const x = 50 + (index * (700 / (last12Months.length - 1 || 1)));
      const y = normalize(item.count);
      return { x, y, value: item.count };
    });

    const monthLabels = last12Months.map(item => {
      const [year, month] = item.month.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString('pt-BR', { month: 'short' });
    });

    return { points, maxValue, months: monthLabels };
  }, [monthlySurveysData]);

  const summaryItems = [
    {
      icon: <BarChart2 className="text-blue-500" />,
      value: isLoading ? '...' : totals.totalFinished,
      label: 'Finalizados',
      trend: '',
      bgColor: 'bg-blue-50'
    },
    {
      icon: <FileText className="text-green-500" />,
      value: isLoading ? '...' : totals.totalSurveys,
      label: 'Criados',
      trend: '',
      bgColor: 'bg-green-50'
    },
    {
      icon: <CheckCircle className="text-cyan-500" />,
      value: isLoading ? '...' : totals.totalStarted,
      label: 'Iniciados',
      trend: '',
      bgColor: 'bg-cyan-50'
    },
    {
      icon: <AlertTriangle className="text-red-500" />,
      value: isLoading ? '...' : totals.totalInProgress,
      label: 'Em Progresso',
      trend: '',
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
            {isLoading ? (
              <div className={styles.barChartBars}>
                {Array(6).fill(0).map((_, index) => (
                  <div key={index} className={styles.barChartBar}>
                    <Skeleton className="w-full h-full" style={{ minHeight: '220px' }} />
                  </div>
                ))}
              </div>
            ) : (!barChartData || barChartData.length === 0 || barChartData.every(b => b.respondidos === 0 && b.enviados === 0)) ? (
              <div className={styles.emptyState}>
                <BarChart2 className={styles.emptyStateIcon} />
                <p className={styles.emptyStateText}>Nenhum dado disponível</p>
                <p className={styles.emptyStateSubtext}>Os dados aparecerão aqui quando houver respostas</p>
              </div>
            ) : (
              <>
                <div className={styles.barChartBars}>
                  {barChartData.map((bar, index) => (
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
              </>
            )}
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
            {isLoading ? (
              <div className="text-center py-4 text-gray-500">Carregando...</div>
            ) : questionariosData.length === 0 ? (
              <div className="text-center py-4 text-gray-500">Nenhum questionário encontrado</div>
            ) : (
              questionariosData.map((item, index) => {
                const maxValue = Math.max(...questionariosData.map(q => q.respondidos), 1);
                const percentage = maxValue > 0 ? (item.respondidos / maxValue) * 100 : 0;
                
                return (
                  <div key={item.id} className={styles.topQuestionarioItem}>
                <div className={styles.topQuestionarioIndex}>
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div className={styles.topQuestionarioName}>{item.nome}</div>
                <div className={styles.progressBarContainer}>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressBarFill}
                          style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <div className={styles.topQuestionarioPercentage}>
                      {item.respondidos}
                </div>
              </div>
                );
              })
            )}
          </div>
        </Card>
        
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4 text-orange-500">Respostas</h2>
          <div className={styles.areaChartContainer}>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="w-full h-[200px]" />
                <div className="flex justify-center gap-8">
                  <Skeleton className="h-16 w-24" />
                  <Skeleton className="h-16 w-24" />
                </div>
              </div>
            ) : (!monthlyComparisonData || (!areaChartData.currentMonth.length && !areaChartData.previousMonth.length)) ? (
              <div className={styles.emptyState}>
                <BarChart2 className={styles.emptyStateIcon} />
                <p className={styles.emptyStateText}>Nenhum dado disponível</p>
                <p className={styles.emptyStateSubtext}>Os dados aparecerão aqui quando houver respostas</p>
              </div>
            ) : (
              <>
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
                {areaChartData.currentMonth.length > 0 && (
                  <>
                    <path
                      d={`M 20,${areaChartData.currentMonth[0]} ${areaChartData.currentMonth.map((y, i) => `L ${20 + (i + 1) * 36},${y}`).join(' ')} L ${20 + areaChartData.currentMonth.length * 36},200 L 20,200 Z`}
                      fill="url(#gradientEsseMes)"
                    />
                    <polyline
                      points={`${areaChartData.currentMonth.map((y, i) => `${20 + i * 36},${y}`).join(' ')}`}
                      fill="none"
                      stroke="#1e3a8a"
                      strokeWidth="2"
                    />
                    {areaChartData.currentMonth.map((y, i) => (
                      <circle key={`esse-${i}`} cx={20 + i * 36} cy={y} r="3" fill="#1e3a8a" />
                    ))}
                  </>
                )}
                
                {/* Área Último Mês */}
                {areaChartData.previousMonth.length > 0 && (
                  <>
                    <path
                      d={`M 20,${areaChartData.previousMonth[0]} ${areaChartData.previousMonth.map((y, i) => `L ${20 + (i + 1) * 36},${y}`).join(' ')} L ${20 + areaChartData.previousMonth.length * 36},200 L 20,200 Z`}
                      fill="url(#gradientUltimoMes)"
                    />
                    <polyline
                      points={`${areaChartData.previousMonth.map((y, i) => `${20 + i * 36},${y}`).join(' ')}`}
                      fill="none"
                      stroke="#ff7300"
                      strokeWidth="2"
                    />
                    {areaChartData.previousMonth.map((y, i) => (
                      <circle key={`ultimo-${i}`} cx={20 + i * 36} cy={y} r="3" fill="#ff7300" />
                    ))}
                  </>
                )}
              </svg>
              <div className={styles.areaChartLegend}>
                <div className={styles.areaChartLegendItem}>
                  <div className={styles.areaChartLegendLabel}>
                    <div className={`${styles.areaChartLegendDot} ultimoMes`} />
                    <span>Último Mês</span>
                  </div>
                  <div className={`${styles.areaChartLegendValue} ultimoMes`}>
                    {monthlyComparisonData?.previousMonth || 0}
                  </div>
                </div>
                <div className={styles.areaChartLegendItem}>
                  <div className={styles.areaChartLegendLabel}>
                    <div className={`${styles.areaChartLegendDot} esseMes`} />
                    <span>Esse Mês</span>
                  </div>
                  <div className={`${styles.areaChartLegendValue} esseMes`}>
                    {monthlyComparisonData?.currentMonth || 0}
                  </div>
                </div>
              </div>
              </>
            )}
          </div>
        </Card>
      </div>
      
      {/* Linha 3: Respondidos (esquerda) e Questionários (direita) */}
      <div className={styles.metricsContainer}>
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4 text-orange-500">Respondidos</h2>
          <div className="flex items-center justify-between">
            <div className={styles.respondidosInfo}>
              <div className={styles.respondidosLabel}>Total Finalizado</div>
              <div className={styles.respondidosValue}>
                {isLoading ? '...' : totals.totalFinished}
              </div>
              <div className={styles.respondidosDescription}>
                {isLoading ? 'Carregando...' : `${totals.totalStarted} iniciados no total`}
              </div>
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
                  strokeDashoffset={`${314.159 * (1 - (totals.totalStarted > 0 ? totals.totalFinished / totals.totalStarted : 0))}`}
                />
              </svg>
              <div className={styles.radialProgressText}>
                {isLoading ? '...' : totals.totalStarted > 0 
                  ? `${Math.round((totals.totalFinished / totals.totalStarted) * 100)}%`
                  : '0%'}
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4 text-orange-500">Questionários</h2>
          <div className={styles.lineChartContainer}>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="w-full h-[250px]" />
                <div className="flex justify-between px-4">
                  {Array(12).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-8" />
                  ))}
                </div>
              </div>
            ) : (!monthlySurveysData || monthlySurveysData.length === 0 || lineChartData.points.length === 0) ? (
              <div className={styles.emptyState}>
                <FileText className={styles.emptyStateIcon} />
                <p className={styles.emptyStateText}>Nenhum dado disponível</p>
                <p className={styles.emptyStateSubtext}>Os dados aparecerão aqui quando houver questionários criados</p>
              </div>
            ) : (
              <svg viewBox="0 0 800 300" className={styles.lineChartSvg}>
                <defs>
                  <linearGradient id="gradientQuestionarios" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#ff7300', stopOpacity: 0.4 }} />
                    <stop offset="100%" style={{ stopColor: '#ff7300', stopOpacity: 0.05 }} />
                  </linearGradient>
                </defs>
                
                {/* Linhas horizontais de grade */}
                {[0, 1, 2, 3, 4, 5].map((value, i) => {
                  const y = 250 - (value / 5) * 200;
                  const labelValue = Math.round((value / 5) * lineChartData.maxValue);
                  return (
                    <g key={`grid-${i}`}>
                      <line x1="50" y1={y} x2="750" y2={y} stroke="#e5e7eb" strokeWidth="1" />
                      <text x="20" y={y + 5} className={styles.lineChartAxisLabel}>{labelValue}</text>
                    </g>
                  );
                })}
                
                {/* Área preenchida */}
                {lineChartData.points.length > 0 && (
                  <path
                    d={`M ${lineChartData.points[0].x},${lineChartData.points[0].y} ${lineChartData.points.slice(1).map(p => `L ${p.x},${p.y}`).join(' ')} L ${lineChartData.points[lineChartData.points.length - 1].x},250 L ${lineChartData.points[0].x},250 Z`}
                    fill="url(#gradientQuestionarios)"
                  />
                )}
                
                {/* Linha */}
                {lineChartData.points.length > 0 && (
                  <polyline
                    points={lineChartData.points.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke="#ff7300"
                    strokeWidth="3"
                  />
                )}
                
                {/* Pontos */}
                {lineChartData.points.map((point, i) => (
                  <circle key={`point-${i}`} cx={point.x} cy={point.y} r="4" fill="#ff7300" />
                ))}
                
                {/* Labels do eixo X */}
                {lineChartData.months.map((month, i) => {
                  const x = lineChartData.points[i]?.x || (50 + (i * (700 / (lineChartData.months.length - 1 || 1))));
                  return (
                    <text key={`month-${i}`} x={x} y="275" className={styles.lineChartAxisLabel} textAnchor="middle">
                      {month}
                    </text>
                  );
                })}
              </svg>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
