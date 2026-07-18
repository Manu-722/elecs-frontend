export async function initiateSTK(phone, amount) {
  try {
    const response = await fetch('/api/initiate_stk_push/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, amount }),
    });

    const data = await response.json();

    if (data.ResponseCode === '0') {
      return { success: true, message: 'Payment prompt sent. Please check your M-Pesa app.' };
    } else {
      return {
        success: false,
        message: data.ResponseDescription || 'Something went wrong with the payment initiation.',
      };
    }
  } catch (error) {
    console.error('STK Error:', error);
    return { success: false, message: 'Payment request failed. Please try again.' };
  }
}