import { ReactNode } from 'react';
import { View } from 'react-native';

import { Container, FooterNav, HeaderNav } from '~/components';

interface Props {
  showBack?: boolean;
  showHeader?: boolean;
  showHeaderOptions?: boolean;
  showFooter?: boolean;
  children: ReactNode;
}

const CoreLayout = ({
  children,
  showBack,
  showHeaderOptions,
  showHeader = false,
  showFooter = false,
}: Props) => {
  return (
    <Container>
      {showHeader && <HeaderNav showBack={showBack} showHeaderOptions={showHeaderOptions} />}
      <View className="flex-1">{children}</View>
      {showFooter && <FooterNav />}
    </Container>
  );
};

export default CoreLayout;
