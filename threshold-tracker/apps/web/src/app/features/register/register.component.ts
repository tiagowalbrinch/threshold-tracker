import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  displayName = signal('');
  email = signal('');
  password = signal('');
  error = signal('');
  loading = signal(false);

  onSubmit() {
    if (!this.displayName() || !this.email() || !this.password()) return;
    this.loading.set(true);
    this.error.set('');

    this.authService.register(this.displayName(), this.email(), this.password()).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error.set(err.error?.detail ?? 'Registration failed. Please try again.');
        this.loading.set(false);
      }
    });
  }
}
