import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TaskpageService } from '../Services/taskpage.service';

export const taskpageGuard: CanActivateFn = (route, state) => {
  const taskPageService = inject(TaskpageService);
  const router=inject(Router)
  
  if(taskPageService.check())
    return true;
  else {
    router.navigate(['/home']);
    return false;
  }
};
