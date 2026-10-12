export function isPhone(rule, value, callback) {
  if (!value) {
    callback();
    return;
  }
  const phoneReg = /^1[3-9]\d{9}$/;
  if (!phoneReg.test(value)) {
    callback(new Error('请输入正确的手机号码'));
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
    callback(new Error('请输入正确的邮箱地址'));
  } else {
    callback();
  }
}

export function isUsername(rule, value, callback) {
  if (!value) {
    callback(new Error('请输入用户名'));
    return;
  }
  if (value.length < 3 || value.length > 32) {
    callback(new Error('用户名长度在 3 到 32 个字符'));
  } else {
    callback();
  }
}

export function isPassword(rule, value, callback) {
  if (!value) {
    callback(new Error('请输入密码'));
    return;
  }
  if (value.length < 6) {
    callback(new Error('密码长度不能少于 6 位'));
  } else {
    callback();
  }
}
