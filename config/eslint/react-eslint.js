const path = require('path');

const join = (dir) => path.join(__dirname, '../../', dir);

module.exports = {
  extends: [
    './base-eslint',
    require.resolve('eslint-config-airbnb-typescript'),
    require.resolve('eslint-config-airbnb/hooks'),
  ],
  rules: {
    'import/no-extraneous-dependencies': [
      'error', {
        packageDir: [
          join('./'),
          join('./packages/api'),
          join('./packages/api-react'),
          join('./packages/user-preferences'),
          join('./packages/user-preferences-react'),
          join('./packages/columns-manager'),
          join('./packages/columns-manager-react'),
          join('./packages/columns-manager-kit'),
          join('./packages/authorization-service'),
          join('./packages/authorization-service-react'),
          join('./packages/refdata-service'),
          join('./packages/refdata-service-react'),
          join('./packages/filters-kit'),
          join('./packages/filters-kit-presets'),
          join('./packages/nova'),
          join('./packages/nova-react'),
          join('./packages/product-image-kit'),
          join('./packages/saved-view'),
          join('./packages/saved-view-react'),
          join('./packages/saved-view-kit'),
          join('./packages/audit-paas-search'),
          join('./packages/audit-paas-search-react'),
          join('./packages/audit-paas-search-kit'),
          join('./packages/use-observable-query'),
          join('./packages/common-utilities'),
        ],
      },
    ],
    'react/jsx-props-no-spreading': 'off',
    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function',
      },
    ],
    'react/react-in-jsx-scope': 'off',

    'react/jsx-no-useless-fragment': [
      'error',
      {
        allowExpressions: true,
      },
    ],
  },
  overrides: [
    {
      files: [ '*.tsx' ],
      rules: {
        'react/require-default-props': 'off',
      },
    },
  ],
};
