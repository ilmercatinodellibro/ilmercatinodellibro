// Next rules are thought for q-select and q-input rule field.
// IMPORTANT: Every rule should consider a possible "null" type since default cleared q-select returns that.

import { ValidationRule } from "quasar";
import { MaybeRefOrGetter, toValue } from "vue";
import { useI18nOutsideSetup } from "src/boot/i18n";

const { t } = useI18nOutsideSetup();

export const emailRule: ValidationRule<string | null> = (value, rules) =>
  (value !== null && rules.email(value)) || t("validators.nonValidEmail");

export const requiredRule: ValidationRule<
  string | number | object | null | undefined
> = (value) =>
  // Using an IIFE to avoid calling t() whenever return is false
  (() => {
    if (value === undefined || value === null) {
      return false;
    }

    if (typeof value === "number") {
      return !Number.isNaN(value);
    }

    if (typeof value === "string") {
      return value.length > 0;
    }

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return Object.keys(value).length > 0;
  })() || t("validators.requiredField");

export const createMinLengthRule =
  (minLength: number): ValidationRule<string | unknown[] | null> =>
  (value) =>
    (value !== null && value.length >= minLength) ||
    t("validators.minLength", { minLength });

export const createMaxLengthRule =
  (maxLength: number): ValidationRule<string | unknown[] | null> =>
  (value) =>
    (value !== null && value.length <= maxLength) ||
    t("validators.maxLength", { maxLength });

export const createBetweenLengthRule =
  (minLength: number, maxLength: number): ValidationRule<string | null> =>
  (value) =>
    (value !== null &&
      value.length >= minLength &&
      value.length <= maxLength) ||
    t("validators.betweenLength", { minLength, maxLength });

export const makeValueMatchRule =
  (
    valueToBeMatched: MaybeRefOrGetter<string | number | null>,
    errorMessage: MaybeRefOrGetter<string>,
  ): ValidationRule<string | number | null> =>
  (value) =>
    value === toValue(valueToBeMatched) || toValue(errorMessage);

const VALID_IP_ADDRESS_REG_EXP =
  /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const PRIVATE_IP_ADDRESS_REG_EXP =
  /(^127\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)$/;
export const ipAddressRule: ValidationRule<string | null> = (value) =>
  (value !== null &&
    VALID_IP_ADDRESS_REG_EXP.test(value) &&
    !PRIVATE_IP_ADDRESS_REG_EXP.test(value)) ||
  t("validators.wrongIpFormat");

// Notice we added the ? in the array since adding it here will not work
const SPECIAL_CHARACTERS = ["_", ".", ",", "-", "+", "*", "!", "#", "@", "\\"];

const SPECIAL_CHARACTERS_PATTERN = new RegExp(
  `^(?=.*[${SPECIAL_CHARACTERS.toString()}?])`,
);

export const validatePasswordRule: ValidationRule<string | null> = (
  password,
  rules,
) => {
  // We need to place the if outside otherwise ts can' properly understand the type
  if (password === null) {
    return requiredRule(password, rules);
  }

  switch (true) {
    // Between 8 and 25 characters
    case password.length < 8 || password.length > 25:
      return t("validators.password.atLeast8AndMaximum25Characters");

    // At least a number
    case !/^(?=.*\d)/.test(password):
      return t("validators.password.atLeastOneNumber");

    // At least a lower case
    case !/^(?=.*[a-z])/.test(password):
      return t("validators.password.atLeastOneLowercase");

    // At least a upper case
    case !/^(?=.*[A-Z])/.test(password):
      return t("validators.password.atLeastOneUppercase");

    // At least a special character
    case !SPECIAL_CHARACTERS_PATTERN.test(password):
      return `${t(
        "validators.password.atLeastOneSpecialCharacter",
      )}: (${SPECIAL_CHARACTERS.toString()},?)`;

    default:
      return true;
  }
};

export const greaterThanZeroRule: ValidationRule<number | string | null> = (
  value,
  rules,
) => {
  if (value === null) {
    return requiredRule(value, rules);
  }

  const numericValue = typeof value === "string" ? parseInt(value) : value;
  return (
    (!isNaN(numericValue) && numericValue > 0) ||
    t("validators.greaterThanZero")
  );
};

// ---------- ---------- ----------
// Next fields are not imported in other files but we need to leave these so in the future we can abstract these in a package

export const emailDomainRule = (domain: string, email: string) =>
  new RegExp(`^(.*?)${domain}$`).test(email);

export const domainRule = (value: string) =>
  /^(?!www\.)(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/.test(
    value,
  ) || "Il dominio inserito non è valido";

export const subdomainRule = (domain: string, subdomain: string) =>
  new RegExp(`(^|\\.)${domain}$`).test(subdomain);

export const vatNumberRule = (value: string) =>
  /^[0-9]{11}$/.test(value) || "Formato non ammesso";

export const nonNegativeNumberRule = (value: string) =>
  parseFloat(value) >= 0 || "Numeri negativi non supportati";

export function allowPositiveNumberOrDefaultZero(
  value: number | null | string,
): number {
  const parsedValue = typeof value === "string" ? parseFloat(value) : value;

  return parsedValue !== null && parsedValue >= 0 ? parsedValue : 0;
}

export function allowOnlyIntegerNumbers(value: number | string) {
  const parsedValue = typeof value === "string" ? parseFloat(value) : value;

  return parsedValue % 1 === 0 || "Sono accettati solo valori interi";
}
