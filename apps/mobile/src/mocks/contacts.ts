import { Contact } from '~/types';

// Mock contact data
const MOCK_SUGGESTED: Contact[] = [
  {
    id: '1',
    name: 'Alice Monroe',
    username: '@alicem',
    walletAddress: 'rAlice123',
  },
  {
    id: '2',
    name: 'Bob Lee',
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
