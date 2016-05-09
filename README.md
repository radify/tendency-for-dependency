Tendency for Dependency (T4D)
=============================

What is it?
-----------

T4D is a tool to help you keep your projects safe - you give it a list of repositories, and it scans them every 24 hours to see if any of the dependencies contains a known security vulnerability. Simple!

What languages are supported?
-----------------------------

* PHP (scans `composer.lock`)
* NodeJS/Javascript (scans `package.json`)

How it works
------------

![Rough workflow of T4D](/documentation/img/workflow.png)

How do I use it?
----------------

1. Add a list of repositories to `repos.ini`.
1. [ ] Make sure it can access all the repos in repos.ini (TODO how?)
1. [ ] Run it (TODO how?)

TODO
----

* [ ] Shrinkwrap?
* [ ] Slack integration
