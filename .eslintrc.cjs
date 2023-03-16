module.exports = {
  env: {
    es2021: true
  },
  extends: ['semistandard'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'space-before-function-paren': ['error', 'never']
  }
};
