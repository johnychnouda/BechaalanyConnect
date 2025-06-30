import React from 'react';

const GlobalState = React.createContext({});

export default GlobalState;

// Converts Western digits (0-9) in a string to Arabic-Indic digits
export function toArabicDigits(input: string): string {
    return input.replace(/\d/g, d => String.fromCharCode(0x0660 + Number(d)));
}

export function formatArabicPhone(phone: string): string {
    return  toArabicDigits(phone);
}