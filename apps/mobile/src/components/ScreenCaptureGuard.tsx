// components/ScreenCaptureGuard.tsx
import { usePreventScreenCapture } from 'expo-screen-capture';

const ScreenCaptureGuard = ({ children }: { children: React.ReactNode }) => {
  usePreventScreenCapture();
  return <>{children}</>;
};

export default ScreenCaptureGuard;
