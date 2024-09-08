import Stripe from 'stripe';
import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51PvxKrDsc8K2y9kbCrEJxMQENqoSwUiI6IKPPE1zdPtuhLG0vONQCJ5hLm3HaQzkuHVY1T3lySTlGuYDnBo0fweM00ClUznmJL'
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get Checkout session from API
    const session = await axios(
      `${window.location.origin}/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log(session);

    // 2) Create checkout form + charge credit card

    // Old version (Deprecated)
    // await stripe.redirectToCheckout({
    //   sessionId: session.data.session.id,
    // });

    window.location.href = session.data.session.url;
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
