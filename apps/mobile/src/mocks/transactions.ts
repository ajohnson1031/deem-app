import { Transaction } from '~/types';

const MOCK_PENDING_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-001',
    type: 'PAYMENT',
    direction: 'OUTGOING',
    recipientId: '2',
    amount: '150.25',
    memo: 'Dinner last night',
    status: 'PENDING',
    timestamps: {
      createdAt: Date.now() - 1000 * 60 * 10, // 10 mins ago
    },
  },
  {
    id: 'tx-002',
    type: 'REQUEST',
    direction: 'INCOMING',
    recipientId: '1',
    amount: '75.00',
    memo: 'Concert tickets',
    status: 'PENDING',
    timestamps: {
      createdAt: Date.now() - 1000 * 60 * 30, // 30 mins ago
    },
  },
  {
    id: 'tx-003',
    type: 'PAYMENT',
    direction: 'OUTGOING',
    recipientId: '3',
    amount: '20.00',
    memo: 'Coffee',
    status: 'PENDING',
    timestamps: {
      createdAt: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    },
  },
  {
    id: 'tx-004',
    type: 'REQUEST',
    direction: 'INCOMING',
    recipientId: '4',
    amount: '300.00',
    memo: 'Event sponsorship',
    status: 'PENDING',
    timestamps: {
      createdAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    },
  },
  {
    id: 'tx-005',
    type: 'PAYMENT',
    direction: 'INCOMING',
    recipientId: '1',
    amount: '200.00',
    memo: 'Refund',
    status: 'PENDING',
    timestamps: {
      createdAt: Date.now() - 1000 * 60 * 15, // 15 minutes ago
    },
  },
];

const MOCK_COMPLETED_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-001',
    type: 'PAYMENT',
    direction: 'OUTGOING',
    recipientId: '2',
    amount: '150.25',
    memo: 'Dinner last night',
    status: 'APPROVED',
    timestamps: {
      createdAt: new Date('2025-06-15T20:45:00Z').getTime(),
    },
  },
  {
    id: 'tx-002',
    type: 'PAYMENT',
    direction: 'OUTGOING',
    recipientId: '1',
    amount: '300.00',
    memo: 'Hotel reservation',
    status: 'DECLINED',
    timestamps: {
      createdAt: new Date('2025-06-05T14:30:00Z').getTime(),
    },
  },
  {
    id: 'tx-003',
    type: 'PAYMENT',
    direction: 'OUTGOING',
    recipientId: '3',
    amount: '75.50',
    memo: 'Groceries',
    status: 'APPROVED',
    timestamps: {
      createdAt: new Date('2025-05-25T11:10:00Z').getTime(),
    },
  },
  {
    id: 'tx-004',
    type: 'REQUEST',
    direction: 'OUTGOING',
    recipientId: '4',
    amount: '20.00',
    memo: 'Snacks',
    status: 'APPROVED',
    timestamps: {
      createdAt: new Date('2025-05-10T09:05:00Z').getTime(),
    },
  },
  {
    id: 'tx-005',
    type: 'PAYMENT',
    direction: 'OUTGOING',
    recipientId: '1',
    amount: '500.00',
    memo: 'Rent',
    status: 'DECLINED',
    timestamps: {
      createdAt: new Date('2025-04-28T16:45:00Z').getTime(),
    },
  },
  {
    id: 'tx-006',
    type: 'REQUEST',
    direction: 'OUTGOING',
    recipientId: '3',
    amount: '88.88',
    memo: 'Gift for you',
    status: 'APPROVED',
    timestamps: {
      createdAt: new Date('2025-04-15T18:20:00Z').getTime(),
    },
  },
  {
    id: 'tx-007',
    type: 'PAYMENT',
    direction: 'OUTGOING',
    recipientId: '2',
    amount: '60.00',
    memo: 'Lunch split',
    status: 'DECLINED',
    timestamps: {
      createdAt: new Date('2025-03-20T12:00:00Z').getTime(),
    },
  },
  {
    id: 'tx-008',
    type: 'REQUEST',
    direction: 'OUTGOING',
    recipientId: '4',
    amount: '42.42',
    memo: 'Gas money',
    status: 'APPROVED',
    timestamps: {
      createdAt: new Date('2025-03-05T08:15:00Z').getTime(),
    },
  },
];

export { MOCK_COMPLETED_TRANSACTIONS, MOCK_PENDING_TRANSACTIONS };
