import { Validations, Verifiable } from '../src/Core';

const { required, minVal, isBetween, minLen } = Validations;

class User {
    constructor(name: string, age: number, email: string, salary: number, isActive: boolean) {
        this.name = name;
        this.age = age;
        this.email = email;
        this.salary = salary;
        this.isActive = isActive;
    }
    public name: string;
    public age: number;
    public email: string;
    public salary: number;
    public isActive: boolean;
}

class UserVerifiable extends Verifiable<User> {
    constructor(user: User, readonly = false) {
        super(user, readonly);
        this.addValidation("name", required)
        this.addValidations("age", [required, isBetween(12, 15)])
        this.addValidations("email", [required, minLen(6), Validations["match"](/.+@.+\..+/)]);
        this.addValidations("salary", [required, minVal(10000)]);
        this.addValidations("isActive", [
            required,
            (value: User["isActive"]) => Validations.isTrue(value)
        ]);
    }
}

describe('UserVerifiable', () => {
    let pablo: UserVerifiable;

    beforeEach(() => {
        pablo = new UserVerifiable(new User("pablo", 23, "pablo@example.com", 50000, true));
    });

    test('should initially be invalid due to age less than 29', () => {
        expect(pablo.isValid()).toBe(false);
    });

    test('should be invalid when age is set to 76 (outside 12-15 range)', () => {
        pablo.set("age", 76);
        expect(pablo.isValid()).toBe(false);
    });

    test('should validate age field correctly when in range', () => {
        pablo.set("age", 13);
        expect(pablo.isValid("age")).toBe(true);
    });

    test('should validate name field correctly', () => {
        expect(pablo.isValid("name")).toBe(true);
    });

    test('should validate multiple fields correctly', () => {
        const validationResult = pablo.areValid(["email", "isActive"]);
        expect(validationResult).toBe(true);
    });

    test('should validate email format', () => {
        pablo.set("email", "invalid-email");
        expect(pablo.isValid("email")).toBe(false);

        pablo.set("email", "valid@email.com");
        expect(pablo.isValid("email")).toBe(true);
    });

    test('should validate salary minimum value', () => {
        pablo.set("salary", 9000);
        expect(pablo.isValid("salary")).toBe(false);

        pablo.set("salary", 15000);
        expect(pablo.isValid("salary")).toBe(true);
    });

    test('should validate isActive as true', () => {
        pablo.set("isActive", false);
        expect(pablo.isValid("isActive")).toBe(false);

        pablo.set("isActive", true);
        expect(pablo.isValid("isActive")).toBe(true);
    });
});