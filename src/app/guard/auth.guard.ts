import { CanActivateFn, Router } from '@angular/router';
import { Inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {

  const localData=localStorage.getItem('UserLogin');
  const router = Inject(Router);

  if (localData!=null)
  {
    return true;
  }else{
    router.navigate(['login']);
    return false;

  }


};
