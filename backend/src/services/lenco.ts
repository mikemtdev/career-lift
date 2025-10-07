import axios from 'axios';
import dotenv from 'dotenv';
import { searchPhoneNumber, formatPhoneNumber, normalizePhoneNumber } from '../utils/phoneNumber';

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
  phoneNumber?: string; // Required for mobile money payments, optional for card payments
  reference: string;
  callbackUrl?: string;
}

interface MobileMoneyCollectionParams {
  phoneNumber: string;
  bearer: 'merchant' | 'customer';
  amount: number;
  reference: string;
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

  /**
   * Validates if a phone number is supported for Lenco payments
   * @param phoneNumber - The phone number to validate
   * @returns Object with validation result and phone info
   */
  validatePhoneNumberForPayment(phoneNumber: string) {
    const phoneInfo = searchPhoneNumber(phoneNumber);

    if (!phoneInfo.isValid) {
      return {
        isValid: false,
        error: 'Invalid phone number format',
        phoneInfo: null
      };
    }

    if (!phoneInfo.operator || !phoneInfo.isoCode) {
      return {
        isValid: false,
        error: 'Could not determine operator or country from phone number',
        phoneInfo
      };
    }

    // Check if country is supported
    const supportedCountries = ['ZM', 'KE', 'UG', 'GH'];
    if (!supportedCountries.includes(phoneInfo.isoCode)) {
      return {
        isValid: false,
        error: `Country ${phoneInfo.country} is not supported for payments`,
        phoneInfo
      };
    }

    // Check if operator is supported
    const supportedOperators = ['airtel', 'mtn', 'zamtel'];
    if (!supportedOperators.includes(phoneInfo.operator)) {
      return {
        isValid: false,
        error: `Operator ${phoneInfo.operator} is not supported for payments`,
        phoneInfo
      };
    }

    return {
      isValid: true,
      error: null,
      phoneInfo
    };
  }

  /**
   * Formats phone number for display in payment UI
   * @param phoneNumber - The phone number to format
   * @returns Formatted phone number string
   */
  formatPhoneNumberForDisplay(phoneNumber: string): string {
    return formatPhoneNumber(phoneNumber, true);
  }

  async initiateMobileMoneyPayment(params: InitiatePaymentParams): Promise<LencoPaymentResponse> {
    // Phone number is required for mobile money payments
    if (!params.phoneNumber) {
      throw new Error('Phone number is required for mobile money payments');
    }

    // Use phone number utility to get operator and country info
    const phoneInfo = searchPhoneNumber(params.phoneNumber);
    console.log(phoneInfo);

    if (!phoneInfo.isValid) {
      throw new Error('Invalid phone number provided');
    }

    if (!phoneInfo.operator || !phoneInfo.isoCode) {
      throw new Error('Could not determine operator or country from phone number');
    }

    // Map ISO codes to country codes expected by Lenco
    const countryMap: { [key: string]: string } = {
      'ZM': 'zm',
      'KE': 'ke',
      'UG': 'ug',
      'GH': 'gh'
    };

    const country = countryMap[phoneInfo.isoCode];
    if (!country) {
      throw new Error(`Unsupported country: ${phoneInfo.country}`);
    }

    // Validate operator is supported by Lenco
    if (!['airtel', 'mtn', 'zamtel'].includes(phoneInfo.operator)) {
      throw new Error(`Unsupported operator: ${phoneInfo.operator}`);
    }

    const bearer = 'merchant';
    const normalizedPhone = normalizePhoneNumber(params.phoneNumber!);
    console.log({
      operator: phoneInfo.operator,
      bearer: bearer,
      amount: params.amount,
      reference: params.reference,
      phone: normalizedPhone,
      country: country
    });

    try {
      const options = {
        method: 'POST',
        url: `${this.baseUrl}/collections/mobile-money`,
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          Authorization: `Bearer ${this.secretKey}`
        },
        data: {
          operator: phoneInfo.operator,
          bearer: bearer,
          amount: params.amount,
          reference: params.reference,
          phone: normalizedPhone,
          country: country
        }
      };

      const response = await axios.request(options);
      console.log("Lenco mobile money payment response:", response.data);

      return response.data;
    } catch (error: any) {
      console.error('Lenco mobile money payment error:', error);
      throw new Error(error.response?.data?.message || 'Failed to initiate mobile money payment');
    }
  }

  async collectMobileMoney(params: MobileMoneyCollectionParams): Promise<LencoPaymentResponse> {
    try {
      // Use phone number utility to get operator and country info
      const phoneInfo = searchPhoneNumber(params.phoneNumber);

      if (!phoneInfo.isValid) {
        throw new Error('Invalid phone number provided');
      }

      if (!phoneInfo.operator || !phoneInfo.isoCode) {
        throw new Error('Could not determine operator or country from phone number');
      }

      // Map ISO codes to country codes expected by Lenco
      const countryMap: { [key: string]: string } = {
        'ZM': 'zm',
        'KE': 'ke',
        'UG': 'ug',
        'GH': 'gh'
      };

      const country = countryMap[phoneInfo.isoCode];
      if (!country) {
        throw new Error(`Unsupported country: ${phoneInfo.country}`);
      }

      // Validate operator is supported by Lenco
      if (!['airtel', 'mtn', 'zamtel'].includes(phoneInfo.operator)) {
        throw new Error(`Unsupported operator: ${phoneInfo.operator}`);
      }

      const normalizedPhone = normalizePhoneNumber(params.phoneNumber);

      const options = {
        method: 'POST',
        url: `${this.baseUrl}/collections/mobile-money`,
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`
        },
        data: {
          operator: phoneInfo.operator,
          bearer: params.bearer,
          amount: params.amount,
          reference: params.reference,
          phone: normalizedPhone,
          country: country
        }
      };

      const response = await axios.request(options);
      console.log("Lenco mobile money collection response:", response.data);

      return response.data;
    } catch (error: any) {
      console.error('Lenco mobile money collection error:', error);
      throw new Error(error.response?.data?.message || 'Failed to collect mobile money payment');
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
      const options = {
        method: 'GET',
        url: `${this.baseUrl}/collections/status/${reference}`,
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${this.secretKey}`
        }
      };

      const response = await axios.request(options);
      console.log("Collection status response:", response.data);

      return response.data;
    } catch (error: any) {
      console.error('Lenco collection status error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to check collection status');
    }
  }
}

export const lencoService = new LencoPaymentService();
