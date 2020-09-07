// 实现这个项目的构建任务
const {
  src,
  dest,
  parallel,
  series,
  watch
} = require('gulp');
const loadPlugins = require('gulp-load-plugins');
const path = require('path');
const del = require('del');
const browserSync = require('browser-sync');
// format js
const standard = require('standard');
// fromat css
const Comb = require('csscomb');

const plugins = loadPlugins();
const bs = browserSync.create();

const TEMP = 'temp';
const SRC = 'src';
const DIST = 'dist';

const baseUrlConfig = (path) => ({
  base: path
});

const data = {
  menus: [
    {
      name: 'Home',
      link: 'index.html'
    },
    {
      name: 'About',
      link: 'about.html'
    },
  ],
  pkg: require('./package.json'),
  date: new Date()
}

// task clean
const clean = () => {
  return del(['dist', TEMP]);
}

// task style: handle sass
const style = () => {
  return src('src/assets/styles/*.scss', baseUrlConfig(SRC))
    .pipe(plugins.sass({ outputStyle: 'expanded' }))
    .pipe(dest(TEMP))
    .pipe(bs.reload({ stream: true }))
}

// task script: handle js
const script = () => {
  return src('src/assets/scripts/*.js', baseUrlConfig(SRC))
    .pipe(plugins.babel({ presets: ['@babel/preset-env'] }))
    .pipe(dest(TEMP))
		.pipe(bs.reload({ stream: true }));
}

// task page: handle html
const page = () => {
  return src('src/*.html', baseUrlConfig(SRC))
    .pipe(plugins.swig({ data, defaults: { cache: false } }))
    .pipe(dest(TEMP))
    .pipe(bs.reload({ stream: true }));
}

const image = () => {
  return src('src/assets/images/**', baseUrlConfig(SRC))
    .pipe(plugins.imagemin())
    .pipe(dest(DIST));
};

const font = () => {
  return src('src/assets/fonts/**', baseUrlConfig(SRC))
    .pipe(plugins.imagemin())
    .pipe(dest(DIST));
};

const extra = () => {
  return src('public/**', baseUrlConfig(SRC))
    .pipe(dest(DIST));
}

const lint = done => {
  const comb = new Comb(require('./.csscomb.json'));
  comb.processPath('src');
  const cwd = path.join(__dirname, 'src');
  standard.lintFiles('assets/scripts/**/*.js', { cwd, fix: true }, done);
}

const useref = () => {
  return src('temp/*.html', baseUrlConfig(TEMP))
    .pipe(plugins.useref({ searchPath: [TEMP, '']}))
    .pipe(plugins.if(/\.js$/, plugins.uglify()))
    .pipe(plugins.if(/\.css/, plugins.cleanCss()))
    .pipe(plugins.if(/\.html/, plugins.htmlmin({
      collapseWhitespace: true,
			minifyCSS: true,
			minifyJS: true
    })))
    .pipe(dest(DIST));
}

const devServer = () => {
  watch('src/assets/styles/*.scss', style);
	watch('src/assets/scripts/*.js', script);
	watch('src/*.html', page);
	watch([
		'src/assets/images/**',
		'src/assets/fonts/**',
		'public/**'
  ], bs.reload);
  
  bs.init({
		notify: false,
    port: 2080,
    open: false,
		server: {
			baseDir: ['temp', 'src', 'public'],
			routes: {
				'/node_modules': 'node_modules'
			}
		}
	});
}


const compile = parallel(style, script, page);

const build = series(
  clean,
  parallel(
    series(compile, useref),
    image,
    font,
    extra
  )
);

const start = series(compile, devServer);

module.exports = {
  clean,
  lint,
  build,
  start
}
