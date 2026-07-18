import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';

const CardCheckoutForm = ({ amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      
      const intentRes = await fetch('http://localhost:8000/api/create-payment-intent/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      const { clientSecret } = await intentRes.json();
      if (!clientSecret) throw new Error('Missing client secret');

      
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        toast.error(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        toast.success('Payment successful!');
        onSuccess(); 
      } else {
        toast.error('Payment failed or incomplete.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong with Stripe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto p-4 border rounded shadow">
      <label className="block text-sm font-medium text-gray-700 mb-1">Card Information</label>
      <div className="border p-2 rounded bg-white">
        <CardElement options={{ hidePostalCode: true }} />
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className={`w-full mt-4 ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold px-6 py-2 rounded`}
      >
        {loading ? 'Processing Payment...' : 'Pay Now'}
      </button>
    </form>
  );
};

export default CardCheckoutForm;