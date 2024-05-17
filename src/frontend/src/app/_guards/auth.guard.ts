import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../_services/login.service';
import { inject } from '@angular/core';
import { AdminService } from '../_services/admin.service';

export const authGuard: CanActivateFn = (route, state) => {
  const service=inject(LoginService);
  const router=inject(Router)
  const adminService=inject(AdminService)

  if(service.checkToken()===true)
  {
    if(adminService.check()==true)
    {
      router.navigate(['/admin']);
      return false
    }
    else return true
  }
    
  else{
    router.navigate(['/login']);
    return false;
  }
};
