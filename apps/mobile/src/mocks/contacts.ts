import { Contact } from '~/types/contacts';

// Mock contact data
const MOCK_SUGGESTED: Contact[] = [
  {
    id: '1',
    name: 'Alice Monroe',
    avatarUrl: 'https://i.pravatar.cc/100?u=alice',
    username: '@alicem',
    walletAddress: 'rAlice123',
  },
  {
    id: '2',
    name: 'Bob Lee',
    avatarUrl: 'https://i.pravatar.cc/100?u=bob',
    username: '@boblee',
    walletAddress: 'rBob456',
  },
];

const MOCK_ALL_CONTACTS: Contact[] = [
  ...MOCK_SUGGESTED,
  {
    id: '3',
    name: 'Charlie Kim',
    username: '@charliek',
    walletAddress: 'rCharlie789',
  },
  {
    id: '4',
    name: 'Dana White',
    username: '@danaw',
    walletAddress: 'rDana101',
  },
];

export { MOCK_ALL_CONTACTS, MOCK_SUGGESTED };
