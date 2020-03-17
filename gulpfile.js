//sass
var gulp = require("gulp");
var sass = require("gulp-sass");
var autoprefixer = require("gulp-autoprefixer");
var plumber = require("gulp-plumber");
var progeny = require("gulp-progeny");
var sourcemaps = require("gulp-sourcemaps");

//画像圧縮
var changed = require("gulp-changed");
var imagemin = require("gulp-imagemin");
var imageminJpg = require("imagemin-jpeg-recompress");
var imageminPng = require("imagemin-pngquant");
var imageminGif = require("imagemin-gifsicle");
var svgmin = require("gulp-svgmin");

//JSの結合・圧縮
var concat = require("gulp-concat");
var jshint = require("gulp-jshint");
var rename = require("gulp-rename");
var uglify = require("gulp-uglify");

//オートリロード
var browserSync = require("browser-sync");

//sass
gulp.task("sass", function(done) {
  gulp
    .src("./src/scss/*.scss")
    .pipe(plumber())
    .pipe(progeny())
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        outputStyle: "expanded"
      })
    )
    .pipe(
      autoprefixer({
        //browsers: ["last 2 version", "iOS >= 8.1", "Android >= 4.4"],
        cascade: false
      })
    )
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("./dist/css/"));
  done();
});

//画像圧縮
gulp.task("imagemin", function() {
  // jpeg,png,gif
  gulp
    .src("./src/images/**/*.+(jpg|jpeg|png|gif)")
    .pipe(changed("./images"))
    .pipe(
      imagemin([
        imageminPng(),
        imageminJpg(),
        imageminGif({
          interlaced: false,
          optimizationLevel: 3,
          colors: 180
        })
      ])
    )
    .pipe(gulp.dest("./dist/images/"));
  // svg
  gulp
    .src("./src/assets/images/**/*.+(svg)")
    .pipe(changed("./images"))
    .pipe(svgmin())
    .pipe(gulp.dest("./images/"));
});

//JSの結合
gulp.task("js.concat", function() {
  gulp
    .src(["./src/js/sample.js"])
    .pipe(plumber())
    .pipe(jshint())
    .pipe(jshint.reporter("default"))
    .pipe(concat("bundle.js"))
    .pipe(gulp.dest("./dist/js"));
});

//JSの圧縮
gulp.task("js.compress", function() {
  gulp
    .src("./dist/js/bundle.js")
    .pipe(plumber())
    .pipe(uglify())
    .pipe(rename("bundle.min.js"))
    .pipe(gulp.dest("./dist/js"));
});

// Browser Sync
gulp.task("bs", function() {
  browserSync({
    server: {
      baseDir: "./dist/",
      index: "index.html"
    }
  });
});

// Reload Browser
gulp.task("bs-reload", function(done) {
  browserSync.reload();
  done();
});

// 監視
gulp.task("watch", function(done) {
  gulp.watch("./**/*.html", gulp.task("bs-reload"));
  gulp.watch("./src/scss/**/*.scss", gulp.task("sass"));
  gulp.watch("./src/scss/**/*.scss", gulp.task("bs-reload"));
  gulp.watch("./src/js/*.js", gulp.task("js.concat"));
  gulp.watch("./src/js/*.js", gulp.task("js.compress"));
  gulp.watch("./src/js/*.js", gulp.task("bs-reload"));
  gulp.watch("./src/images/*", gulp.task("imagemin"));
  gulp.watch("./src/images/*", gulp.task("bs-reload"));
});

gulp.task(
  "default",
  gulp.series(
    gulp.parallel("bs", "sass", "js.concat", "js.compress", "imagemin", "watch")
  )
);
