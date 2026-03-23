import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (route, state) => {

    // validate if it's render the token on the browswer side not on server 

    const platformId = inject(PLATFORM_ID);
    const isBrowser = isPlatformBrowser(platformId);

    if (!isBrowser) return true;

    const authService = inject(AuthService);
    const router = inject(Router);
    const isLoggedIn = authService.isLoggedIn();


    if (isLoggedIn) {
        return true;
    }

    router.navigate(['/login']);

    return false;
};