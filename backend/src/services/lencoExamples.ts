// Example usage of the updated Lenco service with phone number utility

import { lencoService } from './lenco';

// Example function to demonstrate the updated Lenco service usage
async function exampleLencoUsage() {
    console.log('=== Lenco Service with Phone Number Utility Examples ===');

    // Test phone number validation
    console.log('\n--- Phone Number Validation ---');

    const testNumbers = [
        '0976973101', // Zambian Airtel
        '095123456',  // Zambian MTN
        '0730123456', // Kenyan Airtel
        '074123456',  // Ugandan Airtel
        '024123456',  // Ghanaian MTN
        '123456789',  // Invalid number
    ];

    for (const phoneNumber of testNumbers) {
        const validation = lencoService.validatePhoneNumberForPayment(phoneNumber);
        console.log(`Phone: ${phoneNumber}`);
        console.log(`Valid: ${validation.isValid}`);
        if (validation.phoneInfo) {
            console.log(`Country: ${validation.phoneInfo.country}`);
            console.log(`Operator: ${validation.phoneInfo.operator}`);
            console.log(`Formatted: ${lencoService.formatPhoneNumberForDisplay(phoneNumber)}`);
        }
        if (validation.error) {
            console.log(`Error: ${validation.error}`);
        }
        console.log('---');
    }

    // Example mobile money payment
    console.log('\n--- Mobile Money Payment Example ---');

    try {
        const paymentParams = {
            amount: 100,
            currency: 'ZMW',
            paymentMethod: 'mobile_money' as const,
            customerEmail: 'customer@example.com',
            customerName: 'John Doe',
            phoneNumber: '0976973101', // Zambian Airtel number
            reference: 'test-ref-' + Date.now(),
            callbackUrl: 'https://your-app.com/callback'
        };

        // Validate phone number first
        const validation = lencoService.validatePhoneNumberForPayment(paymentParams.phoneNumber);
        if (!validation.isValid) {
            console.log('Payment failed - Invalid phone number:', validation.error);
            return;
        }

        console.log('Phone number validated successfully:');
        console.log(`- Country: ${validation.phoneInfo?.country}`);
        console.log(`- Operator: ${validation.phoneInfo?.operator}`);
        console.log(`- Formatted: ${lencoService.formatPhoneNumberForDisplay(paymentParams.phoneNumber)}`);

        // Initiate payment (commented out to avoid actual API calls)
        // const paymentResponse = await lencoService.initiateMobileMoneyPayment(paymentParams);
        // console.log('Payment initiated:', paymentResponse);

        console.log('Payment would be initiated with auto-detected operator and country');

    } catch (error) {
        console.error('Payment error:', error);
    }

    // Example mobile money collection
    console.log('\n--- Mobile Money Collection Example ---');

    try {
        const collectionParams = {
            phoneNumber: '095123456', // Zambian MTN number
            bearer: 'merchant' as const,
            amount: 50,
            reference: 'collection-ref-' + Date.now()
        };

        // Validate phone number first
        const validation = lencoService.validatePhoneNumberForPayment(collectionParams.phoneNumber);
        if (!validation.isValid) {
            console.log('Collection failed - Invalid phone number:', validation.error);
            return;
        }

        console.log('Phone number validated for collection:');
        console.log(`- Country: ${validation.phoneInfo?.country}`);
        console.log(`- Operator: ${validation.phoneInfo?.operator}`);

        // Collect payment (commented out to avoid actual API calls)
        // const collectionResponse = await lencoService.collectMobileMoney(collectionParams);
        // console.log('Collection initiated:', collectionResponse);

        console.log('Collection would be initiated with auto-detected operator and country');

    } catch (error) {
        console.error('Collection error:', error);
    }
}

// Uncomment to run the example
// exampleLencoUsage();

export { exampleLencoUsage };