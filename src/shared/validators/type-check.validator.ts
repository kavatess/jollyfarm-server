export function checkTypeOfNumber(value: any): boolean {
    return typeof (value) == 'number';
}

export function checkTypeOfString(value: any): boolean {
    return typeof (value) == 'string'
}

export function checkTypeOfArray(value: any): boolean {
    return value instanceof Array;
}

export function checkTypeOfDate(value: any): boolean {
    return new Date(value).toString() != "Invalid Date";
}