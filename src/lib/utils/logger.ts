// src/lib/utils/logger.ts
// 日志记录工具

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: Error;
}

class Logger {
  private isDevelopment: boolean;
  
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }
  
  private formatMessage(level: LogLevel, message: string, context?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `${prefix} ${message}${contextStr}`;
  }
  
  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): void {
    const formattedMessage = this.formatMessage(level, message, context);
    
    // 开发环境输出到控制台
    if (this.isDevelopment) {
      const consoleMethod = level === 'error' ? console.error : 
                           level === 'warn' ? console.warn : 
                           level === 'debug' ? console.debug : console.log;
      
      if (error) {
        consoleMethod(formattedMessage, error);
      } else {
        consoleMethod(formattedMessage);
      }
    }
    
    // 生产环境可以发送到外部分析服务
    if (!this.isDevelopment) {
      // TODO: 可以集成 Sentry, LogRocket 等外部服务
      this.sendToExternalService({
        level,
        message,
        timestamp: new Date().toISOString(),
        context,
        error,
      });
    }
  }
  
  private sendToExternalService(entry: LogEntry): void {
    // 生产环境日志上报
    // 例如: Sentry.captureMessage() 或发送到日志服务
    if (entry.level === 'error' && entry.error) {
      // 上报错误
      console.error('[Production Error]', entry);
    }
  }
  
  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }
  
  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }
  
  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }
  
  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log('error', message, context, error);
  }
  
  // API 请求日志
  apiRequest(method: string, path: string, duration: number, statusCode: number): void {
    this.info(`API ${method} ${path}`, {
      method,
      path,
      duration: `${duration}ms`,
      statusCode,
    });
  }
  
  // 数据库查询日志
  dbQuery(operation: string, model: string, duration: number): void {
    this.debug(`DB ${operation} on ${model}`, {
      operation,
      model,
      duration: `${duration}ms`,
    });
  }
}

export const logger = new Logger();
export default logger;
