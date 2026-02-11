import { useState, useEffect } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { useNotifications } from '@/hooks/useNotifications';
import { notificationsService } from '@/services/notifications.service';

export function NotificationPrompt() {
  const { permissionStatus, requestPermission } = useNotifications();
  const [dismissed, setDismissed] = useState(() =>
    notificationsService.isPromptDismissed(),
  );
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (permissionStatus === 'default' && !dismissed) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [permissionStatus, dismissed]);

  if (!visible) return null;

  const handleEnable = async () => {
    await requestPermission();
    setVisible(false);
  };

  const handleDismiss = () => {
    notificationsService.dismissPrompt();
    setDismissed(true);
    setVisible(false);
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-4 flex items-start gap-4">
      <div className="flex-shrink-0 mt-0.5 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon name="notifications_active" className="text-primary" size={22} />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-text">
          Stay updated on shared lists
        </h3>
        <p className="text-xs text-text-muted mt-1 leading-relaxed">
          Get notified when someone adds or checks off items on your shared
          shopping lists.
        </p>

        <div className="flex items-center gap-3 mt-3">
          <Button size="sm" onClick={handleEnable}>
            Enable Notifications
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDismiss}>
            Not now
          </Button>
        </div>
      </div>

      <button
        onClick={handleDismiss}
        className="flex-shrink-0 text-text-muted hover:text-text transition-colors"
        aria-label="Dismiss notification prompt"
      >
        <Icon name="close" size={18} />
      </button>
    </div>
  );
}
