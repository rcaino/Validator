import { ValidationCodes } from "./ValidationCodes";

export default class Validations {

    static required(value: string): ValidationCodes;
    static required(value: number): ValidationCodes;
    static required(value: boolean): ValidationCodes;
    static required(value: Date): ValidationCodes;
    static required(value?: string | number | boolean | Date): ValidationCodes
    static required<T>(value: T): ValidationCodes {

        if (
            (value === null || value === undefined) ||

            (value instanceof Date && value === new Date()) ||

            (value instanceof String && value === '') ||

            (value instanceof Object && (Object.keys(value).length == 0))
        )
            return ValidationCodes.Required;

        return ValidationCodes.OK;
    }

    static isNotEmpty = this.required;

    static minVal = <T = number | Date>(minValue: T) => (fieldValue: T) => fieldValue >= minValue ? ValidationCodes.OK : ValidationCodes.minVal;
    static maxVal = <T = number | Date>(maxValue: T) => (fieldValue: T) => fieldValue <= maxValue ? ValidationCodes.OK : ValidationCodes.maxVal;
    static isInRange = <T = number | Date>(minValue: T, maxValue: T) => (fieldValue: T) => fieldValue <= maxValue && fieldValue >= minValue ? ValidationCodes.OK : ValidationCodes.isInRange;
    static isBetween = <T = number | Date>(minValue: T, maxValue: T) => (fieldValue: T) => fieldValue < maxValue && fieldValue > minValue ? ValidationCodes.OK : ValidationCodes.isBetween;
    static maxLen = (maxLen: number) => (fieldValue: string) => fieldValue?.length <= maxLen ? ValidationCodes.OK : ValidationCodes.maxLen;
    static minLen = (minLen: number) => (fieldValue: string) => fieldValue?.length >= minLen ? ValidationCodes.OK : ValidationCodes.minLen;
    static len = (Len: number) => (fieldValue: string) => fieldValue?.length == Len ? ValidationCodes.OK : ValidationCodes.len;
    static match = (regEx: RegExp) => (fieldValue: string) => regEx.test(fieldValue) ? ValidationCodes.OK : ValidationCodes.match;
    static isTrue = (fieldValue: boolean) => fieldValue === true ? ValidationCodes.OK : ValidationCodes.isTrue;
    static isFalse = (fieldValue: boolean) => fieldValue === false ? ValidationCodes.OK : ValidationCodes.isFalse;
    static and = <T>(...rules: ((fieldValue: T) => ValidationCodes)[]) => (fieldValue: T) => {
        for (const rule of rules) {
            const result = rule(fieldValue);
            if (result !== ValidationCodes.OK) {
                return result;
            }
        }
        return ValidationCodes.OK;
    }
    static or = <T>(...rules: ((fieldValue: T) => ValidationCodes)[]) => (fieldValue: T) => {
        let result = ValidationCodes.OK;
        for (const rule of rules) {
            const ruleResult = rule(fieldValue);
            if (ruleResult === ValidationCodes.OK) {
                return ValidationCodes.OK;
            } else if (result === ValidationCodes.OK) {
                result = ruleResult;
            }
        }
        return ValidationCodes.OK;
    }

    static maxCount = (maxLen: number) => <T>(list: Array<T>) => list?.length <= maxLen ? ValidationCodes.OK : ValidationCodes.maxCount;
    static minCount = (minLen: number) => <T>(list: Array<T>) => list?.length >= minLen ? ValidationCodes.OK : ValidationCodes.minCount;
    static count = (count: number) => <T>(list: Array<T>) => list?.length == count ? ValidationCodes.OK : ValidationCodes.count;
}