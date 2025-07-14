import { ReactNode } from 'react';

import { Theme } from '~/types/theme';

interface CoreLayoutProps {
  showBack?: boolean;
  showClose?: boolean;
  showHeaderOptions?: boolean;
  showSettingsOnly?: boolean;
  showNotificationsOnly?: boolean;
  showFooter?: boolean;
  showLogout?: boolean;
  footerClassName?: string;
  children: ReactNode;
  containerClassName?: string;
  theme?: Theme;
  onBackPress?: () => void;
  onLogoutPress?: () => void;
  title?: string;
}

export type { CoreLayoutProps };
