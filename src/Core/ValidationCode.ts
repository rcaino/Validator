/**
 * Representa un código de validación con su namespace y nombre
 */
export class ValidationCode {
    constructor(
        public readonly namespace: string,
        public readonly code: string
    ) {}

    toString(): string {
        return `${this.namespace}:${this.code}`;
    }

    equals(other: ValidationCode): boolean {
        return this.namespace === other.namespace && this.code === other.code;
    }

    static fromString(code: string): ValidationCode {
        const parts = code.split(':');
        if (parts.length < 2) {
            throw new Error('Invalid validation code format: ' + code);
        }
        // En tests/coverage esperamos que el namespace pueda contener ':' y el código también
        // En tests/unit esperamos que el namespace sea la primera parte y el resto sea el código
        const namespace = parts[0];
        const value = parts.slice(1).join(':');
        return new ValidationCode(namespace, value);
    }
}

/**
 * Factory para crear códigos de validación en un namespace específico
 */
export class ValidationCodeFactory {
    constructor(public readonly namespace: string) {}

    create(code: string): ValidationCode {
        return new ValidationCode(this.namespace, code);
    }
}

/**
 * Códigos de validación base del sistema
 */
export class CoreValidationCodes {
    private static factory = new ValidationCodeFactory('core');

    static readonly OK = CoreValidationCodes.factory.create('ok');
    static readonly HAS_VALUE = CoreValidationCodes.factory.create('hasValue');
    static readonly MIN_VAL = CoreValidationCodes.factory.create('minVal');
    static readonly MAX_VAL = CoreValidationCodes.factory.create('maxVal');
    static readonly IS_IN_RANGE = CoreValidationCodes.factory.create('isInRange');
    static readonly IS_BETWEEN = CoreValidationCodes.factory.create('isBetween');
    static readonly MAX_LEN = CoreValidationCodes.factory.create('maxLen');
    static readonly MIN_LEN = CoreValidationCodes.factory.create('minLen');
    static readonly LEN = CoreValidationCodes.factory.create('len');
    static readonly MATCH = CoreValidationCodes.factory.create('match');
    static readonly IS_TRUE = CoreValidationCodes.factory.create('isTrue');
    static readonly IS_FALSE = CoreValidationCodes.factory.create('isFalse');
    static readonly MAX_COUNT = CoreValidationCodes.factory.create('maxCount');
    static readonly MIN_COUNT = CoreValidationCodes.factory.create('minCount');
    static readonly COUNT = CoreValidationCodes.factory.create('count');
}

// Re-exportamos el tipo original para compatibilidad
export type ValidationCodes = ValidationCode;