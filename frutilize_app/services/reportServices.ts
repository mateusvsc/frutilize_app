import { generateDailyCSV, saveCSVToFile, updateLastReportRun, shouldRunDailyReport } from '../database/database';

export class ReportService {
  private static instance: ReportService;
  private isRunning = false;
  private intervalId: number | null = null;

  static getInstance(): ReportService {
    if (!ReportService.instance) {
      ReportService.instance = new ReportService();
    }
    return ReportService.instance;
  }

  async checkAndGenerateDailyReport(): Promise<void> {
    if (this.isRunning) return;

    try {
      this.isRunning = true;
      
      const shouldRun = await shouldRunDailyReport();
      if (!shouldRun) return;

      const currentTime = new Date();
      const hours = currentTime.getHours();
      const minutes = currentTime.getMinutes();

      if (hours === 23 && minutes === 59) {
        console.log('🕐 Gerando relatório diário automático...');
        
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];
        
        const csv = await generateDailyCSV(yesterdayString);
        const filename = `relatorio_diario_${yesterdayString.replace(/-/g, '')}.csv`;
        
        await saveCSVToFile(csv, filename);
        await updateLastReportRun();
        
        console.log('✅ Relatório diário gerado com sucesso:', filename);
      }
    } catch (error) {
      console.error('❌ Erro gerando relatório diário:', error);
    } finally {
      this.isRunning = false;
    }
  }

  startDailyScheduler(): number {
    // Verificar a cada minuto
    const intervalId = setInterval(() => {
      this.checkAndGenerateDailyReport();
    }, 60000) as unknown as number;
    
    this.intervalId = intervalId;
    return intervalId;
  }

  stopScheduler(intervalId: number): void {
    clearInterval(intervalId);
    this.intervalId = null;
  }
}