import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    canActivate(context: any) {
        const req = context.switchToHttp().getRequest();
        console.log(`[JwtAuthGuard] Checking request to ${req.method} ${req.url}`);
        console.log(`[JwtAuthGuard] Headers Authorization: ${req.headers.authorization ? 'Present' : 'Missing'}`);
        return super.canActivate(context);
    }
}
