import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing';
import { LoginComponent } from './pages/auth/login/login';
import { RegisterComponent } from './pages/auth/register/register';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
    {
        path: '',
        component: LandingComponent,
    },
    {
        path: 'dashboard',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/dashboard/dashboard')
            .then(m => m.DashboardComponent),
    },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },



];