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

    let mounted = true;

    navigator.permissions
      .query({ name: 'notifications' as PermissionName })
      .then((status) => {
        if (!mounted) return;
        const handler = () => {
          if (mounted) {
            setPermissionStatus(notificationsService.getPermissionStatus());
          }
        };
        status.addEventListener('change', handler);
      })
      .catch(() => {
        // Permissions API not available for notifications
      });

    return () => {
      mounted = false;
    };
  }, []);

  const requestPermission = useCallback(async () => {
    const result = await notificationsService.requestPermission();
    setPermissionStatus(result);
    return result;
  }, []);

  return { permissionStatus, isEnabled, requestPermission };
}
