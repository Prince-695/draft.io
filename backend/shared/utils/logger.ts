// Logger Utility - For consistent logging across all services
// Uses colors to make logs easy to read

import chalk from 'chalk';

class Logger {
  private serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  // Info log - General information (blue)
  info(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    console.log(
      chalk.blue(`[${timestamp}] [${this.serviceName}] INFO:`),
      message,
      data ? JSON.stringify(data, null, 2) : ''
    );
  }

  // Error log - Errors and exceptions (red)
  error(message: string, error?: any) {
    const timestamp = new Date().toISOString();
    console.error(
      chalk.red(`[${timestamp}] [${this.serviceName}] ERROR:`),
      message,
      error ? error : ''
    );
  }

  // Warning log - Important notices (yellow)
  warn(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    console.warn(
      chalk.yellow(`[${timestamp}] [${this.serviceName}] WARN:`),
      message,
      data ? JSON.stringify(data, null, 2) : ''
    );
  }

  // Success log - Successful operations (green)
  success(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    console.log(
      chalk.green(`[${timestamp}] [${this.serviceName}] SUCCESS:`),
      message,
      data ? JSON.stringify(data, null, 2) : ''
    );
  }

  // Debug log - Development debugging (gray)
  debug(message: string, data?: any) {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      console.log(
        chalk.gray(`[${timestamp}] [${this.serviceName}] DEBUG:`),
        message,
        data ? JSON.stringify(data, null, 2) : ''
      );
    }
  }
}

export default Logger;
