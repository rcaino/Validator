# TypeScript Validator

A flexible and robust validation library for TypeScript that follows SOLID principles and provides a clean, type-safe API for object validation.

## Features

- Type-safe validation rules
- Support for required/optional fields
- Composable validation rules
- Lazy evaluation (stops at first error per field)
- Detailed validation results
- Easy to extend

## Installation

```bash
npm install @rcaino/validator
```

## Basic Usage

```typescript
import { Verifiable, Validations, ValidationCode, ValidationCodeFactory, CoreValidationCodes } from '@rcaino/validator';

// Define your model type
interface Payment {
    amount: number;
    currency: string;
    description?: string;
    discountCode?: string;
    discountPercent?: number;
}

// Create custom validation codes (optional)
class PaymentValidationCodes {
    private static factory = new ValidationCodeFactory('payment');
    
    static readonly INSUFFICIENT_AMOUNT = PaymentValidationCodes.factory.create('insufficient:amount');
    static readonly INVALID_CURRENCY = PaymentValidationCodes.factory.create('invalid:currency');
    static readonly INVALID_DISCOUNT = PaymentValidationCodes.factory.create('invalid:discount');
}

// Create a validator class for your model
class PaymentValidator extends Verifiable<Payment> {
    constructor(payment: Payment) {
        super(payment);
        
        // Add validations for each field
        this.addValidation('amount', Validations.minVal(0), true); // amount is required
        this.addValidation('currency', Validations.match(/^[A-Z]{3}$/), true); // currency is required
        
        // Optional field with multiple validations
        this.addValidations('description', [
            Validations.minLen(10),
            Validations.maxLen(500)
        ]);

        // Conditional validation
        this.addValidation('discountPercent', 
            Validations.and(
                // Only validate if discountCode exists
                value => this.get('discountCode') 
                    ? Validations.isInRange(0, 100)(value)
                    : CoreValidationCodes.OK
            )
        );
    }
}

// Use the validator
const payment = new PaymentValidator({
    amount: -100,
    currency: 'INVALID',
    description: 'too short',
    discountCode: 'SUMMER',
    discountPercent: 150
});

// Check if all validations pass
if (!payment.isValid()) {
    // Get detailed validation errors
    const errors = payment.verify();
    console.log(errors);
    // Output:
    // {
    //     amount: CoreValidationCodes.MIN_VAL,
    //     currency: CoreValidationCodes.MATCH,
    //     description: CoreValidationCodes.MIN_LEN,
    //     discountPercent: CoreValidationCodes.IS_IN_RANGE
    // }
}

// Validate specific fields
const amountValid = payment.isValid('amount'); // false
const currencyAndAmountValid = payment.areValid(['amount', 'currency']); // false

// Get errors for specific fields
const discountErrors = payment.verify(['discountCode', 'discountPercent']);
// Output: { discountPercent: CoreValidationCodes.IS_IN_RANGE }
```

## Available Validations

### Primitive Values
- `hasValue`: Validates that a primitive value is not null/undefined/empty
- `minVal`: Validates minimum value (numbers/dates)
- `maxVal`: Validates maximum value (numbers/dates)
- `isInRange`: Validates value is within range (inclusive)
- `isBetween`: Validates value is between range (exclusive)

### String Validations
- `minLen`: Validates minimum string length
- `maxLen`: Validates maximum string length
- `len`: Validates exact string length
- `match`: Validates string matches regex pattern

### Boolean Validations
- `isTrue`: Validates value is true
- `isFalse`: Validates value is false

### Collection Validations
- `isNotEmpty`: Validates array/object is not empty
- `minCount`: Validates minimum array length
- `maxCount`: Validates maximum array length
- `count`: Validates exact array length

### Composite Validations
- `and`: Combines multiple validations (all must pass)
- `or`: Combines multiple validations (at least one must pass)

## Creating Custom Validations

You can create your own validation codes and validation rules for your domain:

```typescript
// Define custom validation codes
class BusinessValidationCodes {
    private static factory = new ValidationCodeFactory('business');

    static readonly INSUFFICIENT_FUNDS = BusinessValidationCodes.factory.create('insufficient:funds');
    static readonly EXCEEDS_DAILY_LIMIT = BusinessValidationCodes.factory.create('exceeds:daily:limit');
    static readonly INVALID_CURRENCY = BusinessValidationCodes.factory.create('invalid:currency');
}

// Create custom validation rules
class CustomValidations extends Validations {
    static isEven = (value: number) => 
        value % 2 === 0 ? CoreValidationCodes.OK : BusinessValidationCodes.INSUFFICIENT_FUNDS;

    static isPositive = (value: number) =>
        value > 0 ? CoreValidationCodes.OK : BusinessValidationCodes.INSUFFICIENT_FUNDS;
}

class MyValidator extends Verifiable<MyModel> {
    constructor(model: MyModel) {
        super(model);
        this.addValidation('number', 
            Validations.and(
                CustomValidations.isEven,
                CustomValidations.isPositive
            )
        );
    }
}
```

## Validation Codes

The library uses a flexible system of validation codes organized in namespaces. Each code consists of a namespace and a code identifier. The core validation codes are provided in the `CoreValidationCodes` class:

```typescript
class CoreValidationCodes {
    static readonly OK = ValidationCodeFactory.core.create('ok');
    static readonly HAS_VALUE = ValidationCodeFactory.core.create('hasValue');
    static readonly MIN_VAL = ValidationCodeFactory.core.create('minVal');
    static readonly MAX_VAL = ValidationCodeFactory.core.create('maxVal');
    static readonly IS_IN_RANGE = ValidationCodeFactory.core.create('isInRange');
    static readonly IS_BETWEEN = ValidationCodeFactory.core.create('isBetween');
    static readonly MAX_LEN = ValidationCodeFactory.core.create('maxLen');
    static readonly MIN_LEN = ValidationCodeFactory.core.create('minLen');
    static readonly LEN = ValidationCodeFactory.core.create('len');
    static readonly MATCH = ValidationCodeFactory.core.create('match');
    static readonly IS_TRUE = ValidationCodeFactory.core.create('isTrue');
    static readonly IS_FALSE = ValidationCodeFactory.core.create('isFalse');
    static readonly MAX_COUNT = ValidationCodeFactory.core.create('maxCount');
    static readonly MIN_COUNT = ValidationCodeFactory.core.create('minCount');
    static readonly COUNT = ValidationCodeFactory.core.create('count');
}
```

You can create your own validation codes in custom namespaces using the `ValidationCodeFactory` class:

```typescript
class SecurityValidationCodes {
    private static factory = new ValidationCodeFactory('security');

    static readonly REQUIRES_2FA = SecurityValidationCodes.factory.create('requires:2fa');
    static readonly BLACKLISTED_IP = SecurityValidationCodes.factory.create('blacklisted:ip');
    static readonly SUSPICIOUS_ACTIVITY = SecurityValidationCodes.factory.create('suspicious:activity');
}
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT