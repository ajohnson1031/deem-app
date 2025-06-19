import { ScrollView, Text, View } from 'react-native';

const FeePolicy = () => {
  return (
    <View className="relative mx-2 flex-1 bg-white">
      <ScrollView className="flex-1 px-6 pb-6 pt-8">
        {/* Header */}
        <Text className="mb-4 text-2xl font-semibold text-gray-900">Fee Policy</Text>

        {/* Section: Bank Transfers */}
        <View className="mb-6">
          <Text className="mb-2 text-2xl font-semibold text-gray-800">
            💸 1. Bank Transfers (USD → XRP)
          </Text>
          <Text className="mb-1 text-xl text-gray-700">
            When you link your bank account and convert USD to XRP, a flat fee applies per transfer.
          </Text>
          <Text className="text-xl text-gray-700">
            • Fee: <Text className="font-semibold">$0.99 – $1.49</Text>
          </Text>
          <Text className="text-xl text-gray-700">• Shown clearly before confirming</Text>
        </View>

        {/* Section: Gift Card Conversion */}
        <View className="mb-6">
          <Text className="mb-2 text-2xl font-semibold text-gray-800">
            🎁 2. Gift Card to XRP Conversion
          </Text>
          <Text className="mb-1 text-xl text-gray-700">
            Convert unused gift card balances into XRP. A percentage-based service fee applies.
          </Text>
          <Text className="text-xl text-gray-700">
            • Fee: <Text className="font-semibold">15%</Text> of card balance
          </Text>
          <Text className="text-xl text-gray-700">
            • Minimum fee: <Text className="font-semibold">$0.25</Text>
          </Text>
          <Text className="text-xl text-gray-700">
            • Minimum card value: <Text className="font-semibold">$1.00</Text>
          </Text>
          <Text className="mt-2 text-xl italic text-gray-700">
            📝 Example: A $10 card incurs a $1.50 fee → you receive $8.50 in XRP.
          </Text>
        </View>

        {/* Section: No Hidden Fees */}
        <View className="mb-6">
          <Text className="mb-2 text-2xl font-semibold text-gray-800">🔄 3. No Hidden Fees</Text>
          <Text className="text-xl text-gray-700">
            Deem does not charge deposit, withdrawal, or subscription fees. All fees are shown
            clearly before you confirm a transaction.
          </Text>
        </View>

        {/* Section: Why Fees Exist */}
        <View className="mb-6">
          <Text className="mb-2 text-2xl font-semibold text-gray-800">
            🔐 4. Why We Charge Fees
          </Text>
          <Text className="text-xl text-gray-700">
            Our fees help cover secure banking integrations, gift card verification, blockchain
            network fees, fraud prevention, and ongoing development.
          </Text>
        </View>

        {/* Section: Support */}
        <View className="mb-12">
          <Text className="mb-2 text-2xl font-semibold text-gray-800">📬 5. Have Questions?</Text>
          <Text className="text-xl text-gray-700">
            Contact our support team at{' '}
            <Text className="text-sky-600 underline">support@deem.app</Text> or visit the Help
            Center.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default FeePolicy;
