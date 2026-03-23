import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Api } from '../../../core/services/api';
import { GlobalStore } from '../../../core/store/store';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './login.html'
})
export class LoginComponent {

    loading = signal(false);
    errorMsg = signal('');
    loginForm;

    constructor(private fb: FormBuilder, private router: Router,
        public store: GlobalStore, private api: Api, private authService: AuthService) {
        this.loginForm = this.fb.nonNullable.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            remember: [false]
        });

    }

    async submit() {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        this.loading.set(true);
        this.errorMsg.set('');

        try {
            const { email, password } = this.loginForm.getRawValue();

            this.api.login({ email, password }).subscribe({
                next: (res: any) => {
                    const login = res.login;
                    if (login.ok) {
                        this.store.user.set(login.user);
                        this.store.loggedIn.set(true);
                        this.store.userRole.set(login.user.role);
                        this.authService.setToken(JSON.stringify(login.token));
                        this.router.navigate(['/dashboard']);
                    }
                },
                error: (err: any) => {
                    console.log("error", err.message);
                }
            });

        } catch (err) {
            this.errorMsg.set('Invalid email or password');
        } finally {
            this.loading.set(false);
        }
    }

}