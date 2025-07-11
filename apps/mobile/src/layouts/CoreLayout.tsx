import { ReactNode } from 'react';
import { View } from 'react-native';

import { Container, FooterNav, HeaderNav } from '~/components';
import { Theme } from '~/types';

interface Props {
  showBack?: boolean;
  showClose?: boolean;
  showHeaderOptions?: boolean;
  showSettingsOnly?: boolean;
  showNotificationsOnly?: boolean;
  showFooter?: boolean;
  footerClassName?: string;
  children: ReactNode;
  containerClassName?: string;
  theme?: Theme;
  onBackPress?: () => void;
  title?: string;
}

const CoreLayout = ({
  children,
  showBack,
  showClose,
  showHeaderOptions,
  showSettingsOnly,
  showNotificationsOnly,
  showFooter = false,
  footerClassName,
  containerClassName,
  theme = 'DARK',
  onBackPress,
  title,
}: Props) => {
  return (
    <Container className={containerClassName}>
      <HeaderNav
        showBack={showBack}
        showClose={showClose}
        showHeaderOptions={showHeaderOptions}
        showSettingsOnly={showSettingsOnly}
        showNotificationsOnly={showNotificationsOnly}
        onBackPress={onBackPress}
        theme={theme}
        title={title}
      />
      <View className="flex-1 overflow-hidden">{children}</View>
      {showFooter && <FooterNav footerClassName={footerClassName} />}
    </Container>
  );
};

export default CoreLayout;
