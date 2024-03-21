import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../_services/login.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const service=inject(LoginService);
  const router=inject(Router)

  if(service.checkToken()===true)
    return true;
  else{
    router.navigate(['/login']);
    return false;
  }
};
