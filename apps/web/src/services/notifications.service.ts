const STORAGE_KEY = 'shopwise_notification_dismissed';

export type PermissionStatus = 'granted' | 'denied' | 'default';

export interface NotificationOptions {
  icon?: string;
  tag?: string;
  data?: unknown;
  requireInteraction?: boolean;
}

export const notificationsService = {
  async requestPermission(): Promise<PermissionStatus> {
    if (!('Notification' in window)) {
      console.warn('Notifications API not supported in this browser');
      return 'denied';
    }
    const result = await Notification.requestPermission();
    return result as PermissionStatus;
  },

  hasPermission(): boolean {
    if (!('Notification' in window)) return false;
    return Notification.permission === 'granted';
  },

  getPermissionStatus(): PermissionStatus {
    if (!('Notification' in window)) return 'denied';
    return Notification.permission as PermissionStatus;
  },

  showNotification(
    title: string,
    body: string,
    options?: NotificationOptions,
  ): Notification | null {
    if (!this.hasPermission()) return null;
    return new Notification(title, {
      body,
      icon: options?.icon,
      tag: options?.tag,
      data: options?.data,
      requireInteraction: options?.requireInteraction ?? false,
    });
  },

  isPromptDismissed(): boolean {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  },

  dismissPrompt(): void {
    localStorage.setItem(STORAGE_KEY, 'true');
  },

  resetPromptDismissal(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};
