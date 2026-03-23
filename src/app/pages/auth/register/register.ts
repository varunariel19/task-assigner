import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Api } from '../../../core/services/api';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
})
export class RegisterComponent {
  loading = signal(false);
  errorMsg = signal('');
  RegisterationForm;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private api: Api,
  ) {
    this.RegisterationForm = this.fb.nonNullable.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [false],
    });
  }

  async submit() {
    if (this.RegisterationForm.invalid) {
      this.RegisterationForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMsg.set('');

    const { email, password, username } = this.RegisterationForm.getRawValue();
    const credentials = { email, password, username };

    this.api.register(credentials).subscribe({
      next: (res: any) => {
        this.router.navigate(['/login']);
      },
      error: (error: unknown) => {
        this.errorMsg.set('Invalid email or password');
      },
    });
  }
}
