module.exports = function(grunt) {
  // project configuration
  grunt.initConfig({{
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      all: ['Gruntfile.js', 'app.js', 'models/*.js', 'controllers/*.js',
        'config/*.js', 'public/**/*.js'],
      options: {
        jshintrc: '.jshintrc',
        ignores: ['**/*.min.js']
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      }
    },
    build: {
      files: {
        'app.min.js': ['app.js'],
        'routes/index.min.js': ['routes/index.js'],
        'routes/assignments.min.js': ['routes/assignments.js'],
        'routes/grades.min.js': ['routes/grades.js'],
        'routes/students.min.js': ['routes/students.js'],
        'routes/users.min.js': ['routes/users.js'],
        'models/assignment.min.js': ['models/assignment.js'],
        'models/collection.min.js': ['models/collection.js'],
        'models/user.min.js': ['models/user.js'],
        'controllers/globalFunctions.min.js': ['controllers/globalFunctions.js'],
        'controllers/setupController.min.js': ['controllers/setupController.js'],
        'config/passport.min.js': ['config/passport.js']
      }
    },
    cssmin: {
      options: {
        shorthandCompacting: false,
        roundingPrecision: -1
      },
      target: {
        files: {
          'public/css/main.min.css': ['public/css/main.css']
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // default tasks
  grunt.registerTask('default', ['jshint', 'uglify', 'cssmin']);
}
