import { CanActivateFn, Router } from '@angular/router';
import { AdminService } from '../Services/admin.service';
import { inject } from '@angular/core';

export const adminGuard: CanActivateFn = (route, state) => {
  const adminService=inject(AdminService)
  const router=inject(Router)
  
  if(adminService.check()==true)
  {
    return true;
  }
  else {
    router.navigate(['/home']);
    return false;
  }

};
