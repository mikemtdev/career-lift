// Example usage of the phone number utility functions

import {
    searchPhoneNumber,
    getOperatorsByCountry,
    getOperatorPrefixes,
    validatePhoneNumberForCountry,
    formatPhoneNumber,
    normalizePhoneNumber
} from './phoneNumber';

// Example usage:

console.log('=== Phone Number Search Examples ===');

// Test Zambian numbers
console.log('\n--- Zambian Numbers ---');
console.log('097-123-4567:', searchPhoneNumber('097-123-4567'));
console.log('+260 97 123 4567:', searchPhoneNumber('+260 97 123 4567'));
console.log('057123456:', searchPhoneNumber('057123456'));
console.log('095123456:', searchPhoneNumber('095123456')); // MTN old
console.log('076123456:', searchPhoneNumber('076123456')); // MTN new
console.log('0211123456:', searchPhoneNumber('0211123456')); // Zamtel landline

// Test Kenyan numbers
console.log('\n--- Kenyan Numbers ---');
console.log('0730123456:', searchPhoneNumber('0730123456')); // Airtel old
console.log('0100123456:', searchPhoneNumber('0100123456')); // Airtel new

// Test Ugandan numbers
console.log('\n--- Ugandan Numbers ---');
console.log('074123456:', searchPhoneNumber('074123456')); // Airtel new
console.log('077123456:', searchPhoneNumber('077123456')); // MTN old

// Test Ghanaian numbers
console.log('\n--- Ghanaian Numbers ---');
console.log('024123456:', searchPhoneNumber('024123456')); // MTN old

console.log('\n=== Utility Functions ===');

// Get operators by country
console.log('\nOperators in Zambia:', getOperatorsByCountry('ZM'));
console.log('Operators in Kenya:', getOperatorsByCountry('KE'));

// Get operator prefixes
console.log('\nMTN prefixes in Zambia:', getOperatorPrefixes('ZM', 'mtn'));
console.log('Airtel prefixes in Kenya:', getOperatorPrefixes('KE', 'airtel'));

// Validate phone numbers
console.log('\nValidation Examples:');
console.log('Is 097123456 valid for Zambia?', validatePhoneNumberForCountry('097123456', 'ZM'));
console.log('Is 097123456 valid for Kenya?', validatePhoneNumberForCountry('097123456', 'KE'));

// Format phone numbers
console.log('\nFormatting Examples:');
console.log('Format 097123456:', formatPhoneNumber('097123456'));
console.log('Format without country code:', formatPhoneNumber('097123456', false));

// Normalize phone numbers
console.log('\nNormalization Examples:');
console.log('Normalize "+260 97-123 4567":', normalizePhoneNumber('+260 97-123 4567'));
console.log('Normalize "(097) 123-4567":', normalizePhoneNumber('(097) 123-4567'));