import { ValidationCode } from "./ValidationCode";

export interface ValidationRule<T, F extends keyof T> {
    field: F;
    evaluator: (model: T) => ValidationCode;
    isRequired: boolean;
}

export type ValidationResult<T> = {
    [P in keyof T]?: ValidationCode;
}

export type ValidationErrors<T, P extends keyof T> = { 
    id: T[P] | number, 
    errors: Array<ValidationCode> 
};