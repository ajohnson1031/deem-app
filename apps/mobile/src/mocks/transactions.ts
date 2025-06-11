import { Transaction } from '~/types/transaction';

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-001',
    type: 'PAY',
    direction: 'outgoing',
    contactId: '2', // Assuming contact id of Bob Lee
    amount: 150.25,
    memo: 'Dinner last night',
    status: 'pending',
    timestamp: Date.now() - 1000 * 60 * 10, // 10 mins ago
  },
  {
    id: 'tx-002',
    type: 'REQUEST',
    direction: 'incoming',
    contactId: '1', // Assuming contact id of Alice Monroe
    amount: 75.0,
    memo: 'Concert tickets',
    status: 'pending',
    timestamp: Date.now() - 1000 * 60 * 30, // 30 mins ago
  },
  {
    id: 'tx-003',
    type: 'PAY',
    direction: 'outgoing',
    contactId: '3', // JohnnyK (mock id)
    amount: 20.0,
    memo: 'Coffee',
    status: 'pending',
    timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
  },
  {
    id: 'tx-004',
    type: 'REQUEST',
    direction: 'incoming',
    contactId: '4', // SarahS (mock id)
    amount: 300.0,
    memo: 'Event sponsorship',
    status: 'pending',
    timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
  },
];

export { MOCK_TRANSACTIONS };
