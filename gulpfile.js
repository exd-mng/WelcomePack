var gulp = require('gulp'),
    pug = require('gulp-pug'),
    sass = require('gulp-sass'),
    data = require('gulp-data'),
    cssnano = require('gulp-cssnano'),
    imagemin = require('gulp-imagemin'),
    prefix = require('gulp-autoprefixer'),
    sourcemaps = require('gulp-sourcemaps'),
    jshint = require("gulp-jshint"),
    uglify = require("gulp-uglify"),
    del = require('del'),
    fs = require("fs"),
    merge = require('gulp-merge-json'),
    path = require('path'),
    svgsprite = require('gulp-svg-sprite'),
    bs = require('browser-sync').create(),
    yaml = require('gulp-yaml');

  gulp.task('browser-sync', function() {
    bs.init({
        server: {
            baseDir: "dist"
        }
    });
});

var autoprefixerOptions = {
  browsers: ['last 2 versions']
};

gulp.task('yaml', function() {
  return gulp
    .src('source/data/data.yaml')
    .pipe(yaml({ space: 2 }))
    .pipe(gulp.dest('source/data'))
});

gulp.task('pug:data', ['yaml'], function() {
  return gulp
    .src('source/data/data.json')
    .pipe(merge({
        fileName: 'data.json',
        edit: (json, file) => {
            var filename = path.basename(file.path),
                primaryKey = filename.replace(path.extname(filename), '');
            var data = {};
            data[primaryKey.toUpperCase()] = json;
            return data;
        }
    }))
    .pipe(gulp.dest('dist/data/'));
});

gulp.task('html', ['pug:data'], function() {
  return gulp
    .src('source/**/*.pug')
    .pipe(data( function(file) {
      return JSON.parse(
        fs.readFileSync('dist/data/data.json')
      );
    } ))
    .pipe(pug({pretty: true}))
    .pipe(gulp.dest('dist'))
    .pipe(bs.reload({stream: true}));
});

gulp.task('styles', function () {
  return gulp
    .src('source/scss/**/**/*.scss')
    .pipe(sass())
    .pipe(cssnano({ minifyFontValues: false, discardUnused: false }))
    .pipe(prefix(autoprefixerOptions))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/css'))
    .pipe(bs.reload({stream: true}));
});

gulp.task('scripts', function () {
  return gulp
    .src('source/js/**/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'));
});

gulp.task('images', function() {
  // return gulp
  //   .src('source/assets/img/**/*')
  //   .pipe(imagemin())
  //   .pipe(gulp.dest('dist/assets/img'));
});

gulp.task('fonts', function() {
  return gulp
    .src(['source/assets/fonts/*.*'])
    .pipe(gulp.dest('dist/assets/fonts'));
});

var svgSpriteConfig = {
  mode: {
    symbol: {
      dest: '',
      sprite: 'sprite.svg'
    },
    svg: {
        xmlDeclaration: false,
        doctypeDeclaration: false
    }
  }
};

gulp.task('svg', function () {
  // return gulp.src('./source/assets/icons/*.svg')
  //   .pipe(svgsprite(svgSpriteConfig))
  //   .pipe(gulp.dest('./source/assets/icons/sprite'))
  //   .pipe(gulp.dest('./dist/assets/icons'));
}); 

gulp.task('clean', function() {
  return del('dist');
});

gulp.task('default', ['clean'], function() {
  gulp.start('svg', 'html', 'styles', 'scripts', 'fonts', 'images');
});

gulp.task('watch', ['default', 'browser-sync'], function() {
  gulp.watch(['source/**/*.pug', 'source/**/*.yaml'], ['html']);
  gulp.watch('source/scss/**/**/*.scss', ['styles']);
  gulp.watch('source/js/**/*.js', ['scripts']);
  gulp.watch('source/assets/img/**/ *', ['images']);
  gulp.watch('source/assets/img/**/*', ['svg']);
});