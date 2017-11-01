const request = require('request');
const webpackConfigDev = require('./webpack.config.dev');
const webpackConfigProd = require('./webpack.config.prod');

module.exports = function init(grunt) {
  // show elapsed time at the end
  // eslint-disable-next-line global-require, import/no-extraneous-dependencies
  require('time-grunt')(grunt);
  // load all grunt tasks
  // eslint-disable-next-line global-require, import/no-extraneous-dependencies
  require('load-grunt-tasks')(grunt);

  const reloadPort = 35729;
  let files;

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    eslint: {
      target: ['app/**/*.js', 'clientSide/**/*.js', 'config/**/*.js',
        'test/**/*.js', 'app.js', 'Gruntfile.js'],
    },
    webpack: {
      options: {
        stats: !process.env.NODE_ENV || process.env.NODE_ENV === 'development',
      },
      prod: webpackConfigProd,
      dev: Object.assign({ watch: true }, webpackConfigDev),
    },

    // underscore required in mocha_istanbul
    mocha_istanbul: {
      coverage: {
        src: 'test/**/*.js',
        options: {
          check: {
            statements: 85,
            functions: 85,
            branches: 77,
          },
          excludes: [
            'app.js',
            'config/*',
            'migrations/millennium_db/*',
            'app/models/*',
          ],
        },
      },
    },
    mochaTest: {
      test: {
        options: {
          quiet: false,
          noFail: false, // Set to true to force tests to pass
        },
      },
      src: ['test/spec/**/*.js'],
    },
    develop: {
      server: {
        file: 'app.js',
      },
    },
    stylus: {
      dist: {
        files: {
          'public/css/style.css': 'public/css/style.styl',
        },
      },
    },
    env: {
      dev: {
        NODE_ENV: 'development',
        PROTOCOL: 'http',
        HOSTNAME: 'localhost',
        PORT: 3000,
        DB_USERNAME: 'root',
        DB_PASSWORD: 'root',
        DB_SERVER: 'localhost',
        DB_NAME: 'millennium_db',
        APP_NAME: 'millennium-visualizer',
      },
      test: {
        NODE_ENV: 'test',
        PROTOCOL: 'http',
        HOSTNAME: 'localhost',
        PORT: 3000,
        DB_USERNAME: 'root',
        DB_PASSWORD: 'root',
        DB_SERVER: 'localhost',
        DB_NAME: 'millennium_db',
        APP_NAME: 'millennium-visualizer',

      },
      production: {
        NODE_ENV: 'production',
        PROTOCOL: 'http',
        HOSTNAME: 'localhost',
        PORT: 3000,
        DB_USERNAME: 'root',
        DB_PASSWORD: 'root',
        DB_SERVER: 'localhost',
        DB_NAME: 'millennium_db',
        APP_NAME: 'millennium-visualizer',
      },
      large_db: {
        NODE_ENV: 'production',
        PROTOCOL: 'http',
        HOSTNAME: 'localhost',
        PORT: 3000,
        DB_USERNAME: 'root',
        DB_PASSWORD: 'root',
        DB_SERVER: 'localhost',
        DB_NAME: 'large_db',
        APP_NAME: 'millennium-visualizer',
      },
    },
    watch: {
      options: {
        nospawn: true,
        livereload: reloadPort,
      },
      js: {
        files: [
          'app.js',
          'app/**/*.js',
          'config/*.js',
        ],
        tasks: ['develop', 'delayed-livereload', 'eslint'],
      },
      css: {
        files: [
          'public/css/*.styl',
        ],
        tasks: ['stylus'],
        options: {
          livereload: reloadPort,
        },
      },
      views: {
        files: [
          'app/views/*.ejs',
          'app/views/**/*.ejs',
        ],
        options: { livereload: reloadPort },
      },
    },
  });

  grunt.config.requires('watch.js.files');
  files = grunt.config('watch.js.files');
  files = grunt.file.expand(files);

  // Load the npm dependencies into grunt
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-mocha-istanbul');

  // Load webpack plugin npm tasks.
  grunt.loadNpmTasks('grunt-webpack');

  grunt.registerTask('delayed-livereload', 'Live reload after the node server has restarted.',
    () => {
      const done = this.async();
      setTimeout(() => {
        request.get(`http://localhost:${reloadPort}/changed?files=${files.join(',')}`,
          (err, res) => {
            const reloaded = !err && res.statusCode === 200;
            if (reloaded) {
              grunt.log.ok('Delayed live reload successful.');
            } else {
              grunt.log.error('Unable to make a delayed live reload.');
            }
            done(reloaded);
          });
      }, 500);
    });

  grunt.registerTask('test', [
    'env:test',
    'eslint',
    'mocha_istanbul',
  ]);

  grunt.registerTask('build', [
    'env:dev',
    'eslint',
    'stylus',
    'webpack',
    'mocha_istanbul',
    'develop',
  ]);

  // The default task just runs the project on dev
  grunt.registerTask('default', [
    'build',
    'watch',
  ]);
};
