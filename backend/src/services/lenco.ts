import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const LENCO_API_KEY = process.env.LENCO_API_KEY || '';
const LENCO_SECRET_KEY = process.env.LENCO_SECRET_KEY || '';
const LENCO_BASE_URL = process.env.LENCO_BASE_URL || 'https://api.lenco.co/v2';

interface InitiatePaymentParams {
  amount: number;
  currency: string;
  paymentMethod: 'mobile_money' | 'card';
  customerEmail: string;
  customerName: string;
  phoneNumber?: string;
  reference: string;
  callbackUrl?: string;
}

interface LencoPaymentResponse {
  status: string;
  message: string;
  data: {
    reference: string;
    authorization_url?: string;
    access_code?: string;
  };
}

interface VerifyPaymentResponse {
  status: string;
  message: string;
  data: {
    reference: string;
    amount: number;
    currency: string;
    status: string;
    paid_at?: string;
  };
}

class LencoPaymentService {
  private apiKey: string;
  private secretKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = LENCO_API_KEY;
    this.secretKey = LENCO_SECRET_KEY;
    this.baseUrl = LENCO_BASE_URL;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async initiateMobileMoneyPayment(params: InitiatePaymentParams): Promise<LencoPaymentResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/payments/mobile-money/initialize`,
        {
          amount: params.amount,
          currency: params.currency,
          email: params.customerEmail,
          name: params.customerName,
          phone_number: params.phoneNumber,
          reference: params.reference,
          callback_url: params.callbackUrl,
        },
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error: any) {
      console.error('Lenco mobile money payment error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to initiate mobile money payment');
    }
  }

  async initiateCardPayment(params: InitiatePaymentParams): Promise<LencoPaymentResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/payments/card/initialize`,
        {
          amount: params.amount,
          currency: params.currency,
          email: params.customerEmail,
          name: params.customerName,
          reference: params.reference,
          callback_url: params.callbackUrl,
        },
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error: any) {
      console.error('Lenco card payment error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to initiate card payment');
    }
  }

  async verifyPayment(reference: string): Promise<VerifyPaymentResponse> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/payments/verify/${reference}`,
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error: any) {
      console.error('Lenco verify payment error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to verify payment');
    }
  }
}

export const lencoService = new LencoPaymentService();
