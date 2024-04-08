import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../_services/login.service';

export const loginGuard: CanActivateFn = (route, state) => {
  const service=inject(LoginService);
  const router=inject(Router)

  if(service.checkToken()===false)
    return true;
  else{
    if(localStorage.getItem('role')==='0')
         router.navigate(['/admin']);
    else router.navigate(['/mytasks']);

    return false;
  }

};
