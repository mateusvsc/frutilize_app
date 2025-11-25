import { useState, useEffect } from 'react';

export const useBrasiliaTime = () => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Converter para horário de Brasília (UTC-3)
      const brasiliaTime = new Date(now.getTime() - (3 * 60 * 60 * 1000));
      setCurrentTime(brasiliaTime);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date, includeSeconds: boolean = false): string => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: includeSeconds ? '2-digit' : undefined
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('pt-BR');
  };

  const isMidnight = (): boolean => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    return hours === 23 && minutes === 59;
  };

  const getTodayDateString = (): string => {
    return currentTime.toISOString().split('T')[0];
  };

  return {
    currentTime,
    formatTime,
    formatDate,
    isMidnight,
    getTodayDateString
  };
};