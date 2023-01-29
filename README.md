## Ukrainian Cloud API

### Core

Service is written using [NestJS](https://docs.nestjs.com/) framework. To create modules, use [Nest CLI](https://docs.nestjs.com/cli/overview) with `yarn run nest ...` (there is no need to install Nest CLI globally).  
Uses [ESBuild](https://esbuild.github.io/) to bundle production-ready build.

### API

Please, check the full documentation [here](./API.md).

### Development
First, create `.env` file (see example in [.env.example](/.env.example)).  
Next, to start development server locally, run `yarn start:dev` or `yarn start:debug`.  
There is hot-reload available.  
Also there is VSC debug configurations available. Use Ctrl+Shift+D or even F5 to launch project using internal VSC's debug tools.  
After making some feature or bugfix, please additionally test production build.

### Build

#### Docker

To build production-ready Docker image run `docker build .`

#### Local

It's recommended to use Docker builds. But if there is some reason to build the service without Docker, please follow next steps:
1. Ensure you're using proper Node.js version (see [Dockerfile](./Dockerfile))
1. Install all the deps with `yarn install --frozen-lockfile`
1. Run build process with `yarn build`
1. Run `yarn start:prod` (yet tested on Linux only)
