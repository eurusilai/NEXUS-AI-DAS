import { useState, useEffect } from 'react';
import { UniversalDataFormat } from '../services/DataTranslator';

export const useDataTranslation = () => {
  const [translatedData, setTranslatedData] = useState<UniversalDataFormat | null>(null);
  const [dataSource, setDataSource] = useState<string>('UNKNOWN');
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(0);

  useEffect(() => {
    const handleDataTranslated = (event: CustomEvent) => {
      setTranslatedData(event.detail.data);
      setDataSource(event.detail.source);
      setLastUpdate(Date.now());
    };

    const handleConnectionChange = (event: CustomEvent) => {
      setIsConnected(event.detail.isConnected);
    };

    window.addEventListener('dataTranslated', handleDataTranslated as EventListener);
    window.addEventListener('bridgeConnectionChange', handleConnectionChange as EventListener);

    return () => {
      window.removeEventListener('dataTranslated', handleDataTranslated as EventListener);
      window.removeEventListener('bridgeConnectionChange', handleConnectionChange as EventListener);
    };
  }, []);

  return {
    translatedData,
    dataSource,
    isConnected,
    lastUpdate,
    hasData: translatedData !== null
  };
};