'use strict';

var Git = require("nodegit");
var exec = require('exec-then');
var remove = require('remove');
var gutil = require('gulp-util');
var fs = require('fs');

var cloneOptions = {
	ignoreCertErrors: 1,
};

cloneOptions.fetchOpts = {
	callbacks: {
		certificateCheck: function() { return 1; },
		credentials: function(url, userName) {
			return Git.Cred.sshKeyFromAgent(userName);
		}
	}
};

/**
 * Scan a directory for security problems
 * @param {string} repo e.g. gavd@github.com:radify/karma-es6-shim.git
 */
function scan(repo) {

	var name = repo.split('/').pop().replace('.git', '');
	var clonepath = "./tmp/" + name;

	var pathToPackageJson = 'package.json'; // TODO use this?
	var pathToComposerLock = 'composer.lock';

	// uncomment this to remove the clone automatically
	// remove.removeSync(clonedPath);

	// if a checkout exists, simply open it
	var openExistingGitRepository = function() {
		return Git.Repository.open(clonepath);
	};

	var installNPM = function() {
		// TODO drill down into any subdirectories and find package.jsons and
		// install them
		return exec('npm install', {cwd: clonepath});
	};

	var scanWithRetire = function() {
		var path = process.cwd() + '/tmp/' + name;
		if (fs.existsSync(path + '/' + pathToPackageJson)) {
			return exec('retire --outputformat json', {cwd: path});
		} else {
			return exec('echo No package.json found at ' + path + '/' + pathToPackageJson);
		}
	};

	var scanWithSensio = function() {
		var path = process.cwd() + '/tmp/' + name;
		if (fs.existsSync(path + '/' + pathToComposerLock)) {
			return exec('curl -H "Accept: application/json" https://security.sensiolabs.org/check_lock -F lock=@' + pathToComposerLock, {cwd: process.cwd() + '/tmp/' + name});
		} else {
			return exec('echo No composer.lock found at ' + path + '/' + pathToComposerLock);
		}
	};

	var collateResults = function(results) {
		return {
			project: name,
			nodeResults: results[0],
			phpResults: results[1]
		};
	};

	return Git.Clone(repo, clonepath, cloneOptions)
		.catch(openExistingGitRepository)
		.then(installNPM)
		.then(function() {
			return Promise.all([scanWithRetire(), scanWithSensio()])
		})
		.then(collateResults)
		.catch(function(err) { gutil.log(gutil.colors.red(err)); });
}

function getPromises() {
	var projects = require('./repos.json');
	var promises = [];
	projects.forEach(function(project) {
		promises.push(scan(project));
	});
	return promises;
}

Promise.all(getPromises())
	.then(function(results) {
		results.forEach(function(result) {

			gutil.log(gutil.colors.white.bold("Project " + result.project));
			if (result.nodeResults.err === null) {
				gutil.log(gutil.colors.white('NodeJS => ') + gutil.colors.black.bgGreen(' clean '));
			} else {
				gutil.log(gutil.colors.white('NodeJS => ') + gutil.colors.black.bgRed(' dirty '));

				var errors = JSON.parse(result.nodeResults.stderr);
				errors.forEach(function(error) {
					if (error.file) {
						gutil.log(' ' + gutil.colors.yellow.bold(error.file.replace(process.cwd() + '/tmp', '')));
					}

					error.results.forEach(function(result) {
						gutil.log(gutil.colors.yellow.bold('  ' + result.component + '[' + result.version + ']'));
						result.vulnerabilities.forEach(function(vuln) {
							if (vuln.severity === 'high') {
								gutil.log('   ' + gutil.colors.bgRed.black.bold(vuln.severity) + ': ' + gutil.colors.yellow(JSON.stringify(vuln.identifiers)));
							} else {
								gutil.log('   ' + gutil.colors.bgYellow.black.bold(vuln.severity) + ': ' + gutil.colors.yellow(JSON.stringify(vuln.identifiers)));
							}
						});
					});
				});
			}

			var phpErrors = [];
			try {
				phpErrors = JSON.parse(result.phpResults.stdout);
			} catch(e) {
				phpErrors = [];
			}

			if (!phpErrors || phpErrors.length === 0) {
				gutil.log(gutil.colors.white('PHP    => ') + gutil.colors.black.bgGreen(' clean '));
			} else {
				gutil.log(gutil.colors.white('PHP => ') + gutil.colors.black.bgRed(' dirty '));
				for (var prop in phpErrors) {
					gutil.log(gutil.colors.yellow('  Advisories detected for ' + prop + ' ' + phpErrors[prop].version));
				}
			}

			gutil.log();

		});
	});

