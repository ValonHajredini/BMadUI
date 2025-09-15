import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandlerService implements ErrorHandler {
  handleError(error: Error): void {
    console.error('Global error caught:', error);

    // Report to Electron main process if available
    if (typeof window !== 'undefined' && (window as any).errorAPI) {
      (window as any).errorAPI.reportError(error, 'angular-global-handler');
    }

    // In a production app, you might want to:
    // - Send errors to a logging service
    // - Show user-friendly error messages
    // - Handle specific error types differently

    this.displayUserFriendlyMessage(error);
  }

  private displayUserFriendlyMessage(error: Error): void {
    // Create a simple error notification
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-notification';
    errorContainer.innerHTML = `
      <div class="error-content">
        <strong>⚠️ Something went wrong</strong>
        <p>An unexpected error occurred. Please try refreshing the application.</p>
        <button onclick="this.parentElement.parentElement.remove()">Dismiss</button>
      </div>
    `;

    // Add styles
    errorContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #fee2e2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 16px;
      max-width: 400px;
      z-index: 10000;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    `;

    const style = document.createElement('style');
    style.textContent = `
      .error-content {
        color: #991b1b;
      }
      .error-content strong {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
      }
      .error-content p {
        margin: 0 0 12px 0;
        font-size: 14px;
        line-height: 1.4;
      }
      .error-content button {
        background: #dc2626;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
      }
      .error-content button:hover {
        background: #b91c1c;
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(errorContainer);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (errorContainer.parentElement) {
        errorContainer.remove();
      }
    }, 10000);
  }
}