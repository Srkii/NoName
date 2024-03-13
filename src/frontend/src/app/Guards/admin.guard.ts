import { CanActivateFn } from '@angular/router';
import { AdminService } from '../Services/admin.service';
import { inject } from '@angular/core';

export const adminGuard: CanActivateFn = (route, state) => {
  const adminService=inject(AdminService)

  if(adminService.check()==true)
  {
    return true;
  }
  else return false;

};
