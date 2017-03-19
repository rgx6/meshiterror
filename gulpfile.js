var browserSync = require('browser-sync');
var del         = require('del');
var fs          = require('fs');
var gulp        = require('gulp');
var concat      = require('gulp-concat');
var minifyCSS   = require('gulp-minify-css');
var pug         = require('gulp-pug');
var sourcemaps  = require('gulp-sourcemaps');
var spritesmith = require('gulp.spritesmith');
var uglify      = require('gulp-uglify');
var merge       = require('merge-stream');

gulp.task('js', function () {
    // del('src/public/js/**/*');
    gulp.src('src/js/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(concat('index.js'))
        .pipe(uglify({ preserveComments: 'some' }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('src/public/js'));
});

gulp.task('css', function () {
    // del('src/public/css/**/*');
    gulp.src('src/css/**/*.css')
        .pipe(sourcemaps.init())
        .pipe(concat('index.css'))
        .pipe(minifyCSS())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('src/public/css'));
});

gulp.task('img', function () {
    // del('src/public/img/**/*');
    gulp.src('src/img/**/*.*')
        .pipe(gulp.dest('src/public/img'));
});

gulp.task('pug', ['photo'], function () {
    gulp.src(['src/pug/**/*.pug', '!src/pug/**/_*.pug'])
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest('src/public'));
});

gulp.task('photo', function () {
    var siteUrl = 'https://meshiterror.azurewebsites.net/';
    var tweetUrlBase = 'https://twitter.com/intent/tweet?lang=ja&text=';
    var tweetUrlContent = '{src}'
            + '%20' + encodeURIComponent(siteUrl)
            + '%20' + encodeURIComponent('#飯テロスタンプ');

    var data = '';

    require('./asset/photo.json').forEach(function (photo) {
        var content = tweetUrlBase + tweetUrlContent.replace('{src}', encodeURIComponent(photo.src));

        data += 'div\r\n';
        data += '  a.icon-' + photo.id + '(href="'+content+'")\r\n';
    });

    fs.writeFile('src/pug/_photo.pug', data, function (err) {
        if (err) throw err;
        return gulp;
    });
});

gulp.task('sprite', function () {
    var spriteData = gulp.src('asset/thumbnail/*.jpg').pipe(spritesmith({
        imgName: 'sprite.jpg',
        imgPath: '/img/sprite.jpg',
        cssName: 'sprite.css'
    }));

    var imgStream = spriteData.img
            .pipe(gulp.dest('asset/sprite/'));

    var cssStream = spriteData.css
            .pipe(gulp.dest('asset/sprite/'));

    return merge(imgStream, cssStream);
});

gulp.task('release', function () {
    // todo : clean build
    console.log('not implemented');
});

gulp.task('clean', function () {
    del('dest/**/*');
});

gulp.task('build', ['pug', 'js', 'css', 'img'], function () {
    gulp.src(['src/public/js/*.js', 'src/public/js/*.map'])
        .pipe(gulp.dest('dest/public/js'));

    gulp.src(['src/public/css/*.css', 'src/public/css/*.map'])
        .pipe(gulp.dest('dest/public/css'));

    gulp.src('src/public/img/**/*.*')
        .pipe(gulp.dest('dest/public/img'));

    gulp.src('src/public/**/*.html')
        .pipe(gulp.dest('dest/public'));

    gulp.src('src/views/**/*.pug')
        .pipe(gulp.dest('dest/views'));
});

gulp.task('watch', function () {
    browserSync.init({
        server: 'src/public',
        index: 'index.html'
    });

    gulp.watch('src/js/**/*.js', ['js', browserSync.reload]);
    gulp.watch('src/css/**/*.css', ['css', browserSync.reload]);
    gulp.watch('src/img/**/*.*', ['img', browserSync.reload]);
    gulp.watch('src/pug/**/*.pug', ['pug', browserSync.reload]);
});

gulp.task('default', ['watch']);
