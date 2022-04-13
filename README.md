[![build](https://github.com/dhomane/cf-example-build-and-push/actions/workflows/docker-image.yml/badge.svg)](https://github.com/dhomane/cf-example-build-and-push/actions/workflows/docker-image.yml)  [![Codefresh build status]( https://g.codefresh.io/api/badges/pipeline/dhomane/CI%2FCD%20Project%2Fci-cd-test?type=cf-1&key=eyJhbGciOiJIUzI1NiJ9.NjEyMWMyYThiNzk0Zjc3YTEwYmJkMzg0.z73WSEI7fc4Pq-UO6acfTfzsD3nb5HX9xVqcCKlvLlo)]( https://g.codefresh.io/pipelines/edit/new/builds?id=6252fcdaeb1899b5122b3c25&pipeline=ci-cd-test&projects=CI%2FCD%20Project&projectId=6252f6f0402b89a050cefdc7)  [![CircleCI](https://circleci.com/gh/dhomane/ci-cd-pipeline/tree/master.svg?style=svg)](https://circleci.com/gh/dhomane/ci-cd-pipeline/tree/master)  ![](https://codebuild.us-east-1.amazonaws.com/badges?uuid=eyJlbmNyeXB0ZWREYXRhIjoiaGdkQ3IyWk8rdjg2WUVlMTJ3N3FQZk85aVB0eGM0R2x3OEJ3U1FrVEs5OTNUUVlrVURDajkxZW1xMzkrRzVFOTNlZFp4V0IxSkkrMTM1V05kT1Y0NlhjPSIsIml2UGFyYW1ldGVyU3BlYyI6ImgyVGMvQXpwY1JSOWl1VG4iLCJtYXRlcmlhbFNldFNlcmlhbCI6MX0%3D&branch=main)  [![pipeline status](https://gitlab.com/dhomane/cf-example-build-and-push/badges/master/pipeline.svg)](https://gitlab.com/dhomane/cf-example-build-and-push/-/commits/master)



# Example of building and pushing a  docker image 

This is a Git repository that holds a Node application and a Dockerfile. The dockerfile is also at the root folder of the project.

## Packaging the Node.js app

To compile and package using Docker 

```bash
docker build . -t my-app 
```

## Running the docker image

```bash
docker run -p 3000:3000 my-app
```

and then visit http://localhost:3000 in your browser


## To use this project in Codefresh

There is also a [codefresh.yml](codefresh.yml) for easy usage with the [Codefresh](codefresh.io) CI/CD platform.

More details can be found in [Codefresh documentation](https://codefresh.io/docs/docs/yaml-examples/examples/build-and-push-an-image/).

