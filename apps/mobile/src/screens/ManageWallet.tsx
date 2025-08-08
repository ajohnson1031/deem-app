import Feather from '@expo/vector-icons/Feather';
import { ReactNode, useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { isValidClassicAddress, Wallet } from 'xrpl';

import { ManualWalletEntry, ModalPrompt, TwoFAPromptModal, WalletDetails } from '~/components';
import { REGEX } from '~/constants';
import { useFlashScrollIndicators, useWallet } from '~/hooks';
import { CoreLayout } from '~/layouts';
import { EncryptionModalMode, ModalPromptVariant } from '~/types';
import {
  checkTwoFactorStatus,
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

  // --- UI/State
  const [flashCount, setFlashCount] = useState<number>(0);
  const [newWalletAddress, setNewWalletAddress] = useState<string | undefined>();
  const [newSeed, setNewSeed] = useState<string | undefined>();
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [currentMode, setCurrentMode] = useState<EncryptionModalMode | undefined>(undefined);
  const [passphrase, setPassphrase] = useState('');
  const [importFile, setImportFile] = useState<string | null>(null);
  const [showPassphraseModal, setShowPassphraseModal] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [verifyPasswordModalIsVisible, setVerifyPasswordModalIsVisible] = useState<boolean>(false);
  const [show2FAModal, setShow2FAModal] = useState<boolean>(false);
  const [pendingOperation, setPendingOperation] = useState<
    'import' | 'export' | 'regenerate' | 'update' | null
  >(null);
  const [twoFAToken, setTwoFAToken] = useState('');
  const [twoFAError, setTwoFAError] = useState('');
  const [currentViewIndex, setCurrentViewIndex] = useState<number>(0);
  const functionsAreDisabled = !twoFactorEnabled || isProcessing;

  // --- Validations
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

  // ---- Password Modal Confirm ----
  const handlePasswordConfirm = async () => {
    if (!REGEX.PASSWORD.test(password)) {
      setError(passError);
      return;
    }
    // (Optional: Verify password via backend here.)
    setVerifyPasswordModalIsVisible(false);
    setPassword('');
    setShow2FAModal(true);
  };

  // ---- 2FA Modal Confirm ----
  const handle2FAConfirm = async () => {
    if (!twoFAToken || twoFAToken.length !== 6) {
      setTwoFAError('2FA token must be 6 digits');
      return;
    }
    setShow2FAModal(false);
    setIsProcessing(true);
    try {
      if (pendingOperation === 'import') {
        await handleImport(importFile!, passphrase);
      } else if (pendingOperation === 'export') {
        if (!wallet!.seed) {
          Toast.show({
            type: 'error',
            text1: 'Problem Exporting Wallet',
            text2: 'Wallet seed could not be found.',
          });
          return;
        }
        await handleExport(passphrase, wallet!.seed);
      } else if (pendingOperation === 'regenerate') {
        await doGenerate(password);
      }
    } finally {
      setIsProcessing(false);
      setPendingOperation(null);
      setPassphrase('');
      setTwoFAToken('');
      setTwoFAError('');
      setShowPassphraseModal(false);
    }
  };

  // ---- Import/Export/Regenerate Handlers ----
  const onImportPress = async () => {
    setCurrentMode(EncryptionModalMode.IMPORT);
    const fileContents = await handleFilePicker();
    if (fileContents) {
      setImportFile(fileContents);
      setShowPassphraseModal(true);
    }
  };

  const onExportPress = async () => {
    setCurrentMode(EncryptionModalMode.EXPORT);
    setShowPassphraseModal(true);
  };

  const onRegeneratePress = async () => {
    setPendingOperation('regenerate');
  };

  // ---- Other Flows ----
  const onChangePassphrase = (text: string) => {
    setPassphrase(text);
    setError('');
  };

  const onClosePassphraseModal = () => {
    setPassphrase('');
    setShowPassphraseModal(false);
    setIsProcessing(false);
  };

  // ---- Regenerate Wallet ----
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

  // ---- Manual Wallet Entry ----
  const handleUpdate = async () => {
    setPendingOperation('update');
  };

  // ---- View Change ----
  const handleViewChange = (dir: 'plus' | 'minus') => {
    const viewIndex = dir === 'plus' ? currentViewIndex + 1 : currentViewIndex - 1;
    setError('');
    setCurrentViewIndex(viewIndex);
  };

  // ---- Views ----
  const VIEWS: Record<string, string | ReactNode>[] = [
    {
      headerText: 'Current Wallet Details',
      component: (
        <View>
          {!!walletAddress && (
            <View>
              <Text className="mb-6 text-lg leading-snug text-slate-600">
                Import or export your wallet using a secure, encrypted file. Importing overwrites
                your currently stored wallet. Copy and store your wallet details in advance of doing
                so.
              </Text>
              <WalletDetails
                disabled={functionsAreDisabled}
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
                onConfirm={async () => {}} // Confirm handled after password+2FA
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
          <Text className="mb-6 text-lg leading-snug text-gray-600">
            Regenerating your wallet will automatically overwrite your current wallet details. Be
            sure to capture and store them safely if you still need them as otherwise they will be
            unrecoverable.
          </Text>
          <TouchableOpacity
            onPress={onRegeneratePress}
            className="rounded-lg bg-emerald-600 py-4 disabled:bg-gray-300"
            disabled={functionsAreDisabled}>
            <Text
              className={`text-center text-xl font-medium ${functionsAreDisabled ? 'text-gray-400' : 'text-white'}`}>
              Regenerate Wallet
            </Text>
          </TouchableOpacity>
        </View>
      ),
    },
    {
      headerText: 'Update Wallet Manually',
      component: (
        <ManualWalletEntry
          disabled={functionsAreDisabled}
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

  // ---- UI Effects ----
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
    (async () => {
      const is2faEnabled = await checkTwoFactorStatus();
      if (!is2faEnabled) {
        setTwoFactorEnabled(false);
      } else {
        setTwoFactorEnabled(true);
      }
    })();
  }, []);

  // ---- Render ----
  return (
    <CoreLayout showBack title="Manage Wallet">
      {/* Password Prompt */}
      <ModalPrompt
        value={password}
        onChangeValue={setPassword}
        visible={verifyPasswordModalIsVisible}
        isProcessing={isProcessing}
        onConfirm={handlePasswordConfirm}
        onCancel={() => setVerifyPasswordModalIsVisible(false)}
        error={error}
        variant={ModalPromptVariant.PASSWORD}
      />

      {/* 2FA Prompt */}
      <TwoFAPromptModal
        visible={show2FAModal}
        value={twoFAToken}
        onChangeValue={setTwoFAToken}
        onConfirm={handle2FAConfirm}
        onCancel={() => setShow2FAModal(false)}
        error={twoFAError}
      />

      <View className="mx-6">
        <View className="flex">
          <View className="flex-row gap-1.5">
            <Text className="text-2xl font-semibold text-red-600">Important Note</Text>
            <Text className="text-2xl font-semibold text-slate-600">About Crypto Wallets</Text>
          </View>
        </View>
        <ScrollView
          ref={scrollViewRef}
          className="my-2 flex max-h-32 pr-4"
          showsVerticalScrollIndicator
          persistentScrollbar>
          <Text className="text-lg leading-snug text-slate-600">
            Your
            <Text className="font-medium italic text-slate-600"> Wallet Address</Text>,
            <Text className="font-medium italic text-slate-600"> Public Key &</Text>
            <Text className="font-medium italic text-red-600"> Seed</Text> are what makes up your
            crypto wallet. Sharing your wallet address is encouraged so you can send & receive
            funds. Your public key may also be shared without danger to you.
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
              onPress={() => handleViewChange('minus')}
              disabled={currentViewIndex < 1}>
              <Feather name="chevron-left" size={16} color="#475569" />
            </TouchableOpacity>
            <TouchableOpacity
              className="rounded-lg bg-gray-100 p-1.5"
              onPress={() => handleViewChange('plus')}
              disabled={currentViewIndex >= VIEWS.length - 1}>
              <Feather name="chevron-right" size={16} color="#475569" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View className="mx-6">
        <View>{VIEWS[currentViewIndex].component}</View>
        {!twoFactorEnabled && (
          <Text className="mt-2 rounded-md bg-red-100 p-1 text-center text-sm text-red-700">
            2FA Must be enabled to edit wallet details.
          </Text>
        )}
      </View>
    </CoreLayout>
  );
};

export default ManageWalletScreen;
