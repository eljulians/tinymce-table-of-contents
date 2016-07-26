module.exports = function(grunt) {
    grunt.initConfig({
        jscs: {
            src: 'js/table-of-contents.js',
            options: {
                config: '.jscsrc'
            }
        },
        uglify: {
            options: {
                mangle: false,
                compress: {
                    drop_console: true
                }
            },
            js: {
                files: [{
                    src: 'js/table-of-contents.js',
                    dest: 'js/table-of-contents.min.js'
                }]
            }
        }
    });

    grunt.loadNpmTasks('grunt-jscs');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['jscs', 'uglify']);
}
