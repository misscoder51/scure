import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, Lock, CreditCard } from 'lucide-react';
import axios from 'axios';

// Mock test publishable key - in a real app this is loaded from .env
const stripePromise = loadStripe('pk_test_51MockStripePubKeyForScureProject00000000000000000000000000000000000000000000000000000000000');

const CheckoutForm = ({ amount, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    try {
      const { data } = await axios.post('http://localhost:5001/payments/create-payment-intent', { amount });
      const clientSecret = data.clientSecret;

      // In a real environment, we'd confirm the card payment here:
      // const result = await stripe.confirmCardPayment(clientSecret, {
      //   payment_method: { card: elements.getElement(CardElement) }
      // });
      
      // Since we are mocking Stripe logic for the demo, we simulate success:
      setTimeout(() => {
        setIsProcessing(false);
        onSuccess();
      }, 1500);

    } catch (err) {
      setError('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const cardStyle = {
    style: {
      base: {
        color: '#e2e8f0',
        fontFamily: 'Inter, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': { color: 'rgba(148,163,184,0.5)' }
      },
      invalid: { color: '#f9a8d4', iconColor: '#f9a8d4' }
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: 12 }}>
        <CardElement options={cardStyle} />
      </div>
      
      {error && <div style={{ color: '#f9a8d4', fontSize: '0.85rem', fontWeight: 600 }}>{error}</div>}
      
      <button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="btn-cyber-primary" 
        style={{ padding: '12px', width: '100%', display: 'flex', justifyContent: 'center', background: 'linear-gradient(135deg, #fbcfe8, #059669)', border: 'none' }}
      >
        {isProcessing ? 'Processing...' : `Pay $${amount}.00 & Continue`}
      </button>
    </form>
  );
};

const PaymentModal = ({ amount, isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(3,7,18,0.8)', backdropFilter: 'blur(8px)',
    }}>
      <div style={{
        background: 'rgba(6,9,20,0.95)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 24, padding: '2rem', width: '100%', maxWidth: 420,
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', position: 'relative'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 20, right: 20, background: 'none', border: 'none',
          color: 'rgba(148,163,184,0.6)', cursor: 'pointer'
        }}>
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(251,207,232,0.1), rgba(249,168,212,0.1))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', border: '1px solid rgba(251,207,232,0.2)'
          }}>
            <CreditCard size={28} style={{ color: '#fbcfe8' }} />
          </div>
          <h2 style={{ color: '#f8fafc', margin: '0 0 8px', fontSize: '1.4rem', fontWeight: 800 }}>Secure Payment</h2>
          <p style={{ color: 'rgba(148,163,184,0.7)', margin: 0, fontSize: '0.85rem' }}>
            Complete your payment of <strong>${amount}.00</strong> to launch the secure telehealth consultation.
          </p>
        </div>

        <Elements stripe={stripePromise}>
          <CheckoutForm amount={amount} onSuccess={onSuccess} onCancel={onClose} />
        </Elements>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: '1.5rem', color: 'rgba(148,163,184,0.5)', fontSize: '0.75rem' }}>
          <Lock size={12} /> Payments are secure and encrypted
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
