import { View } from 'react-native';

import { Container, FooterNav, HeaderNav } from '~/components';
import { CoreLayoutProps } from '~/types';

const CoreLayout = ({
  children,
  showBack,
  showClose,
  showHeaderOptions,
  showSettingsOnly,
  showNotificationsOnly,
  showLogout,
  showFooter = false,
  footerClassName,
  containerClassName,
  theme = 'DARK',
  onBackPress,
  onLogoutPress,
  title,
}: CoreLayoutProps) => {
  return (
    <Container className={containerClassName}>
      <HeaderNav
        showBack={showBack}
        showClose={showClose}
        showHeaderOptions={showHeaderOptions}
        showSettingsOnly={showSettingsOnly}
        showNotificationsOnly={showNotificationsOnly}
        showLogout={showLogout}
        onBackPress={onBackPress}
        onLogoutPress={onLogoutPress}
        theme={theme}
        title={title}
      />
      <View className="flex-1 overflow-hidden">{children}</View>
      {showFooter && <FooterNav footerClassName={footerClassName} />}
    </Container>
  );
};

export default CoreLayout;
