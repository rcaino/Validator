import { ValidationCode, CoreValidationCodes } from '../src/Core/ValidationCode';
import Validations from '../src/Core/Validations';
import Verifiable from '../src/Core/Verifiable';

class PaymentTransaction {
    constructor(
        public amount: number,
        public cardNumber: string,
        public cvv: string,
        public couponCode?: string
    ) {}
}

class PaymentTransactionVerifiable extends Verifiable<PaymentTransaction> {
    constructor(payment: PaymentTransaction, readonly = false) {
        super(payment, readonly);

        // Amount validation: required and must be greater than 0.01
        this.addValidation("amount", Validations.minVal(0.01), true);

        // Card number validation: required and must be Visa (4...) or Mastercard (5...)
        this.addValidation("cardNumber", Validations.match(/^[45]\d{15}$/), true); // 16 digits starting with 4 or 5

        // CVV validation: required but no additional validations
        this.addValidation("cvv", (value) => CoreValidationCodes.OK, true);

        // Coupon code validation: optional but if present must be at least 8 chars
        this.addValidation("couponCode", Validations.minLen(8));
    }
}

describe('New verify method', () => {
    test('should return all validation errors', () => {
        const payment = new PaymentTransaction(
            0,
            '6111111111111111',
            undefined as any,
            'SHORT'
        );
        const validator = new PaymentTransactionVerifiable(payment);
        
        const errors = validator.verify();
        expect(errors).toEqual({
            amount: CoreValidationCodes.MIN_VAL,
            cardNumber: CoreValidationCodes.MATCH,
            cvv: CoreValidationCodes.HAS_VALUE,
            couponCode: CoreValidationCodes.MIN_LEN
        });
    });

    test('should return errors only for specified fields', () => {
        const payment = new PaymentTransaction(
            0,
            '6111111111111111',
            '123',
            'SHORT'
        );
        const validator = new PaymentTransactionVerifiable(payment);
        
        const errors = validator.verify(['amount', 'couponCode']);
        expect(errors).toEqual({
            amount: CoreValidationCodes.MIN_VAL,
            couponCode: CoreValidationCodes.MIN_LEN
        });
        expect(Object.keys(errors)).not.toContain('cardNumber');
    });

    test('should return empty object when all validations pass', () => {
        const payment = new PaymentTransaction(
            100.50,
            '4111111111111111',
            '123',
            'VALIDCOUPON'
        );
        const validator = new PaymentTransactionVerifiable(payment);
        
        const errors = validator.verify();
        expect(errors).toEqual({});
    });

    test('should return errors for array of fields', () => {
        const payment = new PaymentTransaction(
            0,
            '6111111111111111',
            '123'
        );
        const validator = new PaymentTransactionVerifiable(payment);
        
        const errors = validator.verify(['amount', 'cardNumber']);
        expect(errors).toEqual({
            amount: CoreValidationCodes.MIN_VAL,
            cardNumber: CoreValidationCodes.MATCH
        });
    });

    test('should validate empty arrays and objects correctly', () => {
        const payment = new PaymentTransaction(
            100,
            '4111111111111111',
            '123',
            ''
        );
        const validator = new PaymentTransactionVerifiable(payment);
        
        const errors = validator.verify(['couponCode']);
        expect(errors).toEqual({});  // couponCode es opcional
    });
});

describe('PaymentTransactionVerifiable', () => {
    test('should validate a valid Visa transaction without coupon', () => {
        const payment = new PaymentTransaction(
            100.50,
            '4111111111111111',
            '123'
        );
        const validator = new PaymentTransactionVerifiable(payment);
        
        expect(validator.isValid()).toBe(true);
        expect(validator.isValid("amount")).toBe(true);
        expect(validator.isValid("cardNumber")).toBe(true);
        expect(validator.isValid("cvv")).toBe(true);
        expect(validator.isValid("couponCode")).toBe(true); // Optional field should pass
    });

    test('should validate a valid Mastercard transaction with valid coupon', () => {
        const payment = new PaymentTransaction(
            50.00,
            '5111111111111111',
            '456',
            'VALIDCOUPON123'
        );
        const validator = new PaymentTransactionVerifiable(payment);
        
        expect(validator.isValid()).toBe(true);
    });

    test('should fail validation with invalid coupon length', () => {
        const payment = new PaymentTransaction(
            75.25,
            '4111111111111111',
            '789',
            'ABC' // Too short
        );
        const validator = new PaymentTransactionVerifiable(payment);
        
        expect(validator.isValid()).toBe(false);
        expect(validator.isValid("couponCode")).toBe(false);
    });

    test('should validate when coupon is null or undefined', () => {
        const paymentNull = new PaymentTransaction(
            200.00,
            '5111111111111111',
            '321',
            null as any
        );
        const validatorNull = new PaymentTransactionVerifiable(paymentNull);
        expect(validatorNull.isValid()).toBe(true);
        expect(validatorNull.isValid("couponCode")).toBe(true);

        const paymentUndefined = new PaymentTransaction(
            200.00,
            '5111111111111111',
            '321'
        );
        const validatorUndefined = new PaymentTransactionVerifiable(paymentUndefined);
        expect(validatorUndefined.isValid()).toBe(true);
        expect(validatorUndefined.isValid("couponCode")).toBe(true);
    });

    test('should fail validation with invalid amount', () => {
        const payment = new PaymentTransaction(
            0,
            '4111111111111111',
            '123'
        );
        const validator = new PaymentTransactionVerifiable(payment);
        
        expect(validator.isValid()).toBe(false);
        expect(validator.isValid("amount")).toBe(false);
    });

    test('should fail validation with invalid card number', () => {
        const payment = new PaymentTransaction(
            100.00,
            '6111111111111111', // Starts with 6, not 4 or 5
            '123'
        );
        const validator = new PaymentTransactionVerifiable(payment);
        
        expect(validator.isValid()).toBe(false);
        expect(validator.isValid("cardNumber")).toBe(false);
    });

    test('should fail when required amount is missing', () => {
        const payment = new PaymentTransaction(
            null as any,
            '4111111111111111',
            '123'
        );
        const validator = new PaymentTransactionVerifiable(payment);
        
        expect(validator.isValid()).toBe(false);
        expect(validator.isValid("amount")).toBe(false);
        // Other required fields should still be valid
        expect(validator.isValid("cardNumber")).toBe(true);
        expect(validator.isValid("cvv")).toBe(true);
    });

    test('should fail when required cvv is missing', () => {
        const payment = new PaymentTransaction(
            100.00,
            '4111111111111111',
            undefined as any
        );
        const validator = new PaymentTransactionVerifiable(payment);
        
        expect(validator.isValid()).toBe(false);
        expect(validator.isValid("cvv")).toBe(false);
        // Other required fields should still be valid
        expect(validator.isValid("amount")).toBe(true);
        expect(validator.isValid("cardNumber")).toBe(true);
    });

    test('should fail when required cardNumber is empty string', () => {
        const payment = new PaymentTransaction(
            100.00,
            '',
            '123'
        );
        const validator = new PaymentTransactionVerifiable(payment);
        
        expect(validator.isValid()).toBe(false);
        expect(validator.isValid("cardNumber")).toBe(false);
        // Other required fields should still be valid
        expect(validator.isValid("amount")).toBe(true);
        expect(validator.isValid("cvv")).toBe(true);
    });

    test('should fail when multiple required fields are missing', () => {
        const payment = new PaymentTransaction(
            null as any,         // Missing amount
            '',                  // Empty cardNumber
            undefined as any     // Missing cvv
        );
        const validator = new PaymentTransactionVerifiable(payment);
        
        expect(validator.isValid()).toBe(false);
        // Check individual fields
        expect(validator.isValid("amount")).toBe(false);
        expect(validator.isValid("cardNumber")).toBe(false);
        expect(validator.isValid("cvv")).toBe(false);
        // Check multiple fields at once
        expect(validator.areValid(["amount", "cardNumber"])).toBe(false);
        expect(validator.areValid(["cardNumber", "cvv"])).toBe(false);
        expect(validator.areValid(["amount", "cvv"])).toBe(false);
    });

    test('should validate required fields with different empty value types', () => {
        const testCases = [
            { field: 'amount', value: undefined },
            { field: 'amount', value: null },
            { field: 'cardNumber', value: undefined },
            { field: 'cardNumber', value: null },
            { field: 'cardNumber', value: '' },
            { field: 'cvv', value: undefined },
            { field: 'cvv', value: null },
            { field: 'cvv', value: '' }
        ];

        testCases.forEach(({ field, value }) => {
            const payment = new PaymentTransaction(
                field === 'amount' ? value as any : 100.00,
                field === 'cardNumber' ? value as any : '4111111111111111',
                field === 'cvv' ? value as any : '123'
            );
            const validator = new PaymentTransactionVerifiable(payment);
            
            expect(validator.isValid(field as keyof PaymentTransaction)).toBe(false);
            expect(validator.isValid()).toBe(false);
        });
    });
});