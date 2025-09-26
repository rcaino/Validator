import { ValidationCode } from "./ValidationCode";
import { ValidationRule, ValidationResult, ValidationErrors } from "./types";
import { ValidationEngine } from "./ValidationEngine";

export default class Verifiable<T extends object> {
    private model: T;
    private readonly engine: ValidationEngine<T>;

    constructor(model: T = {} as T, readonly = true) {
        this.model = model;
        this.engine = new ValidationEngine<T>();
        this.get = <K extends keyof T>(field: K) => this.model?.[field];
        this.set = <K extends keyof T>(field: K, value: T[K] | null | undefined) => {
            if (!readonly && this.model?.hasOwnProperty(field)) this.model[field] = value as T[K];
            return this;
        }
    }

    public get: <K extends keyof T>(field: K) => T[K] | undefined;
    public set: <K extends keyof T>(field: K, value: T[K] | null | undefined) => Verifiable<T>;

    protected addValidation = <F extends keyof T>(
        field: F, 
        validator: (value: T[F]) => ValidationCode,
        isRequired: boolean = false
    ) => {
        const rule: ValidationRule<T, F> = {
            field,
            evaluator: (model: T) => validator(model[field]),
            isRequired
        };
        this.engine.addRule(rule);
    }

    protected addValidations = <F extends keyof T>(
        field: F, 
        validators: ((value: T[F]) => ValidationCode)[],
        isRequired: boolean = false
    ) => {
        const rules = validators.map(validator => ({
            field,
            evaluator: (model: T) => validator(model[field]),
            isRequired
        }));
        this.engine.addRules(rules);
    }

    public isValid = (field?: keyof T) => {
        return this.engine.isValid(this.model, field);
    }

    public areValid = (fields: (keyof T)[]) => {
        return this.engine.areValid(this.model, fields);
    }

    public verify = (fields?: keyof T | (keyof T)[]): ValidationResult<T> => {
        return this.engine.validate(this.model, fields);
    }
}