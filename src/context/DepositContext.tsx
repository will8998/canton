'use client';

import { createContext, useState, useContext, useEffect, ReactNode } from 'react';

export type TransactionStatus = 'pending' | 'processing' | 'approved' | 'rejected';
export type TransactionType = 'deposit' | 'withdrawal';

export interface OngoingTransaction {
  id: string;
  vaultId: string;
  amount: string;
  type: TransactionType;
  status: TransactionStatus;
  timestamp: number;
  estimatedApprovalTime?: number;
  walletAddress: string;
}

// Legacy types for backwards compatibility
export type DepositStatus = TransactionStatus;
export interface OngoingDeposit extends OngoingTransaction {
  type: 'deposit';
}

interface DepositContextType {
  ongoingTransactions: OngoingTransaction[];
  ongoingDeposits: OngoingDeposit[];
  createDeposit: (vaultId: string, amount: string, walletAddress: string) => string;
  createWithdrawal: (vaultId: string, amount: string, walletAddress: string) => string;
  updateTransactionStatus: (transactionId: string, status: TransactionStatus) => void;
  updateDepositStatus: (depositId: string, status: DepositStatus) => void;
  getVaultDeposits: (vaultId: string, walletAddress: string) => OngoingDeposit[];
  getVaultWithdrawals: (vaultId: string, walletAddress: string) => OngoingTransaction[];
  getVaultTransactions: (vaultId: string, walletAddress: string) => OngoingTransaction[];
  removeTransaction: (transactionId: string) => void;
  removeDeposit: (depositId: string) => void;
}

const defaultState: DepositContextType = {
  ongoingTransactions: [],
  ongoingDeposits: [],
  createDeposit: () => '',
  createWithdrawal: () => '',
  updateTransactionStatus: () => {},
  updateDepositStatus: () => {},
  getVaultDeposits: () => [],
  getVaultWithdrawals: () => [],
  getVaultTransactions: () => [],
  removeTransaction: () => {},
  removeDeposit: () => {}
};

const DepositContext = createContext<DepositContextType>(defaultState);

export const useDeposit = () => useContext(DepositContext);
export const useTransaction = () => useContext(DepositContext); // New alias for transactions

interface DepositProviderProps {
  children: ReactNode;
}

export function DepositProvider({ children }: DepositProviderProps) {
  const [ongoingTransactions, setOngoingTransactions] = useState<OngoingTransaction[]>([]);

  // Load ongoing transactions from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTransactions = localStorage.getItem('ongoingTransactions');
      if (storedTransactions) {
        try {
          const transactions = JSON.parse(storedTransactions);
          setOngoingTransactions(transactions);
          console.log('Loaded ongoing transactions:', transactions);
        } catch (error) {
          console.error('Failed to parse stored transactions:', error);
          localStorage.removeItem('ongoingTransactions');
        }
      }
    }
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ongoingTransactions', JSON.stringify(ongoingTransactions));
    }
  }, [ongoingTransactions]);

  const createDeposit = (vaultId: string, amount: string, walletAddress: string): string => {
    const depositId = `deposit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newDeposit: OngoingTransaction = {
      id: depositId,
      vaultId,
      amount,
      type: 'deposit',
      status: 'pending',
      timestamp: Date.now(),
      estimatedApprovalTime: Date.now() + (24 * 60 * 60 * 1000), // 24 hours from now
      walletAddress
    };

    setOngoingTransactions(prev => [...prev, newDeposit]);
    console.log('Created new deposit:', newDeposit);
    return depositId;
  };

  const createWithdrawal = (vaultId: string, amount: string, walletAddress: string): string => {
    const withdrawalId = `withdrawal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newWithdrawal: OngoingTransaction = {
      id: withdrawalId,
      vaultId,
      amount,
      type: 'withdrawal',
      status: 'pending',
      timestamp: Date.now(),
      estimatedApprovalTime: Date.now() + (24 * 60 * 60 * 1000), // 24 hours from now
      walletAddress
    };

    setOngoingTransactions(prev => [...prev, newWithdrawal]);
    console.log('Created new withdrawal:', newWithdrawal);
    return withdrawalId;
  };

  const updateTransactionStatus = (transactionId: string, status: TransactionStatus) => {
    setOngoingTransactions(prev => 
      prev.map(transaction => 
        transaction.id === transactionId 
          ? { ...transaction, status }
          : transaction
      )
    );
    console.log(`Updated transaction ${transactionId} status to ${status}`);
  };

  const updateDepositStatus = (depositId: string, status: DepositStatus) => {
    updateTransactionStatus(depositId, status);
  };

  const getVaultTransactions = (vaultId: string, walletAddress: string): OngoingTransaction[] => {
    return ongoingTransactions.filter(transaction => 
      transaction.vaultId === vaultId && 
      transaction.walletAddress.toLowerCase() === walletAddress.toLowerCase()
    );
  };

  const getVaultDeposits = (vaultId: string, walletAddress: string): OngoingDeposit[] => {
    return ongoingTransactions.filter(transaction => 
      transaction.vaultId === vaultId && 
      transaction.walletAddress.toLowerCase() === walletAddress.toLowerCase() &&
      transaction.type === 'deposit'
    ) as OngoingDeposit[];
  };

  const getVaultWithdrawals = (vaultId: string, walletAddress: string): OngoingTransaction[] => {
    return ongoingTransactions.filter(transaction => 
      transaction.vaultId === vaultId && 
      transaction.walletAddress.toLowerCase() === walletAddress.toLowerCase() &&
      transaction.type === 'withdrawal'
    );
  };

  const removeTransaction = (transactionId: string) => {
    setOngoingTransactions(prev => prev.filter(transaction => transaction.id !== transactionId));
    console.log(`Removed transaction ${transactionId}`);
  };

  const removeDeposit = (depositId: string) => {
    removeTransaction(depositId);
  };

  // Legacy getter for backwards compatibility
  const ongoingDeposits = ongoingTransactions.filter(t => t.type === 'deposit') as OngoingDeposit[];

  return (
    <DepositContext.Provider 
      value={{ 
        ongoingTransactions,
        ongoingDeposits,
        createDeposit,
        createWithdrawal,
        updateTransactionStatus,
        updateDepositStatus,
        getVaultDeposits,
        getVaultWithdrawals,
        getVaultTransactions,
        removeTransaction,
        removeDeposit
      }}
    >
      {children}
    </DepositContext.Provider>
  );
} 