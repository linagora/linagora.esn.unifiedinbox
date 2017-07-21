# linagora.esn.unifiedinbox

OpenPaaS Unified Inbox module.

## How to run the tests

Make sure you have [gitlab-ci-multi-runner](https://gitlab.com/gitlab-org/gitlab-ci-multi-runner) installed locally, following the [installation instructions](https://docs.gitlab.com/runner/install/).  
Make sure you have **Docker** installed.  
  
Run tests:

```
$ gitlab-ci-multi-runner exec docker test
```

This will pull all required images, and run the whole tests suite in a Docker container.  
If you only want to run linters and unit-frontend tests, you can run them on your machine directly using:

```
$ grunt linters test-frontend
```
