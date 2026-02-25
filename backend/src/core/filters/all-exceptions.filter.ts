
import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const message =
            exception instanceof HttpException
                ? exception.getResponse()
                : exception;

        // Only log and hide details for unexpected server errors (5xx)
        if (!(exception instanceof HttpException)) {
            const logMessage = `[${new Date().toISOString()}] Path: ${request.url}\nStatus: ${status}\nError: ${JSON.stringify(message)}\nStack: ${exception instanceof Error ? exception.stack : 'No stack trace'}\n\n`;
            try {
                fs.appendFileSync(path.join(process.cwd(), 'error.log'), logMessage);
            } catch (e) {
                console.error('Failed to write to error log file', e);
            }
            console.error('Exception caught by global filter:', exception);
        }

        // For HttpExceptions (4xx), pass through the original message
        const responseBody = exception instanceof HttpException
            ? exception.getResponse()
            : { statusCode: status, message: 'Ein unerwarteter Fehler ist aufgetreten' };

        response
            .status(status)
            .json(
                typeof responseBody === 'object'
                    ? { ...responseBody as object, timestamp: new Date().toISOString(), path: request.url }
                    : { statusCode: status, message: responseBody, timestamp: new Date().toISOString(), path: request.url }
            );
    }
}
