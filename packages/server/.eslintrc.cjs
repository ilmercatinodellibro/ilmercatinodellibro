module.exports = {
  env: {
    node: true,
    jest: true,
  },

  rules: {
    "@typescript-eslint/no-extraneous-class": ["error", { allowEmpty: true }],
  },
};
