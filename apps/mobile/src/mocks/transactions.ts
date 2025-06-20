import { Transaction } from '~/types';

const MOCK_PENDING_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-001',
    type: 'PAYMENT',
    direction: 'outgoing',
    recipientId: '2', // Assuming contact id of Bob Lee
    amount: '150.25',
    memo: 'Dinner last night',
    status: 'pending',
    timestamp: Date.now() - 1000 * 60 * 10, // 10 mins ago
  },
  {
    id: 'tx-002',
    type: 'REQUEST',
    direction: 'incoming',
    recipientId: '1', // Assuming contact id of Alice Monroe
    amount: '75.00',
    memo: 'Concert tickets',
    status: 'pending',
    timestamp: Date.now() - 1000 * 60 * 30, // 30 mins ago
  },
  {
    id: 'tx-003',
    type: 'PAYMENT',
    direction: 'outgoing',
    recipientId: '3', // JohnnyK (mock id)
    amount: '20.00',
    memo: 'Coffee',
    status: 'pending',
    timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
  },
  {
    id: 'tx-004',
    type: 'REQUEST',
    direction: 'incoming',
    recipientId: '4', // SarahS (mock id)
    amount: '300.00',
    memo: 'Event sponsorship',
    status: 'pending',
    timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
  },
];

const MOCK_COMPLETED_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-001',
    type: 'PAYMENT',
    direction: 'outgoing',
    recipientId: '2',
    amount: '150.25',
    memo: 'Dinner last night',
    status: 'accepted',
    timestamp: new Date('2025-06-15T20:45:00Z').getTime(),
  },
  {
    id: 'tx-002',
    type: 'PAYMENT',
    direction: 'outgoing',
    recipientId: '1',
    amount: '300.00',
    memo: 'Hotel reservation',
    status: 'declined',
    timestamp: new Date('2025-06-05T14:30:00Z').getTime(),
  },
  {
    id: 'tx-003',
    type: 'PAYMENT',
    direction: 'outgoing',
    recipientId: '3',
    amount: '75.50',
    memo: 'Groceries',
    status: 'accepted',
    timestamp: new Date('2025-05-25T11:10:00Z').getTime(),
  },
  {
    id: 'tx-004',
    type: 'REQUEST',
    direction: 'outgoing',
    recipientId: '4',
    amount: '20.00',
    memo: 'Snacks',
    status: 'accepted',
    timestamp: new Date('2025-05-10T09:05:00Z').getTime(),
  },
  {
    id: 'tx-005',
    type: 'PAYMENT',
    direction: 'outgoing',
    recipientId: '1',
    amount: '500.00',
    memo: 'Rent',
    status: 'declined',
    timestamp: new Date('2025-04-28T16:45:00Z').getTime(),
  },
  {
    id: 'tx-006',
    type: 'REQUEST',
    direction: 'outgoing',
    recipientId: '3',
    amount: '88.88',
    memo: 'Gift for you',
    status: 'accepted',
    timestamp: new Date('2025-04-15T18:20:00Z').getTime(),
  },
  {
    id: 'tx-007',
    type: 'PAYMENT',
    direction: 'outgoing',
    recipientId: '2',
    amount: '60.00',
    memo: 'Lunch split',
    status: 'declined',
    timestamp: new Date('2025-03-20T12:00:00Z').getTime(),
  },
  {
    id: 'tx-008',
    type: 'REQUEST',
    direction: 'outgoing',
    recipientId: '4',
    amount: '42.42',
    memo: 'Gas money',
    status: 'accepted',
    timestamp: new Date('2025-03-05T08:15:00Z').getTime(),
  },
];

export { MOCK_COMPLETED_TRANSACTIONS, MOCK_PENDING_TRANSACTIONS };
