const mobileNumberPrefixes = {
    ZM: {
        country: "Zambia",
        countryCode: "+260",
        isoCode: "ZM",
        operators: {
            airtel: {
                old: ["097", "077"],
                new: ["057"]
            },
            mtn: {
                old: ["095", "096", "078", "079"],
                new: ["076"]
            },
            zamtel: {
                mobile: ["095"],
                landline: ["0211", "0212", "0213", "0214", "0215", "0216", "0217", "0218"]
            }
        }
    },
    KE: {
        country: "Kenya",
        countryCode: "+254",
        isoCode: "KE",
        operators: {
            airtel: {
                old: ["0730", "0731", "0732", "0733", "0734", "0735", "0736", "0737", "0738", "0739", "0750", "0751", "0752", "0753", "0754", "0755", "0756"],
                new: ["0100", "0101", "0102"]
            }
        }
    },
    UG: {
        country: "Uganda",
        countryCode: "+256",
        isoCode: "UG",
        operators: {
            airtel: {
                old: [],
                new: ["074"]
            },
            mtn: {
                old: ["077", "078"],
                new: ["076"]
            }
        }
    },
    GH: {
        country: "Ghana",
        countryCode: "+233",
        isoCode: "GH",
        operators: {
            mtn: {
                old: ["024", "025", "053", "054", "055", "059"],
                new: []
            }
        }
    }
};

export default mobileNumberPrefixes;
