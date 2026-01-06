// 登录
export const loginSchema = {
  elements: [
    {
      type: 'text',
      name: 'email',
      title: '电子邮件',
      inputType: 'email',
      isRequired: true,
      validators: [{ type: 'email' }],
    },
    { type: 'text', name: 'password', title: '密码', inputType: 'password', isRequired: true },
  ],
  completeText: '登录',
  showQuestionNumbers: 'off',
  showCompletedPage: false,
};

// 注册
export const registerSchema = {
  elements: [
    { type: 'text', name: 'firstname', title: '姓', isRequired: true },
    { type: 'text', name: 'lastname', title: '名', isRequired: true, startWithNewLine: false },
    {
      type: 'text',
      name: 'email',
      title: '电子邮件',
      inputType: 'email',
      isRequired: true,
      validators: [{ type: 'email' }],
    },
    {
      type: 'text',
      name: 'password',
      title: '设置密码',
      inputType: 'password',
      isRequired: true,
      minLength: 6,
    },
    {
      type: 'text',
      name: 'confirmPassword',
      title: '确认密码',
      inputType: 'password',
      isRequired: true,
      validators: [
        {
          type: 'expression',
          expression: '{password} == {confirmPassword}',
          text: '两次输入的密码不一致',
        },
      ],
    },
  ],
  completeText: '注册账号',
  showQuestionNumbers: 'off',
  showCompletedPage: false,
};
