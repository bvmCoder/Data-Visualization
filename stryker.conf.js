require('stryker-mocha-runner');
require('stryker-mocha-framework');

module.exports = (config) => {
  config.set({
    /* The following are the files to mutate.
     * ! at the start of a path excludes matching files.
     */
    mutate: [
      'app/**/*.js',
      '!app/models/index.js', // corresponding test throws error about max listeners being exceeded
      '!app/controllers/login.controller.js', // corresponding test throws error about max listeners being exceeded
      '!app/controllers/logout.controller.js', // corresponding test throws error about max listeners being exceeded
      '!app/utility/linkConnectionTypes.js', // no test exists for this file
    ],
    files: [
      /* The following are the tests to run. Tests that use jQuery will crash the runner.
       * Tests that create objects with a limited number of listeners (like an express app)
       * may throw errors about the maximum number of listeners being exceeded.
       */
      'test/app/**/*.js',
      '!test/app/models/index.js', // throws error about max listeners being exceeded
      '!test/app/controllers/login.js', // throws error about max listeners being exceeded
      '!test/app/controllers/logout.js', // throws error about max listeners being exceeded

      // supporting files for testing
      {
        pattern: 'test/stubs/**',
        mutated: false,
        included: false,
      },
      {
        pattern: 'app/**',
        mutated: false,
        included: false,
      },
      {
        pattern: 'config/**',
        mutated: false,
        included: false,
      },
      { pattern: 'app.js',
        mutated: false,
        included: false,
      },
      { pattern: 'public/**',
        mutated: false,
        included: false,
      },
    ],
    testRunner: 'mocha',
    testFramework: 'mocha',
    /* Even though coverageAnalysis is set to off, analysis still occurs it is just
     * slower. If this is set to something else warnings will be given about running
     * all tests against all mutants. This is the same behavior attained by setting
     * coverageAnalysis to 'off'. Thus by not using the setting 'off' the same results
     * are attained at the same speed, but without a warning.
     */
    coverageAnalysis: 'off',
    reporter: ['html', 'clear-text'],
    htmlReporter: { baseDir: 'stryker_report/html' },
    logLevel: 'info',
    plugins: ['stryker-mocha-runner', 'stryker-mocha-framework', 'stryker-html-reporter'],
  });
};
