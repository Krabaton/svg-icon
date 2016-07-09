'use strict';

var gulp = require("gulp"),
  sass = require('gulp-sass'),
  browserSync = require('browser-sync').create();
//------------------------------------------/
var svgSprite = require('gulp-svg-sprite'),
  svgmin = require('gulp-svgmin'),
  cheerio = require('gulp-cheerio'),
  replace = require('gulp-replace');

var config = {
  mode: {
    symbol: {
      sprite: "../sprite.svg",
      render: {
        scss: {
          dest: '../../../scss/_sprite.scss'
        }
      }
    }
  }
};

gulp.task('svgSpriteBuild', function() {
  return gulp.src('app/icons/i/*.svg')
    // минифицируем svg
    .pipe(svgmin({
      js2svg: {
        pretty: true
      }
    }))
    // удалить все атрибуты fill, style and stroke в фигурах
    .pipe(cheerio({
      run: function($) {
        $('[fill]').removeAttr('fill');
        $('[stroke]').removeAttr('stroke');
        $('[style]').removeAttr('style');
      },
      parserOptions: { xmlMode: true }
    }))
    // cheerio плагин заменит, если появилась, скобка '&gt;', на нормальную.
    .pipe(replace('&gt;', '>'))
    // build svg sprite
    .pipe(svgSprite(config))
    .pipe(gulp.dest('app/icons/sprite/'));
});

//Компиляция SASS
gulp.task('sass', function() {
  gulp.src('app/scss/*.scss')
    .pipe(sass())
    .on('error', log)
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.stream());
});

// Запускаем локальный сервер (только после компиляции sass)
gulp.task('server', ['sass'], function() {
  browserSync.init({
    notify: false,
    port: 9000,
    server: {
      baseDir: 'app'
    }
  });
});

// слежка и запуск задач 
gulp.task('watch', function() {
  gulp.watch('app/scss/*.scss', ['sass']);
  gulp.watch([
    'app/**/*.html',
    'app/js/**/*.js'
  ]).on('change', browserSync.reload);
  gulp.watch([
    'app/css/**/*.css'
  ]).on('change', browserSync.reload);
});

// Задача по-умолчанию 
gulp.task('default', ['server', 'watch']);

// Более наглядный вывод ошибок
var log = function(error) {
  console.log([
    '',
    "----------ERROR MESSAGE START----------",
    ("[" + error.name + " in " + error.plugin + "]"),
    error.message,
    "----------ERROR MESSAGE END----------",
    ''
  ].join('\n'));
  this.end();
}
