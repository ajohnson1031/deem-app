import { ReactNode } from 'react';
import { View } from 'react-native';

import { Container, FooterNav, HeaderNav } from '~/components';

interface Props {
  showBack?: boolean;
  showHeaderOptions?: boolean;
  showFooter?: boolean;
  children: ReactNode;
  containerClassName?: string;
  onBackPress?: () => void;
}

const CoreLayout = ({
  children,
  showBack,
  showHeaderOptions,
  showFooter = true,
  onBackPress,
  containerClassName,
}: Props) => {
  return (
    <Container className={containerClassName}>
      <HeaderNav
        showBack={showBack}
        showHeaderOptions={showHeaderOptions}
        onBackPress={onBackPress}
      />
      <View className="flex-1">{children}</View>
      {showFooter && <FooterNav />}
    </Container>
  );
};

export default CoreLayout;
