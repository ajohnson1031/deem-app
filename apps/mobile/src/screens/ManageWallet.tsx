import Feather from '@expo/vector-icons/Feather';
import { ReactNode, useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { isValidClassicAddress, Wallet } from 'xrpl';

import {
  ManualWalletEntry,
  ModalPrompt,
  // PasswordVerificationPromptModal,
  WalletDetails,
} from '~/components';
import { REGEX } from '~/constants';
import { useAuth } from '~/contexts/AuthContext';
import { useFlashScrollIndicators, useWallet } from '~/hooks';
import { CoreLayout } from '~/layouts';
import { EncryptionModalMode, ModalPromptVariant } from '~/types';
import {
  deriveKeyFromPassword,
  encryptSeed,
  handleExport,
  handleFilePicker,
  useHandleImport,
} from '~/utils';
import { api } from '~/utils/api';

const passError =
  'Password not in expected format (8 - 30 chars and include one of each of the following: uppercase, lowercase, number, special character (not @)).';

const ManageWalletScreen = () => {
  const handleImport = useHandleImport();
  const { wallet, walletAddress, setWallet } = useWallet();
  const { scrollViewRef, flashIndicators } = useFlashScrollIndicators();
  const [flashCount, setFlashCount] = useState<number>(0);
  const [newWalletAddress, setNewWalletAddress] = useState<string | undefined>();
  const [newSeed, setNewSeed] = useState<string | undefined>();
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [currentMode, setCurrentMode] = useState<EncryptionModalMode | undefined>(undefined);
  const [passphrase, setPassphrase] = useState('');
  const [importFile, setImportFile] = useState<string | null>(null);

  const [showPassphraseModal, setShowPassphraseModal] = useState(false);
  const [twoFactorErrorIsVisible, setTwoFactorErrorIsVisible] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [verifyPasswordModalIsVisible, setVerifyPasswordModalIsVisible] = useState<boolean>(false);
  const [currentViewIndex, setCurrentViewIndex] = useState<number>(0);
  const { user } = useAuth();
  const { twoFactorEnabled } = user || { twoFactorEnabled: false };

  const isValidNewWalletAddress = walletAddress
    ? isValidClassicAddress(walletAddress.trim())
    : false;
  const isValidNewSeed = (() => {
    try {
      Wallet.fromSeed(newSeed!.trim());
      return true;
    } catch {
      return false;
    }
  })();

  const handlePreCheck = () => {
    let hasTwoFA;
    if (!twoFactorEnabled) {
      hasTwoFA = false;
      setTwoFactorErrorIsVisible(true);
    } else hasTwoFA = true;
    return hasTwoFA;
  };

  const handleGenerate = async () => {
    if (!REGEX.PASSWORD.test(password as string)) {
      setError(passError);
      return;
    }

    try {
      setIsProcessing(true);
      await doGenerate(password);
    } finally {
      setIsProcessing(false);
      setVerifyPasswordModalIsVisible(false);
    }
  };

  // Import/Export Wallet Fns
  const onImportPress = async () => {
    const has2FA = handlePreCheck();
    if (!has2FA) return;
    setVerifyPasswordModalIsVisible(true);
    //TODO: Handle 2FA
    setCurrentMode(EncryptionModalMode.IMPORT);
    const fileContents = await handleFilePicker();
    if (fileContents) {
      setImportFile(fileContents);
      setShowPassphraseModal(true);
    }
  };

  const onExportPress = () => {
    const has2FA = handlePreCheck();
    if (!has2FA) return;
    setVerifyPasswordModalIsVisible(true);
    //TODO: Handle 2FA
    setCurrentMode(EncryptionModalMode.EXPORT);
    setShowPassphraseModal(true);
  };

  const onChangePassphrase = (text: string) => {
    setPassphrase(text);
    setError('');
  };

  const onClosePassphraseModal = () => {
    setPassphrase('');
    setShowPassphraseModal(false);
    setIsProcessing(false);
  };

  const onImportOrExportConfirm = async () => {
    if (!REGEX.PASSWORD.test(passphrase as string)) {
      setError(passError);
      return;
    }

    setIsProcessing(true);
    setTimeout(async () => {
      try {
        if (currentMode === EncryptionModalMode.EXPORT) {
          if (!wallet!.seed) {
            Toast.show({
              type: 'error',
              text1: 'Problem Exporting Wallet',
              text2: 'Wallet seed could not be found.',
            });
            return;
          }
          await handleExport(passphrase, wallet!.seed);
        } else if (currentMode === EncryptionModalMode.IMPORT) {
          await handleImport(importFile!, passphrase);
        }
      } finally {
        onClosePassphraseModal();
      }
    }, 50);
  };

  // Regenerate Wallet Fn
  const doGenerate = async (password: string) => {
    const newWallet = Wallet.generate();
    const key = await deriveKeyFromPassword(password);

    try {
      const encryptedSeed = encryptSeed(newWallet.seed!, key);
      await api.patch('/wallet', {
        wallet: newWallet,
        walletAddress: newWallet.address,
        encryptedSeed,
      });
      setWallet(newWallet);
      Toast.show({
        type: 'success',
        text1: 'Success!',
        text2: 'Wallet has been regenerated.',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Could not regenerate wallet.',
        text2: error.message ?? error,
      });
    }
  };

  // Manual Wallet Entry Fn
  const handleUpdate = () => {
    const has2FA = handlePreCheck();
    if (!has2FA) return;
    setVerifyPasswordModalIsVisible(true);
    //TODO: Handle 2FA
    return null;
  };

  const handle2FA = async () => {};

  const VIEWS: Record<string, string | ReactNode>[] = [
    {
      headerText: 'Current Wallet Details',
      component: (
        <View>
          {!!walletAddress && (
            <View>
              <Text className="mb-6 text-lg leading-snug text-slate-600">
                Import or export your wallet details using a secure, encrypted file. Confirming the
                import overwrites the currently stored wallet. Please be sure to copy and store your
                current wallet details before doing so.
              </Text>
              <WalletDetails
                address={walletAddress}
                publicKey={wallet!.publicKey}
                seed={wallet!.seed}
                mode={currentMode}
                passphrase={passphrase}
                passphraseModalVisible={showPassphraseModal}
                isProcessing={isProcessing}
                onImportPress={onImportPress}
                onExportPress={onExportPress}
                onChangePassphrase={onChangePassphrase}
                onClosePassphraseModal={onClosePassphraseModal}
                onConfirm={onImportOrExportConfirm}
                error={error}
              />
            </View>
          )}
        </View>
      ),
    },

    {
      headerText: 'Regenerate Wallet',
      component: (
        <View>
          <Text className="mb-6 text-lg text-gray-600">
            Regenerating your wallet will automatically overwrite your current wallet details. Be
            sure to capture and store them safely if you still need them as otherwise they will be
            unrecoverable.
          </Text>

          <TouchableOpacity
            onPress={handlePreCheck} // Always verify password
            className="rounded-lg bg-emerald-600 py-4">
            <Text className="text-center text-xl font-medium text-white">Regenerate Wallet</Text>
          </TouchableOpacity>
        </View>
      ),
    },
    {
      headerText: 'Update Wallet Manually',
      component: (
        <ManualWalletEntry
          walletAddress={newWalletAddress}
          seed={newSeed}
          isValidWalletAddress={isValidNewWalletAddress}
          isValidSeed={isValidNewSeed}
          onChangeWallet={(text: string) => setNewWalletAddress(text.trim())}
          onChangeSeed={(text: string) => setNewSeed(text.trim())}
          onConfirm={handleUpdate}
        />
      ),
    },
  ];

  useEffect(() => {
    const flashInterval = setInterval(() => {
      if (flashCount < 4) {
        flashIndicators();
        setFlashCount(flashCount + 1);
      }
    }, 500);

    return () => clearInterval(flashInterval);
  }, [flashCount]);

  useEffect(() => {
    const errTimeout = setTimeout(() => setTwoFactorErrorIsVisible(false), 3000);
    return () => clearTimeout(errTimeout);
  }, [twoFactorErrorIsVisible]);

  return (
    <CoreLayout showBack title="Manage Wallet">
      <ModalPrompt
        value={password}
        onChangeValue={(text: string) => {
          setPassword(text);
          setError('');
        }}
        variant={ModalPromptVariant.PASSWORD}
        visible={verifyPasswordModalIsVisible}
        isProcessing={isProcessing}
        onConfirm={() => {
          // TODO: Set up password verification and what happens after based on current view
        }}
        onCancel={() => {
          setPassword('');
          setVerifyPasswordModalIsVisible(false);
        }}
        error={error}
      />

      <View className="mx-6">
        <View className="flex">
          <Text className="text-2xl font-semibold text-red-600">Important Note</Text>
          <Text className="text-2xl font-semibold text-slate-600">About Crypto Wallets</Text>
        </View>

        <ScrollView
          ref={scrollViewRef}
          className="my-3 flex max-h-36 pr-4"
          showsVerticalScrollIndicator
          persistentScrollbar>
          <Text className="text-lg text-slate-600">
            Your
            <Text className="font-medium italic text-slate-600"> Wallet Address</Text>,
            <Text className="font-medium italic text-slate-600"> Public Key &</Text>
            <Text className="font-medium italic text-red-600"> Seed</Text> are the core elements
            making up your crypto wallet. Sharing the wallet address is encouraged, as it is the
            primary vector for sending & receiving funds to or from your wallet. Your public key may
            also be shared without deleterious effect.
          </Text>
          <Text className="my-3 text-lg text-slate-600">
            Your seed, however, should <Text className="font-bold text-red-600">never</Text> be
            shared.
          </Text>
          <Text className="text-lg text-slate-600">
            If your seed is compromised, it can be used to derive your private key and sign
            transactions you did not in fact authorize and/or drain your wallet of funds. If you
            must unmask your seed, please ensure privacy in your immediate surroundings and store it
            quickly & securely, away from prying eyes.
          </Text>
          <Text className="mt-3 text-lg text-slate-600">
            You are responsible for safeguarding your wallet's seed. Deem does not claim any
            responsibility if it leaks or is unrecoverable due to actions on your part.
          </Text>
        </ScrollView>
      </View>

      <View className="mx-6 mb-4 flex-row justify-between border-y border-gray-200 py-3">
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
              onPress={() => {
                setError('');
                setCurrentViewIndex(currentViewIndex - 1);
              }}
              disabled={currentViewIndex < 1}>
              <Feather name="chevron-left" size={16} color="#475569" />
            </TouchableOpacity>
            <TouchableOpacity
              className="rounded-lg bg-gray-100 p-1.5"
              onPress={() => {
                setError('');
                setCurrentViewIndex(currentViewIndex + 1);
              }}
              disabled={currentViewIndex >= VIEWS.length - 1}>
              <Feather name="chevron-right" size={16} color="#475569" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View className="mx-6">
        <View>{VIEWS[currentViewIndex].component}</View>
        {!!twoFactorErrorIsVisible && (
          <Text className="mt-2 text-center text-sm text-red-600">
            2FA Must be enabled to update wallet details.
          </Text>
        )}
        {/* {currentViewIndex === 2 && (
          
        )} */}
      </View>
    </CoreLayout>
  );
};

export default ManageWalletScreen;
