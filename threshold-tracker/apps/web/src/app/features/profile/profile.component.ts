import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { SyncService } from '../../services/sync.service';
import { environment } from '../../../environments/environment';

interface ProfileResponse {
  user_id: string;
  display_name: string;
  email: string;
  default_sensitivity: string | null;
  default_fov: number | null;
  default_dpi: number | null;
  aimlabs_username: string | null;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  private http = inject(HttpClient);
  private syncService = inject(SyncService);

  displayName = signal('');
  defaultSensitivity = signal('');
  defaultFov = signal('');
  defaultDpi = signal('');
  aimlabsUsername = signal('');
  originalAimlabsUsername = signal('');
  usernameChanged = computed(() => this.aimlabsUsername() !== this.originalAimlabsUsername());
  email = signal('');
  error = signal('');
  success = signal('');
  loading = signal(true);
  saving = signal(false);
  syncing = signal(false);

  ngOnInit() {
    this.http.get<ProfileResponse>(`${environment.apiUrl}/profile`).subscribe({
      next: (profile) => {
        this.displayName.set(profile.display_name);
        this.email.set(profile.email);
        this.defaultSensitivity.set(profile.default_sensitivity ?? '');
        this.defaultFov.set(profile.default_fov?.toString() ?? '');
        this.defaultDpi.set(profile.default_dpi?.toString() ?? '');
        this.aimlabsUsername.set(profile.aimlabs_username ?? '');
        this.originalAimlabsUsername.set(profile.aimlabs_username ?? '');
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSave() {
    this.saving.set(true);
    this.error.set('');
    this.success.set('');

    const body = {
      display_name: this.displayName() || null,
      default_sensitivity: this.defaultSensitivity() || null,
      default_fov: this.defaultFov() ? parseFloat(this.defaultFov()) : null,
      default_dpi: this.defaultDpi() ? parseInt(this.defaultDpi()) : null,
      aimlabs_username: this.aimlabsUsername() || null,
    };

    this.http.patch<ProfileResponse>(`${environment.apiUrl}/profile`, body).subscribe({
      next: () => {
        this.success.set('Profile saved successfully.');
        this.originalAimlabsUsername.set(this.aimlabsUsername());
        this.saving.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.detail ?? 'Failed to save profile.');
        this.saving.set(false);
      }
    });
  }

  onSync() {
    this.syncing.set(true);
    this.error.set('');
    this.success.set('');
    this.syncService.sync().subscribe({
      next: (tasks) => {
        this.success.set(`Sync complete — ${tasks.length} tasks imported.`);
        this.syncing.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.detail ?? 'Sync failed. Make sure your Aimlabs username is correct.');
        this.syncing.set(false);
      }
    });
  }
}
