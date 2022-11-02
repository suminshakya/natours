/*eslint-disable */
import axios from 'axios';
import { showAlert } from './alert'
const stripe = Stripe('pk_test_51LzFJpGATmApRiMGVCH1HtoMc2yOsPnxARxamXPoZAkqxMrLsH58FXMcdPQQunX6Tx4nimTeCo1nTQMpBsvfITcQ00Uu2NQrkU');

export const bookTour = async tourId =>{

    try{
    // 1) Get session from API
    console.log(tourId)
    const session = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`); 
    
    // 2) Get checkout form credit card
    await stripe.redirectToCheckout({
        sessionId: session.data.session.id
    });
    }catch(err){
        console.log(err);
        showAlert('error', err);
    }

}