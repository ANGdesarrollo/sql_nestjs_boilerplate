import { Logger as NestLogger } from '@nestjs/common';

export class Logger
{
  private static readonly logger = new NestLogger('App');

  static log(message: any, context?: string): void
  {
    Logger.logger.log(message, context);
  }

  static error(message: any, trace?: string, context?: string): void
  {
    Logger.logger.error(message, trace, context);
  }

  static warn(message: any, context?: string): void
  {
    Logger.logger.warn(message, context);
  }

  static debug(message: any, context?: string): void
  {
    Logger.logger.debug(message, context);
  }

  static verbose(message: any, context?: string): void
  {
    Logger.logger.verbose(message, context);
  }
}
