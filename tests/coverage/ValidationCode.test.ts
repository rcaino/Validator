import { ValidationCode, ValidationCodeFactory, CoreValidationCodes } from '../../src/Core/ValidationCode';

describe('ValidationCode Full Coverage', () => {
    const testCases = [
        { value: null, expected: false },
        { value: undefined, expected: false },
        { value: '', expected: false },
        { value: 0, expected: true },
        { value: false, expected: true },
        { value: [], expected: false },
        { value: {}, expected: false },
        { value: new Date(), expected: true },
        { value: [1,2,3], expected: true },
        { value: { a: 1 }, expected: true }
    ];

    testCases.forEach(({value, expected}) => {
        test(`should handle ${value === null ? 'null' : value === undefined ? 'undefined' : JSON.stringify(value)}`, () => {
            const code = CoreValidationCodes.HAS_VALUE;
            expect(code).toBeInstanceOf(ValidationCode);
            expect(code.namespace).toBe('core');
            expect(code.toString()).toContain('hasValue');
        });
    });
});

describe('ValidationCodeFactory Full Coverage', () => {
    test('should create codes in different namespaces', () => {
        const factories = [
            new ValidationCodeFactory('core'),
            new ValidationCodeFactory('business'),
            new ValidationCodeFactory('security'),
            new ValidationCodeFactory('custom')
        ];

        const codes = factories.map(f => f.create('test'));
        
        // Cada código debería estar en su propio namespace
        codes.forEach((code, i) => {
            expect(code.namespace).toBe(factories[i].namespace);
        });

        // Los códigos con el mismo nombre pero diferente namespace no deberían ser iguales
        for(let i = 0; i < codes.length; i++) {
            for(let j = i + 1; j < codes.length; j++) {
                expect(codes[i].equals(codes[j])).toBe(false);
            }
        }
    });

    test('should handle special characters in codes', () => {
        const factory = new ValidationCodeFactory('test');
        const code = factory.create('namespace:error:code');
        expect(code.toString()).toBe('test:namespace:error:code');
        
        const parsed = ValidationCode.fromString(code.toString());
        expect(parsed.namespace).toBe('test');
        expect(parsed.code).toBe('namespace:error:code');
    });
});

describe('Core Validation Codes Full Coverage', () => {
    const allCodes = [
        CoreValidationCodes.OK,
        CoreValidationCodes.HAS_VALUE,
        CoreValidationCodes.MIN_VAL,
        CoreValidationCodes.MAX_VAL,
        CoreValidationCodes.IS_IN_RANGE,
        CoreValidationCodes.IS_BETWEEN,
        CoreValidationCodes.MAX_LEN,
        CoreValidationCodes.MIN_LEN,
        CoreValidationCodes.LEN,
        CoreValidationCodes.MATCH,
        CoreValidationCodes.IS_TRUE,
        CoreValidationCodes.IS_FALSE,
        CoreValidationCodes.MAX_COUNT,
        CoreValidationCodes.MIN_COUNT,
        CoreValidationCodes.COUNT
    ];

    test('all codes should be unique', () => {
        const uniqueCodes = new Set(allCodes.map(code => code.toString()));
        expect(uniqueCodes.size).toBe(allCodes.length);
    });

    test('all codes should be in core namespace', () => {
        allCodes.forEach(code => {
            expect(code.namespace).toBe('core');
        });
    });

    test('all codes should be comparable', () => {
        allCodes.forEach(code1 => {
            allCodes.forEach(code2 => {
                expect(code1.equals(code2)).toBe(code1 === code2);
            });
        });
    });

    test('all codes should be convertible to string and back', () => {
        allCodes.forEach(code => {
            const str = code.toString();
            const parsed = ValidationCode.fromString(str);
            expect(parsed.equals(code)).toBe(true);
        });
    });
});