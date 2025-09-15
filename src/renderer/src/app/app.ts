import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent implements OnInit {
  protected readonly title = signal('BMad GUI');
  protected readonly isElectron = signal(false);
  protected readonly platform = signal('');

  ngOnInit(): void {
    // Check if running in Electron environment
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      this.isElectron.set(true);
      this.platform.set((window as any).electronAPI.platform);
    }

    // Set up global error handling
    if (typeof window !== 'undefined' && (window as any).errorAPI) {
      window.addEventListener('error', (event) => {
        (window as any).errorAPI.reportError(event.error, 'global-error-handler');
      });

      window.addEventListener('unhandledrejection', (event) => {
        (window as any).errorAPI.reportError(
          new Error(event.reason),
          'unhandled-promise-rejection'
        );
      });
    }
  }
}
