export class Logger {
  private static formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] ${level}: ${message}`;
  }

  static info(message: string): void {
    console.log(this.formatMessage('INFO', message));
  }

  static error(message: string): void {
    console.error(this.formatMessage('ERROR', message));
  }

  static warn(message: string): void {
    console.warn(this.formatMessage('WARN', message));
  }

  static debug(message: string): void {
    console.debug(this.formatMessage('DEBUG', message));
  }
}

export default Logger;
