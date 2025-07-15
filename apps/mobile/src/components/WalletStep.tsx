import { Feather } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAtom } from 'jotai';
import { ReactNode, useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toggle from 'react-native-toggle-element';
import { Wallet, isValidClassicAddress } from 'xrpl';

import { registerAtom } from '~/atoms';
import LabelFieldWithCopy from '~/components/LabelFieldWithCopy';
import PassphrasePromptModal from '~/components/PassphrasePromptModal';
import { EncryptionModalMode, FieldVariant, StepTwoWalletProps } from '~/types';

const WalletStep = ({ onComplete }: StepTwoWalletProps) => {
  const [userData, setUserData] = useAtom(registerAtom);
  const [walletAddress, setWalletAddress] = useState<string | undefined>();
  const [seed, setSeed] = useState<string | undefined>();
  const [generated, setGenerated] = useState(false);
  const [currentViewIndex, setCurrentViewIndex] = useState<number>(0);
  const [isUsingOwnWallet, setIsUsingOwnWallet] = useState<boolean>(false);
  const [showPassModal, setShowPassModal] = useState<boolean>(false);
  const { twoFactorEnabled = false } = userData;
  const isValidWalletAddress = walletAddress ? isValidClassicAddress(walletAddress.trim()) : false;
  const isValidSeed = (() => {
    try {
      Wallet.fromSeed(seed!.trim());
      return true;
    } catch {
      return false;
    }
  })();

  const isFormValid = isValidWalletAddress && isValidSeed;

  const handleGenerate = () => {
    const wallet = Wallet.generate();
    setWalletAddress(wallet.classicAddress);
    setSeed(wallet.seed!);
    setGenerated(true);
    setIsUsingOwnWallet(false);
  };

  const handleSubmit = () => {
    if (!walletAddress || !seed) {
      return;
    }

    onComplete({ walletAddress, seed, twoFactorEnabled });
  };

  const VIEWS: Record<string, string | ReactNode>[] = [
    {
      headerText: 'Automatic Wallet Generation',
      component: (
        <View>
          <Text className="mb-6 text-lg text-gray-600">
            {!generated
              ? 'Let Deem handle wallet creation for you. This is the best option for those who are new to crypto and want to get started quickly.'
              : 'Your new XRP wallet details.'}
          </Text>
          {!generated && (
            <TouchableOpacity
              onPress={handleGenerate}
              className={`rounded-lg py-4 ${isUsingOwnWallet ? 'bg-gray-300' : 'bg-emerald-600'}`}
              disabled={isUsingOwnWallet}>
              <Text
                className={`text-center text-xl font-medium ${!isUsingOwnWallet ? 'text-white' : 'text-gray-400'}`}>
                Generate New Wallet
              </Text>
            </TouchableOpacity>
          )}

          {generated && (
            <View className="mb-4 mt-2 flex gap-6">
              <LabelFieldWithCopy
                label="Wallet Address"
                value={walletAddress ?? ''}
                valueKey="wallet"
                copiedMessage="Wallet Address Copied!"
              />
              <LabelFieldWithCopy
                label={
                  <View className="flex-row">
                    <Text className="text-red-600">*</Text>
                    <Text className="text-sm font-semibold text-slate-500">Seed</Text>
                  </View>
                }
                value={seed ?? ''}
                valueKey="seed"
                copiedMessage="Seed Copied!"
                variant={FieldVariant.MASKED}
              />

              <View className="flex flex-row items-start gap-2">
                <FontAwesome name="warning" size={24} color="orangered" className="mt-1.5" />
                <Text className="w-11/12 text-lg font-semibold text-slate-600">
                  Write down and store your seed securely.{`\n`}You are responsible for keeping it
                  safe.{`\n`}A compromised seed can result in loss of control over the wallet and
                  all funds in it.
                </Text>
              </View>
            </View>
          )}
        </View>
      ),
    },
    {
      headerText: 'Import Encrypted Wallet File',
      component: (
        <View className="flex">
          <Text className="mb-6 text-lg text-gray-600">
            If you're a veteran Deem user, feel free to import your previously encrypted wallet
            file. This is the most secure option if you want/need to port your account over to a new
            device.
          </Text>
          <TouchableOpacity
            className="mt-2 flex-row items-center justify-center gap-3 rounded-lg bg-sky-600 py-4"
            onPress={() => {
              setShowPassModal(true);
            }}>
            <Text className="text-center text-xl font-medium text-white">Import Wallet</Text>
            <Feather name="upload" color="white" size={20} />
          </TouchableOpacity>
        </View>
      ),
    },
    {
      headerText: 'Enter Wallet Manually',
      component: (
        <View>
          <Text className="mb-6 text-lg text-gray-600">
            Manually enter details for any valid XRP wallet. This is the least secure option, but
            allows use of wallets created in other apps (i.e., XUMM, etc.). The seed you provide
            will be encrypted to maximize safety.&nbsp;
            <Text className="font-semibold text-red-600">
              Raw seeds are never stored or sent to our servers.
            </Text>
          </Text>

          <View className="mb-2 w-full rounded-lg bg-gray-100">
            <TextInput
              className="w-full p-3 py-4 text-lg font-medium leading-[18px]"
              placeholder="Wallet Address"
              placeholderTextColor="#777"
              autoCapitalize="none"
              value={walletAddress}
              onChangeText={(val) => setWalletAddress(val.trim())}
              editable={!generated}
            />
          </View>
          {!isValidWalletAddress && walletAddress && walletAddress.length > 0 && (
            <Text className="mb-2 text-sm text-red-600">Invalid wallet address.</Text>
          )}
          <View className="mb-2 w-full rounded-lg bg-gray-100">
            <TextInput
              className="w-full p-3 py-4 text-lg font-medium leading-[18px]"
              placeholder="Wallet Seed"
              placeholderTextColor="#777"
              autoCapitalize="none"
              secureTextEntry={!generated}
              value={seed}
              onChangeText={(val) => {
                setSeed(val);
              }}
              editable={!generated}
            />
          </View>
          {!isValidSeed && seed && seed.length > 0 && (
            <Text className="mb-2 text-sm text-red-600">Invalid wallet seed.</Text>
          )}
        </View>
      ),
    },
  ];

  useEffect(() => {
    setIsUsingOwnWallet(!generated && !!walletAddress && !!seed);
  }, [generated, walletAddress, seed]);

  return (
    <View className="flex w-full flex-1 justify-between px-6">
      <PassphrasePromptModal
        visible={showPassModal}
        onConfirm={() => {}} // TODO: Flesh out what happens on confirm
        onCancel={() => {
          setShowPassModal(false);
        }}
        mode={EncryptionModalMode.IMPORT}
      />
      <View className="flex">
        <Text className="text-lg text-gray-600">
          Deem is an XRP Ledger-based application. There are several ways to get started transacting
          on the XRPL using Deem.
        </Text>

        <View className="my-6 flex-row justify-between border-y border-gray-200 py-3">
          <Text className="text-lg font-medium text-slate-600">
            {VIEWS[currentViewIndex].headerText}
          </Text>

          <View className="flex-row items-center gap-2">
            <Text className="font-bold text-slate-600">
              {`${currentViewIndex + 1}`}
              <Text className="font-normal"> / 3</Text>
            </Text>
            <View className="w-16 flex-row items-center justify-between gap-2">
              <TouchableOpacity
                className="rounded-lg bg-gray-100 p-1.5"
                onPress={() => setCurrentViewIndex(currentViewIndex - 1)}
                disabled={currentViewIndex < 1}>
                <Feather name="chevron-left" size={16} color="#475569" />
              </TouchableOpacity>
              <TouchableOpacity
                className="rounded-lg bg-gray-100 p-1.5"
                onPress={() => setCurrentViewIndex(currentViewIndex + 1)}
                disabled={currentViewIndex >= VIEWS.length - 1}>
                <Feather name="chevron-right" size={16} color="#475569" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="mb-6">{VIEWS[currentViewIndex].component}</View>

        <View className="mb-3 flex-row items-center justify-end gap-3">
          <View className="flex items-end justify-center">
            <Text className="-mt-1 text-lg font-medium text-slate-600">
              Enable Two-Factor Authentication?
            </Text>
            <Text className="-mt-1 text-sm text-slate-600">(Recommended)</Text>
          </View>
          <Toggle
            value={twoFactorEnabled!}
            onPress={() =>
              setUserData({
                ...userData,
                twoFactorEnabled: !twoFactorEnabled,
              })
            }
            trackBar={{
              activeBackgroundColor: '#16a34a',
              inActiveBackgroundColor: '#6b7280',
              borderActiveColor: '#16a34a',
              borderInActiveColor: '#6b7280',
              borderWidth: 3,
              width: 80,
              height: 35,
            }}
            trackBarStyle={{ zIndex: -1, width: 65 }}
            thumbStyle={{ height: 29, width: 29, backgroundColor: 'white' }}
          />
        </View>
        <View className="mb-2 h-[1px] bg-gray-200" />
        <Text className="text-base text-slate-600">
          <Text className="font-semibold text-red-600 ">*</Text>
          <Text className="font-semibold">NOTE</Text>: Two-factor authentication is required to
          access seed in-app. 2FA can always be enabled at a later time in security Settings.
        </Text>
      </View>

      <View className="mb-8 flex-row gap-4">
        <TouchableOpacity
          onPress={handleSubmit}
          className={`mt-4 flex-1 rounded-lg py-4 ${isFormValid ? 'bg-sky-600' : 'bg-gray-300'}`}
          disabled={isUsingOwnWallet ? !isFormValid : false}>
          <Text
            className={`text-center text-xl font-medium ${isFormValid ? 'text-white' : 'text-gray-400'}`}>
            Register Account
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WalletStep;
