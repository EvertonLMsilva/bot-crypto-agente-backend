module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/**/*.spec.ts'],
  transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: {
    target: 'ES2022', module: 'CommonJS', strict: true,
    noUncheckedIndexedAccess: true, exactOptionalPropertyTypes: true,
    experimentalDecorators: true, emitDecoratorMetadata: true,
    esModuleInterop: true, types: ['node', 'jest'],
  } }] },
  collectCoverageFrom: ['src/**/*.ts'],
  coverageReporters: ['text'],
  coverageThreshold: { global: { lines: 95 } },
};
