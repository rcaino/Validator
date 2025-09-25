import Validations from "./Core/Validations";
import Verifiable from "./Core/Verifiable";

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
        this.addValidations("age", [required, minVal(29), isBetween(12, 15)])
        this.addValidations("email", [required, minLen(6), Validations["match"](/.+@.+\..+/)]);
        this.addValidations("salary", [required, minVal(10000)]);
        this.addValidations("isActive", [
            required,
            (value: User["isActive"]) => Validations.isTrue(value)
        ]);
    }
}

var pablo = new UserVerifiable(new User("pablo", 23, "pablo@example.com", 50000, true));
console.log(pablo, pablo.isValid());
pablo.set("age", 76);
console.log(pablo, pablo.isValid());
pablo.set("age", 13);
pablo.isValid("age");
pablo.isValid("name");
pablo.areValid(["email", "isActive"]);
