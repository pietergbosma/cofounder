import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: () => void;
  amount: number;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentComplete,
  amount,
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16 && /^\d*$/.test(value)) {
      setCardNumber(value);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setExpiryDate(value);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setCvv(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
      alert('Please fill in all payment fields');
      return;
    }

    if (cardNumber.length !== 16) {
      alert('Please enter a valid 16-digit card number');
      return;
    }

    if (expiryDate.length !== 4) {
      alert('Please enter a valid expiry date (MM/YY)');
      return;
    }

    if (cvv.length < 3) {
      alert('Please enter a valid CVV');
      return;
    }

    setProcessing(true);

    // Mock payment processing (simulate API call)
    setTimeout(() => {
      setProcessing(false);
      alert(`Payment of $${amount} processed successfully! (Mock)`);
      onPaymentComplete();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Payment</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
              disabled={processing}
            >
              ×
            </button>
          </div>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Project Posting Fee</span>
              <span className="text-2xl font-bold text-gray-900">${amount}</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              One-time payment to post your project and start finding co-founders
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cardholder Name
              </label>
              <input
                type="text"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
                disabled={processing}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <input
                type="text"
                value={formatCardNumber(cardNumber)}
                onChange={handleCardNumberChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="1234 5678 9012 3456"
                disabled={processing}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="text"
                  value={formatExpiryDate(expiryDate)}
                  onChange={handleExpiryChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="MM/YY"
                  disabled={processing}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  value={cvv}
                  onChange={handleCvvChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="123"
                  disabled={processing}
                  required
                />
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <Button type="submit" className="w-full" disabled={processing}>
                {processing ? 'Processing...' : `Pay $${amount}`}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onClose}
                disabled={processing}
              >
                Cancel
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              🔒 This is a mock payment. No real transaction will occur.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
