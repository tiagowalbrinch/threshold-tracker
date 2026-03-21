import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = signal('');
  password = signal('');
  error = signal('');
  loading = signal(false);

  onSubmit() {
    if (!this.email() || !this.password()) return;
    this.loading.set(true);
    this.error.set('');

    this.authService.login(this.email(), this.password()).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error.set(err.error?.detail ?? 'Invalid email or password.');
        this.loading.set(false);
      }
    });
  }
}
