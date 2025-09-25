import { ValidationCodes } from "./ValidationCodes";

export type Validator<T> = (value: T) => ValidationCodes;
export type ValidationErrors<T, P extends keyof T> = { id: T[P] | number, errors: Array<ValidationCodes> };

export default class Verifiable<T extends Object> {
    constructor(model: T = {} as T, readonly = true) {
        this.model = model;
        this.get = <K extends keyof T>(field: K) => this.model?.[field];
        this.set = <K extends keyof T>(field: K, value: T[K]) => {
            if (!readonly && this.model?.hasOwnProperty(field)) this.model[field] = value;
            return this;
        }
    }
    public get: <K extends keyof T>(field: K) => T[K];
    public set: <K extends keyof T>(field: K, value: T[K]) => Verifiable<T>;

    private model: T;
    private validations: Array<{ field: keyof T, evaluator: Validator<T> }> = [];
    protected addValidation = <F extends keyof T>(field: F, validator: Validator<T[F]>) => this.validations.push({ field, evaluator: this.validate(field, validator) });
    protected addValidations = <F extends keyof T>(field: F, validators: Validator<T[F]>[]) => { this.validations = [...this.validations, ...validators.map(validator => ({ field, evaluator: this.validate(field, validator) }))] };

    private validate = <F extends keyof T>(field: F, validator: Validator<T[F]>) => (model: T) => validator(model[field]);

    public isValid = (field?: keyof T) => {
        let review = field ? this.validations.filter(validator => validator.field === field) : this.validations;
        return review.every((validator) => validator.evaluator(this.model) === ValidationCodes.OK);
    }

    public areValid = (fields: (keyof T)[]) => {
        return fields.every(field => this.isValid(field));
    }
}