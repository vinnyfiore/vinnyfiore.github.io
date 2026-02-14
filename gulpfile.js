const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const browserSync = require('browser-sync').create();
const header = require('gulp-header');
const cleanCSS = require('gulp-clean-css');
const rename = require("gulp-rename");
const uglify = require('gulp-uglify');
const pkg = require('./package.json');

// Set the banner content
const banner = ['/*!\n',
  ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
  ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
  ' * Licensed under <%= pkg.license %> (https://github.com/BlackrockDigital/<%= pkg.name %>/blob/master/LICENSE)\n',
  ' */\n',
  ''
].join('');

// Compiles SCSS files from /scss into /css
function css() {
  return gulp.src('scss/resume.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(gulp.dest('css'))
    .pipe(browserSync.stream());
}

// Minify compiled CSS
function minifyCss() {
  return gulp.src('css/resume.css')
    .pipe(cleanCSS({
      compatibility: 'ie8'
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('css'))
    .pipe(browserSync.stream());
}

// Minify custom JS
function minifyJs() {
  return gulp.src('js/resume.js')
    .pipe(uglify())
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('js'))
    .pipe(browserSync.stream());
}

// Copy vendor files from /node_modules into /vendor
function copy(done) {
  gulp.src([
    'node_modules/bootstrap/dist/**/*',
    '!**/npm.js',
    '!**/bootstrap-theme.*',
    '!**/*.map'
  ])
    .pipe(gulp.dest('vendor/bootstrap'));

  gulp.src(['node_modules/jquery/dist/jquery.js', 'node_modules/jquery/dist/jquery.min.js'])
    .pipe(gulp.dest('vendor/jquery'));

  gulp.src(['node_modules/jquery.easing/*.js'])
    .pipe(gulp.dest('vendor/jquery-easing'));

  gulp.src([
    'node_modules/font-awesome/**',
    '!node_modules/font-awesome/**/*.map',
    '!node_modules/font-awesome/.npmignore',
    '!node_modules/font-awesome/*.txt',
    '!node_modules/font-awesome/*.md',
    '!node_modules/font-awesome/*.json'
  ])
    .pipe(gulp.dest('vendor/font-awesome'));

  gulp.src([
    'node_modules/devicons/**/*',
    '!node_modules/devicons/*.json',
    '!node_modules/devicons/*.md',
    '!node_modules/devicons/!PNG',
    '!node_modules/devicons/!PNG/**/*',
    '!node_modules/devicons/!SVG',
    '!node_modules/devicons/!SVG/**/*'
  ])
    .pipe(gulp.dest('vendor/devicons'));

  gulp.src(['node_modules/simple-line-icons/**/*', '!node_modules/simple-line-icons/*.json', '!node_modules/simple-line-icons/*.md'])
    .pipe(gulp.dest('vendor/simple-line-icons'));

  done();
}

// Watch files
function watchFiles() {
  gulp.watch('scss/*.scss', gulp.series(css, minifyCss));
  gulp.watch('js/*.js', minifyJs);
  gulp.watch('*.html').on('change', browserSync.reload);
}

// Define complex tasks
const vendor = gulp.series(copy);
const build = gulp.series(vendor, css, minifyCss, minifyJs);
const watch = gulp.series(build, gulp.parallel(watchFiles, browserSyncInit));

function browserSyncInit() {
  browserSync.init({
    server: {
      baseDir: "./"
    }
  });
}

// Export tasks
exports.css = css;
exports.minifyCss = minifyCss;
exports.minifyJs = minifyJs;
exports.copy = copy;
exports.vendor = vendor;
exports.build = build;
exports.watch = watch;
exports.default = build;
