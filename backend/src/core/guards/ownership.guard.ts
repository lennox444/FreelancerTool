import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class OwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Inject ownerId into request for use in services
    if (user && user.id) {
      request.ownerId = user.id;
    }

    return true;
  }
}
