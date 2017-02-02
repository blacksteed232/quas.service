'usestrict';

let gulp = require('gulp');
let util = require('gulp-util');
let nodemon = require('gulp-nodemon');
let eslint = require('gulp-eslint');
let runSequence = require('run-sequence');

gulp.task('eslint', () => {
  return gulp.src(['./**/*.js', '!node_modules/**', '!deployment/**'])
    .pipe(eslint())
    .pipe(eslint.format());
});

gulp.task('develop.start', () => {
  nodemon({
    quiet: true,
    "restartable": "rs",
    "ignore": [
      ".git",
      "node_modules/**/node_modules",
      "./deployment",
      "*.log*",
      "**/*.log*",
      "*.rdb"
    ],
    "execMap": {},
    "events": {},
    "watch": [
      ".",
      ".env"
    ],
    env: {
      'DEBUGER': 'worker'
    },
    tasks: (changedFiles) => {
      changedFiles.forEach(function (file) {
        util.log('File changed', util.colors.magenta(file));
      });
      return ['eslint'];
    }
  })
});

gulp.task('develop', (done) => {
  runSequence('eslint', 'develop.start', done);
});