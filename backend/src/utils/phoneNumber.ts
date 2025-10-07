import mobileNumberPrefixes from '../constants/mobile_numbers';

export interface PhoneNumberInfo {
    isValid: boolean;
    country?: string;
    countryCode?: string;
    isoCode?: string;
    operator?: string;
    prefixType?: 'old' | 'new' | 'mobile' | 'landline';
    prefix?: string;
    normalizedNumber?: string;
}

/**
 * Normalizes a phone number by removing common formatting characters
 * @param phoneNumber - The phone number to normalize
 * @returns Normalized phone number string
 */
export function normalizePhoneNumber(phoneNumber: string): string {
    // Remove spaces, dashes, parentheses, and plus signs
    return phoneNumber.replace(/[\s\-\(\)\+]/g, '');
}

/**
 * Searches for phone number information by matching prefixes
 * @param phoneNumber - The phone number to search for
 * @returns PhoneNumberInfo object with operator and country details
 */
export function searchPhoneNumber(phoneNumber: string): PhoneNumberInfo {
    const normalizedNumber = normalizePhoneNumber(phoneNumber);

    // If number is empty or too short, return invalid
    if (!normalizedNumber || normalizedNumber.length < 3) {
        return { isValid: false };
    }

    // Iterate through all countries
    for (const [isoCode, countryData] of Object.entries(mobileNumberPrefixes)) {
        const { country, countryCode, operators } = countryData;

        // Check if number starts with country code (without +)
        const countryCodeDigits = countryCode.replace('+', '');
        let numberToCheck = normalizedNumber;

        // If number starts with country code, remove it for prefix matching
        if (normalizedNumber.startsWith(countryCodeDigits)) {
            numberToCheck = normalizedNumber.slice(countryCodeDigits.length);
        }

        // Check each operator
        for (const [operatorName, operatorData] of Object.entries(operators)) {
            // Check old prefixes
            if ('old' in operatorData && operatorData.old && operatorData.old.length > 0) {
                for (const prefix of operatorData.old) {
                    if (numberToCheck.startsWith(prefix)) {
                        return {
                            isValid: true,
                            country,
                            countryCode,
                            isoCode,
                            operator: operatorName,
                            prefixType: 'old',
                            prefix,
                            normalizedNumber
                        };
                    }
                }
            }

            // Check new prefixes
            if ('new' in operatorData && operatorData.new && operatorData.new.length > 0) {
                for (const prefix of operatorData.new) {
                    if (numberToCheck.startsWith(prefix)) {
                        return {
                            isValid: true,
                            country,
                            countryCode,
                            isoCode,
                            operator: operatorName,
                            prefixType: 'new',
                            prefix,
                            normalizedNumber
                        };
                    }
                }
            }

            // Check mobile prefixes (for Zamtel)
            if ('mobile' in operatorData && operatorData.mobile && operatorData.mobile.length > 0) {
                for (const prefix of operatorData.mobile) {
                    if (numberToCheck.startsWith(prefix)) {
                        return {
                            isValid: true,
                            country,
                            countryCode,
                            isoCode,
                            operator: operatorName,
                            prefixType: 'mobile',
                            prefix,
                            normalizedNumber
                        };
                    }
                }
            }

            // Check landline prefixes (for Zamtel)
            if ('landline' in operatorData && operatorData.landline && operatorData.landline.length > 0) {
                for (const prefix of operatorData.landline) {
                    if (numberToCheck.startsWith(prefix)) {
                        return {
                            isValid: true,
                            country,
                            countryCode,
                            isoCode,
                            operator: operatorName,
                            prefixType: 'landline',
                            prefix,
                            normalizedNumber
                        };
                    }
                }
            }
        }
    }

    // If no match found, return invalid
    return {
        isValid: false,
        normalizedNumber
    };
}

/**
 * Gets all operators for a specific country
 * @param isoCode - The ISO code of the country (e.g., 'ZM', 'KE')
 * @returns Array of operator names or empty array if country not found
 */
export function getOperatorsByCountry(isoCode: string): string[] {
    const countryData = mobileNumberPrefixes[isoCode as keyof typeof mobileNumberPrefixes];
    if (!countryData) {
        return [];
    }

    return Object.keys(countryData.operators);
}

/**
 * Gets all prefixes for a specific operator in a country
 * @param isoCode - The ISO code of the country
 * @param operator - The operator name
 * @returns Object with all prefixes for the operator
 */
export function getOperatorPrefixes(isoCode: string, operator: string) {
    const countryData = mobileNumberPrefixes[isoCode as keyof typeof mobileNumberPrefixes];
    if (!countryData) {
        return null;
    }

    const operatorData = countryData.operators[operator as keyof typeof countryData.operators];
    if (!operatorData) {
        return null;
    }

    return operatorData;
}

/**
 * Validates if a phone number is valid for a specific country
 * @param phoneNumber - The phone number to validate
 * @param isoCode - The ISO code of the expected country
 * @returns boolean indicating if the number is valid for the country
 */
export function validatePhoneNumberForCountry(phoneNumber: string, isoCode: string): boolean {
    const result = searchPhoneNumber(phoneNumber);
    return result.isValid && result.isoCode === isoCode;
}

/**
 * Formats a phone number with country code
 * @param phoneNumber - The phone number to format
 * @param includeCountryCode - Whether to include the country code
 * @returns Formatted phone number string
 */
export function formatPhoneNumber(phoneNumber: string, includeCountryCode: boolean = true): string {
    const result = searchPhoneNumber(phoneNumber);

    if (!result.isValid || !result.countryCode) {
        return phoneNumber; // Return original if invalid
    }

    const normalized = result.normalizedNumber!;
    const countryCodeDigits = result.countryCode.replace('+', '');

    // Remove country code if present in normalized number
    let localNumber = normalized;
    if (normalized.startsWith(countryCodeDigits)) {
        localNumber = normalized.slice(countryCodeDigits.length);
    }

    if (includeCountryCode) {
        return `${result.countryCode} ${localNumber}`;
    }

    return localNumber;
}