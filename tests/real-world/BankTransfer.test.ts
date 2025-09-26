import { ValidationCode, ValidationCodeFactory, CoreValidationCodes } from '../../src/Core/ValidationCode';
import { Validations, Verifiable } from '../../src/Core';

// Códigos de validación personalizados para reglas de negocio
export class BusinessValidationCodes {
    private static factory = new ValidationCodeFactory('business');

    static readonly INSUFFICIENT_FUNDS = BusinessValidationCodes.factory.create('insufficientFunds');
    static readonly INVALID_CURRENCY = BusinessValidationCodes.factory.create('invalidCurrency');
    static readonly EXCEEDS_DAILY_LIMIT = BusinessValidationCodes.factory.create('exceedsDailyLimit');
    static readonly INVALID_ACCOUNT = BusinessValidationCodes.factory.create('invalidAccount');
}

// Códigos de validación personalizados para seguridad
export class SecurityValidationCodes {
    private static factory = new ValidationCodeFactory('security');

    static readonly BLACKLISTED_IP = SecurityValidationCodes.factory.create('blacklistedIp');
    static readonly SUSPICIOUS_ACTIVITY = SecurityValidationCodes.factory.create('suspiciousActivity');
    static readonly REQUIRES_2FA = SecurityValidationCodes.factory.create('requires2FA');
}

// Modelo de dominio
interface BankTransfer {
    sourceAccount: string;
    destinationAccount: string;
    amount: number;
    currency: string;
    ipAddress: string;
    requires2FA: boolean;
}

// Validador personalizado que usa múltiples conjuntos de códigos
class BankTransferValidator extends Verifiable<BankTransfer> {
    private accountBalance = 1000; // Simulado
    private dailyTransferLimit = 5000; // Simulado
    private dailyTransferTotal = 0; // Simulado
    private blacklistedIps = ['1.1.1.1']; // Simulado

    constructor(transfer: BankTransfer) {
        super(transfer);

        // Validaciones core
        this.addValidation('sourceAccount', Validations.match(/^\d{10}$/), true);
        this.addValidation('destinationAccount', Validations.match(/^\d{10}$/), true);
        this.addValidation('amount', Validations.minVal(0.01), true);
        this.addValidation('currency', Validations.match(/^[A-Z]{3}$/), true);
        this.addValidation('ipAddress', Validations.match(/^\d+\.\d+\.\d+\.\d+$/), true);

        // Validaciones de negocio personalizadas
        this.addValidation('amount',
            (value) => (this.dailyTransferTotal + value) <= this.dailyTransferLimit
                ? CoreValidationCodes.OK
                : BusinessValidationCodes.EXCEEDS_DAILY_LIMIT
        );

        this.addValidation('amount', 
            (value) => value <= this.accountBalance 
                ? CoreValidationCodes.OK 
                : BusinessValidationCodes.INSUFFICIENT_FUNDS
        );

        this.addValidation('currency',
            (value) => ['USD', 'EUR', 'GBP'].includes(value)
                ? CoreValidationCodes.OK
                : BusinessValidationCodes.INVALID_CURRENCY
        );

        // Validaciones de seguridad personalizadas
        this.addValidation('ipAddress',
            (value) => !this.blacklistedIps.includes(value)
                ? CoreValidationCodes.OK
                : SecurityValidationCodes.BLACKLISTED_IP
        );

        this.addValidation('requires2FA',
            (value) => value || this.get('amount')! <= 1000
                ? CoreValidationCodes.OK
                : SecurityValidationCodes.REQUIRES_2FA
        );
    }
}

describe('Bank Transfer Validation with Custom Codes', () => {
    test('should validate successful transfer', () => {
        const transfer: BankTransfer = {
            sourceAccount: '1234567890',
            destinationAccount: '0987654321',
            amount: 100,
            currency: 'USD',
            ipAddress: '192.168.1.1',
            requires2FA: false
        };

        const validator = new BankTransferValidator(transfer);
        const errors = validator.verify();
        expect(errors).toEqual({});
    });

    test('should detect multiple validation issues', () => {
        const transfer: BankTransfer = {
            sourceAccount: '123', // Invalid format
            destinationAccount: '456', // Invalid format
            amount: 10000, // Exceeds limits
            currency: 'XXX', // Invalid currency
            ipAddress: '1.1.1.1', // Blacklisted
            requires2FA: false // Required for high amount
        };

        const validator = new BankTransferValidator(transfer);
        const errors = validator.verify();

        expect(errors).toEqual({
            sourceAccount: CoreValidationCodes.MATCH,
            destinationAccount: CoreValidationCodes.MATCH,
            amount: BusinessValidationCodes.EXCEEDS_DAILY_LIMIT,
            currency: BusinessValidationCodes.INVALID_CURRENCY,
            ipAddress: SecurityValidationCodes.BLACKLISTED_IP,
            requires2FA: SecurityValidationCodes.REQUIRES_2FA
        });
    });

    test('should handle security validations', () => {
        const transfer: BankTransfer = {
            sourceAccount: '1234567890',
            destinationAccount: '0987654321',
            amount: 2000, // High amount (will also exceed available funds)
            currency: 'USD',
            ipAddress: '192.168.1.1',
            requires2FA: false // Missing 2FA for high amount
        };

        const validator = new BankTransferValidator(transfer);
        const errors = validator.verify();

        expect(errors).toHaveProperty('requires2FA', SecurityValidationCodes.REQUIRES_2FA);
        expect(errors).toHaveProperty('amount', BusinessValidationCodes.INSUFFICIENT_FUNDS);
    });

    test('should handle business validations', () => {
        const transfer: BankTransfer = {
            sourceAccount: '1234567890',
            destinationAccount: '0987654321',
            amount: 900,
            currency: 'BTC', // Invalid currency
            ipAddress: '192.168.1.1',
            requires2FA: false
        };

        const validator = new BankTransferValidator(transfer);
        const errors = validator.verify();

        expect(errors).toEqual({
            currency: BusinessValidationCodes.INVALID_CURRENCY
        });
    });
});