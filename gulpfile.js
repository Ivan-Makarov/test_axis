const gulp = require('gulp');
const sass = require('gulp-sass');
const cleanCss = require('gulp-clean-css');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const htmlmin = require('gulp-htmlmin');
const browsersync = require('browser-sync');
const imagemin = require('gulp-imagemin');
const gutil = require( 'gulp-util' );
const ftp = require( 'vinyl-ftp' );
const replace = require('gulp-replace');
const gulpSequence = require('gulp-sequence');
// PostCSS with plugins
const postCss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const mqpacker = require('css-mqpacker');
// FTP config
const ftpconfig = require('./config');

gulp.task('js', () => {
    return gulp.src('./src/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(concat('main.js'))
        .pipe(babel({
            presets: ['env']
		}))
		.pipe(sourcemaps.write())
        .pipe(gulp.dest('./build/js'))
        .pipe(uglify())
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./build/js'))
        .pipe(browsersync.reload({stream: true}))
});

gulp.task('css', () => {
    return gulp.src('./src/sass/main.scss')
        .pipe(sourcemaps.init())
        .pipe(sass())
        .on('error', sass.logError)
        .pipe(postCss([
            autoprefixer(),
			mqpacker()
        ]))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./build/css'))
        .pipe(rename({
            suffix: ".min"
        }))
		.pipe(cleanCss())
		.pipe(sourcemaps.write())
        .pipe(gulp.dest('./build/css'))
        .pipe(browsersync.reload({stream: true}))
});

gulp.task('html', () => {
    return gulp.src('./src/**/*.html')
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest('./build'))
        .pipe(browsersync.reload({stream: true}))
});

gulp.task('img', () => {
    return gulp.src('./src/img/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('./build/img'))
});

gulp.task('sync', () => {
    browsersync.init({
        proxy: 'test',
        open: true,
        // browser: ['chrome', 'firefox'],
        notify: false
    })
});

gulp.task('build', ['html', 'css', 'js', 'img']);

gulp.task('watch', () => {
	gulp.watch(['./src/**/*.scss'], ['css']);
	gulp.watch(['./src/**/*.js'], ['js']);
	gulp.watch(['./src/**/*.html'], ['html']);
	gulp.watch(['./build/**/*.html',
				'./build/**/*.css',
				'./build/**/*.js',
                ]).on('change', browsersync.reload);
});

gulp.task('default', ['build', 'sync', 'watch']);

gulp.task('deploy', function() {
    const conn = ftp.create({
        host: ftpconfig.host,
		user: ftpconfig.user,
		password: ftpconfig.password,
        parallel: 1,
        log: gutil.log
    } );

    const globs = [
        './build/**'
    ];

    return gulp.src(globs, {
            base: './build',
            buffer: false
        })
        .pipe(conn.newerOrDifferentSize('/public_html'))
        .pipe(conn.dest('/public_html'));
});
