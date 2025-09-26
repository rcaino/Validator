import { ValidationCode, ValidationCodeFactory, CoreValidationCodes } from '../../src/Core/ValidationCode';

describe('ValidationCode', () => {
    test('should create code with namespace and code', () => {
        const code = new ValidationCode('test', 'error');
        expect(code.namespace).toBe('test');
        expect(code.code).toBe('error');
    });

    test('should convert to string with proper format', () => {
        const code = new ValidationCode('test', 'error');
        expect(code.toString()).toBe('test:error');
    });

    test('should create from string', () => {
        const code = ValidationCode.fromString('test:error');
        expect(code.namespace).toBe('test');
        expect(code.code).toBe('error');
    });

    test('should handle complex codes', () => {
        const code = ValidationCode.fromString('test:error:with:colons');
        expect(code.namespace).toBe('test');
        expect(code.code).toBe('error:with:colons');
    });

    test('should compare codes correctly', () => {
        const code1 = new ValidationCode('test', 'error');
        const code2 = new ValidationCode('test', 'error');
        const code3 = new ValidationCode('test', 'different');
        
        expect(code1.equals(code2)).toBe(true);
        expect(code1.equals(code3)).toBe(false);
    });
});

describe('ValidationCodeFactory', () => {
    test('should create codes with consistent namespace', () => {
        const factory = new ValidationCodeFactory('test');
        const code1 = factory.create('error1');
        const code2 = factory.create('error2');

        expect(code1.namespace).toBe('test');
        expect(code2.namespace).toBe('test');
        expect(code1.code).toBe('error1');
        expect(code2.code).toBe('error2');
    });
});

describe('CoreValidationCodes', () => {
    test('should provide all core validation codes', () => {
        expect(CoreValidationCodes.OK.toString()).toBe('core:ok');
        expect(CoreValidationCodes.HAS_VALUE.toString()).toBe('core:hasValue');
        expect(CoreValidationCodes.MIN_VAL.toString()).toBe('core:minVal');
        // ... more assertions for other codes
    });

    test('all codes should be in core namespace', () => {
        const codes = Object.values(CoreValidationCodes)
            .filter(value => value instanceof ValidationCode);
        
        codes.forEach(code => {
            expect(code.namespace).toBe('core');
        });
    });
});