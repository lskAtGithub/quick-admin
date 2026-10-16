import { $t } from '@/locales';

export function isPhone(rule, value, callback) {
  if (!value) {
    callback();
    return;
  }
  const phoneReg = /^1[3-9]\d{9}$/;
  if (!phoneReg.test(value)) {
    callback(new Error($t('validator.phoneInvalid')));
  } else {
    callback();
  }
}

export function isEmail(rule, value, callback) {
  if (!value) {
    callback();
    return;
  }
  const emailReg = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/;
  if (!emailReg.test(value)) {
    callback(new Error($t('validator.emailInvalid')));
  } else {
    callback();
  }
}

export function isUsername(rule, value, callback) {
  if (!value) {
    callback(new Error($t('validator.usernameRequired')));
    return;
  }
  if (value.length < 3 || value.length > 32) {
    callback(new Error($t('validator.usernameLength')));
  } else {
    callback();
  }
}

export function isPassword(rule, value, callback) {
  if (!value) {
    callback(new Error($t('validator.passwordRequired')));
    return;
  }
  if (value.length < 6) {
    callback(new Error($t('validator.passwordMin')));
  } else {
    callback();
  }
}
