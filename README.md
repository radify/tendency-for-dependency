Tendency for Dependency (T4D)
=============================

What is it?
-----------

`T4D` is a tool to help you keep your projects safe - you give it a list of repositories, and it scans them every 24 hours to see if any of the dependencies contains a known security vulnerability. Simple!

What languages are supported?
-----------------------------

* PHP (scans `composer.lock`)
  * Uses https://security.sensiolabs.org/api
* NodeJS/Javascript (scans `package.json`)
  * Uses https://www.npmjs.com/package/retire

How it works
------------

![Rough workflow of T4D](/documentation/img/workflow.png)

Configuration
-------------

You need to supply `T4D` with a list of repositories that you want to scan for vulnerabilities. This is done in `repos.json`. A sample list, `repos.json.sample`, is supplied with this repository.

```bash
cp repos.json.sample repos.json
node t4d
```

### SSH access

You should format it using your user name as the SSH user, for example I would use `gavd`:

```bash
[
	"gavd@github.com:radify/karma-es6-shim.git",
	"gavd@github.com:radify/supersecretproject.git",
	"gavd@github.com:radify/radiian.git"
]
```

TODO
----

* [ ] Shrinkwrap scanning
* [ ] Automatically find and install package.json if it's not in the root
* [ ] Automatically find composer.lock if it's not in the root
* [ ] Slack integration
* [ ] Scheduling
