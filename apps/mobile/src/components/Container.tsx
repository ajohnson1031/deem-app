import cn from 'classnames';
import { SafeAreaView } from 'react-native';

export const Container = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <SafeAreaView className={cn(styles.container, className)}>{children}</SafeAreaView>;
};

const styles = {
  container: 'flex flex-1',
};
