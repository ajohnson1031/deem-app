import { ReactNode } from 'react';
import { View } from 'react-native';

import { Container } from '~/components';
import FooterNav from '~/components/FooterNav';

interface Props {
  children: ReactNode;
}

const CoreLayout = ({ children }: Props) => {
  return (
    <Container>
      <View className="flex-1">{children}</View>
      <FooterNav />
    </Container>
  );
};

export default CoreLayout;
