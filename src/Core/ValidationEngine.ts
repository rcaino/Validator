import { ValidationCode, CoreValidationCodes } from "./ValidationCode";
import { ValidationRule, ValidationResult } from "./types";

export class ValidationEngine<T extends object> {
    private rules: ValidationRule<T, keyof T>[] = [];

    addRule<F extends keyof T>(rule: ValidationRule<T, F>) {
        this.rules.push(rule);
    }

    addRules<F extends keyof T>(rules: ValidationRule<T, F>[]) {
        this.rules.push(...rules);
    }

    private isValueEmpty(value: any): boolean {
        return value === null || 
            value === undefined || 
            value === '' || 
            (Array.isArray(value) && value.length === 0) ||
            (value instanceof Date && value.toString() === new Date().toString()) ||
            (typeof value === 'object' && value !== null && Object.keys(value).length === 0);
    }

    validate(model: T, fields?: keyof T | (keyof T)[]): ValidationResult<T> {
        // Determinar qué campos vamos a validar
        let fieldsToValidate: (keyof T)[];
        if (fields === undefined) {
            // Si no se especifican campos, validamos todos los que tienen validaciones
            fieldsToValidate = [...new Set(this.rules.map(v => v.field))];
        } else if (Array.isArray(fields)) {
            fieldsToValidate = fields;
        } else {
            fieldsToValidate = [fields];
        }

        // Validar cada campo y recolectar los errores
        const errors: ValidationResult<T> = {};
        for (const field of fieldsToValidate) {
            const rules = this.rules.filter(v => v.field === field);
            for (const rule of rules) {
                const value = model[rule.field];
                
                // Si el valor está vacío...
                if (this.isValueEmpty(value)) {
                    // Si es requerido, registramos el error
                    if (rule.isRequired) {
                        errors[field] = CoreValidationCodes.HAS_VALUE;
                        break; // No seguimos validando este campo
                    }
                    // Si no es requerido, continuamos con el siguiente campo
                    continue;
                }

                // Si tiene valor, evaluamos la validación
                const validationResult = rule.evaluator(model);
                if (!validationResult.equals(CoreValidationCodes.OK)) {
                    errors[field] = validationResult;
                    break; // No seguimos validando este campo
                }
            }
        }

        return errors;
    }

    isValid(model: T, field?: keyof T): boolean {
        const errors = this.validate(model, field);
        return Object.keys(errors).length === 0;
    }

    areValid(model: T, fields: (keyof T)[]): boolean {
        const errors = this.validate(model, fields);
        return fields.every(field => !errors[field]);
    }
}