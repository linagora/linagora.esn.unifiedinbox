'use strict';

module.exports = function(grunt) {
  grunt.registerMultiTask('splitfiles', 'split the files and run separate targets', function() {
    const options = this.options({
      chunk: 50,
      common: []
    });

    if (!options.target) {
      grunt.fatal.fail('Missing target in options');

      return;
    }

    const files = this.files.reduce((a, b) => a.concat(b.src), []),
          totalFiles = files.length,
          chunkSize = options.chunk,
          commonFiles = grunt.file.expand(options.common),
          targets = [],
          configBase = options.target.replace(/:/g, '.');

    for (let chunkId = 1; files.length; chunkId++) {
      const chunkFiles = commonFiles.concat(files.splice(0, chunkSize));

      grunt.config.set(configBase + chunkId + '.options.files', chunkFiles);
      targets.push(options.target + chunkId);
    }

    if (targets.length > 1) {
      grunt.log.ok('Splitting ' + totalFiles + ' tests into ' + targets.length + ' chunks');
    }

    grunt.task.run(targets);
  });
};
