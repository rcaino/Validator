import { ValidationCode, CoreValidationCodes } from "./ValidationCode";
export type ValidationCodes = ValidationCode; // Para compatibilidad con código existente

export default class Validations {
    /**
     * Valida que un valor primitivo (string, number, boolean, Date) no sea null ni undefined
     * Útil para validaciones compuestas donde necesitamos verificar que un campo tenga valor
     * antes de aplicar otras reglas
     */
    static hasValue(value: string): ValidationCode;
    static hasValue(value: number): ValidationCode;
    static hasValue(value: boolean): ValidationCode;
    static hasValue(value: Date): ValidationCode;
    static hasValue(value: any): ValidationCode {
        if (value === null || value === undefined || 
            (typeof value === 'string' && value === '') ||
            (value instanceof Date && value.toString() === new Date().toString())) {
            return CoreValidationCodes.HAS_VALUE;
        }
        return CoreValidationCodes.OK;
    }

    /**
     * Valida que una colección (array u objeto) no esté vacía
     * Útil para validaciones compuestas donde necesitamos verificar que una colección tenga elementos
     * antes de aplicar otras reglas
     */
    static isNotEmpty(value: Array<any>): ValidationCode;
    static isNotEmpty(value: object): ValidationCode;
    static isNotEmpty(value: any): ValidationCode {
        if (value === null || value === undefined ||
            (Array.isArray(value) && value.length === 0) ||
            (typeof value === 'object' && Object.keys(value).length === 0)) {
            return CoreValidationCodes.HAS_VALUE;
        }
        return CoreValidationCodes.OK;
    }

    static minVal = (minValue: number | Date) => (fieldValue: number | Date | null | undefined) =>
        fieldValue !== null && fieldValue !== undefined && fieldValue >= minValue ? CoreValidationCodes.OK : CoreValidationCodes.MIN_VAL;

    static maxVal = (maxValue: number | Date) => (fieldValue: number | Date | null | undefined) =>
        fieldValue !== null && fieldValue !== undefined && fieldValue <= maxValue ? CoreValidationCodes.OK : CoreValidationCodes.MAX_VAL;

    static isInRange = (minValue: number | Date, maxValue: number | Date) => (fieldValue: number | Date | null | undefined) =>
        fieldValue !== null && fieldValue !== undefined && fieldValue <= maxValue && fieldValue >= minValue ? CoreValidationCodes.OK : CoreValidationCodes.IS_IN_RANGE;

    static isBetween = (minValue: number | Date, maxValue: number | Date) => (fieldValue: number | Date | null | undefined) =>
        fieldValue !== null && fieldValue !== undefined && fieldValue < maxValue && fieldValue > minValue ? CoreValidationCodes.OK : CoreValidationCodes.IS_BETWEEN;

    static maxLen = (maxLen: number) => (fieldValue: string | null | undefined) =>
        fieldValue !== null && fieldValue !== undefined && fieldValue.length <= maxLen ? CoreValidationCodes.OK : CoreValidationCodes.MAX_LEN;

    static minLen = (minLen: number) => (fieldValue: string | null | undefined) =>
        fieldValue !== null && fieldValue !== undefined && fieldValue.length >= minLen ? CoreValidationCodes.OK : CoreValidationCodes.MIN_LEN;

    static len = (Len: number) => (fieldValue: string | null | undefined) =>
        fieldValue !== null && fieldValue !== undefined && fieldValue.length == Len ? CoreValidationCodes.OK : CoreValidationCodes.LEN;

    static match = (regEx: RegExp) => (fieldValue: string | null | undefined) =>
        fieldValue !== null && fieldValue !== undefined && regEx.test(fieldValue) ? CoreValidationCodes.OK : CoreValidationCodes.MATCH;

    static isTrue = (fieldValue: boolean | null | undefined) =>
        fieldValue === true ? CoreValidationCodes.OK : CoreValidationCodes.IS_TRUE;

    static isFalse = (fieldValue: boolean | null | undefined) =>
        fieldValue === false ? CoreValidationCodes.OK : CoreValidationCodes.IS_FALSE;

    static and = <T>(...rules: ((fieldValue: T) => ValidationCode)[]) => (fieldValue: T) => {
        for (const rule of rules) {
            const result = rule(fieldValue);
            if (!result.equals(CoreValidationCodes.OK)) {
                return result;
            }
        }
        return CoreValidationCodes.OK;
    }

    static or = <T>(...rules: ((fieldValue: T) => ValidationCode)[]) => (fieldValue: T) => {
        let result = CoreValidationCodes.OK;
        for (const rule of rules) {
            const ruleResult = rule(fieldValue);
            if (ruleResult.equals(CoreValidationCodes.OK)) {
                return CoreValidationCodes.OK;
            } else if (result.equals(CoreValidationCodes.OK)) {
                result = ruleResult;
            }
        }
        return result;
    }

    static maxCount = (maxLen: number) => <T>(list: Array<T>) => 
        list.length <= maxLen ? CoreValidationCodes.OK : CoreValidationCodes.MAX_COUNT;

    static minCount = (minLen: number) => <T>(list: Array<T>) => 
        list.length >= minLen ? CoreValidationCodes.OK : CoreValidationCodes.MIN_COUNT;

    static count = (count: number) => <T>(list: Array<T>) => 
        list.length == count ? CoreValidationCodes.OK : CoreValidationCodes.COUNT;
}