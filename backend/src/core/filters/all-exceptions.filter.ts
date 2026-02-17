
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

        const logMessage = `[${new Date().toISOString()}] Path: ${request.url}\nStatus: ${status}\nError: ${JSON.stringify(message)}\nStack: ${exception instanceof Error ? exception.stack : 'No stack trace'}\n\n`;

        try {
            fs.appendFileSync(path.join(process.cwd(), 'error.log'), logMessage);
        } catch (e) {
            console.error('Failed to write to error log file', e);
        }

        console.error('Exception caught by global filter:', exception);

        response
            .status(status)
            .json({
                statusCode: status,
                timestamp: new Date().toISOString(),
                path: request.url,
                message: 'Internal Server Error (logged)',
            });
    }
}
