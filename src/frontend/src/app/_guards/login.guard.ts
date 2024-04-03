import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../_services/login.service';

export const loginGuard: CanActivateFn = (route, state) => {
  const service=inject(LoginService);
  const router=inject(Router)

  if(service.checkToken()===false)
    return true;
  else{
    router.navigate(['/mytasks']);
    return false;
  }

};
