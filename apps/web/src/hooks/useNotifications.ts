import { useState, useEffect, useCallback } from 'react';
import {
  notificationsService,
  type PermissionStatus,
} from '@/services/notifications.service';

export function useNotifications() {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>(
    () => notificationsService.getPermissionStatus(),
  );

  const isEnabled = permissionStatus === 'granted';

  useEffect(() => {
    if (!('permissions' in navigator)) return;

    let cleanup: (() => void) | undefined;

    navigator.permissions
      .query({ name: 'notifications' as PermissionName })
      .then((status) => {
        const handler = () => {
          setPermissionStatus(notificationsService.getPermissionStatus());
        };
        status.addEventListener('change', handler);
        cleanup = () => status.removeEventListener('change', handler);
      })
      .catch(() => {
        // Permissions API not available for notifications
      });

    return () => cleanup?.();
  }, []);

  const requestPermission = useCallback(async () => {
    const result = await notificationsService.requestPermission();
    setPermissionStatus(result);
    return result;
  }, []);

  return { permissionStatus, isEnabled, requestPermission };
}
