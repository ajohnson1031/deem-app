import { View } from 'react-native';

import { WalletDetails } from '~/components';
import { useWallet } from '~/hooks';
import { CoreLayout } from '~/layouts';

const ManageWalletScreen = () => {
  const { wallet, walletAddress } = useWallet();

  return (
    <CoreLayout showBack title="Manage Wallet">
      <View className="mx-6 flex flex-1 justify-between">
        <View>
          {!!walletAddress && (
            <WalletDetails
              address={walletAddress}
              publicKey={wallet!.publicKey}
              seed={wallet!.seed}
            />
          )}
        </View>
      </View>
    </CoreLayout>
  );
};

export default ManageWalletScreen;
