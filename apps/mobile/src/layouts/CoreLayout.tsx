import { ReactNode } from 'react';
import { View } from 'react-native';

import { Container, FooterNav, HeaderNav } from '~/components';
import { Theme } from '~/types';

interface Props {
  showBack?: boolean;
  showHeaderOptions?: boolean;
  showSettingsOnly?: boolean;
  showNotificationsOnly?: boolean;
  showFooter?: boolean;
  children: ReactNode;
  containerClassName?: string;
  theme?: Theme;
  onBackPress?: () => void;
}

const CoreLayout = ({
  children,
  showBack,
  showHeaderOptions,
  showSettingsOnly,
  showNotificationsOnly,
  showFooter = true,
  containerClassName,
  theme = 'DARK',
  onBackPress,
}: Props) => {
  return (
    <Container className={containerClassName}>
      <HeaderNav
        showBack={showBack}
        showHeaderOptions={showHeaderOptions}
        showSettingsOnly={showSettingsOnly}
        showNotificationsOnly={showNotificationsOnly}
        onBackPress={onBackPress}
        theme={theme}
      />
      <View className="flex-1 overflow-hidden">{children}</View>
      {showFooter && <FooterNav />}
    </Container>
  );
};

export default CoreLayout;
