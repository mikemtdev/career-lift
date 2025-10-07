const API_BASE_URL = import.meta.env.VITE_API_URL || '';

class ApiClient {
  private getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  async fetch(endpoint: string, options: RequestInit = {}) {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  async login(email: string, password: string) {
    const data = await this.fetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    console.log("gee", data);

    localStorage.setItem('token', data.token);
    return data;
  }

  async signup(email: string, password: string, name?: string) {
    const data = await this.fetch('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    localStorage.setItem('token', data.token);
    return data;
  }

  logout() {
    localStorage.removeItem('token');
  }

  async getCvs() {
    return this.fetch('/cv');
  }

  async getCv(cvId: string) {
    return this.fetch(`/cv/${cvId}`);
  }

  async createCv(cvData: any) {
    return this.fetch('/cv', {
      method: 'POST',
      body: JSON.stringify(cvData),
    });
  }

  async initiatePayment(paymentData: {
    paymentMethod: 'mobile_money' | 'card';
    phoneNumber?: string;
    amount: number;
    currency: string;
    cvData: any;
  }) {
    return this.fetch('/payment/initiate', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async verifyPayment(reference: string) {
    return this.fetch(`/payment/verify/${reference}`, {
      method: 'POST',
  async updateCv(cvId: string, cvData: any) {
    return this.fetch(`/cv/${cvId}`, {
      method: 'PUT',
      body: JSON.stringify(cvData),
    });
  }

  async deleteCv(cvId: string) {
    return this.fetch(`/cv/${cvId}`, {
      method: 'DELETE',
    });
  }

  async downloadCv(cvId: string) {
    const token = this.getAuthToken();
    const response = await fetch(`${API_BASE_URL}/cv/download/${cvId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Download failed');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cv-${cvId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  async getPricing() {
    return this.fetch('/cv/pricing');
  }

  async getAdminStats() {
    return this.fetch('/admin/stats');
  }

  async getAdminPricing() {
    return this.fetch('/admin/pricing');
  }

  async updateAdminPricing(priceInCents: number) {
    return this.fetch('/admin/pricing', {
      method: 'PUT',
      body: JSON.stringify({ additionalCvPrice: priceInCents }),
    });
  }
}

export const apiClient = new ApiClient();
