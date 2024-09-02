# Celso Santos - Code Challenge

## Candidate

- Celso Santos (celso.bemsantos@gmail.com)

## Summary

This is a small Node.js + Express application (in Typescript) that will manage a set of Bloqs, their respective Lockers and Rents.

## Install

1. Install [node.js](https://nodejs.org/en/download/), and npm.
2. Navigate to its directory.
3. Run `npm install` to install the dependencies.

## Build & Run

1. Copy the contents of the `.env.example` file to a `.env` next to it, and edit it with your values.
2. Run `npm build` to build the files.
3. Run `npm start` to start the application.

-   You can run `npm dev` to combine the 2 steps above, while listening to changes and restarting automatically.

## Run with Docker

1. Build:

    ```
    docker build -t my-app .
    ```

    Replacing `my-app` with the image name.

2. Run
    ```
    docker run -d -p 3000:3000 my-app
    ```
    Replacing `my-app` with the image name, and `3000:3000` with the `host:container` ports to publish.

## "Live" Testing the API

To test the API you can use the provided `api.http` file (if you have a compatible plugin), or alternative you can use curl (assuming the app runs on port 3000)

```shell
# To return a "Hello!" indicating the app is live and working
curl --request GET \
  --url http://localhost:3000/ \
  --header 'content-type: "application/json"'

# This is a healthcheck
curl --request GET \
  --url 'http://localhost:3000/health' \
  --header 'content-type: "application/json"'

```

## Developing

### Visual Studio Code

-   Installing the Eslint (`dbaeumer.vscode-eslint`) and Prettier - Code formatter (`esbenp.prettier-vscode`) extensions is recommended.

## Linting & Formatting

-   Run `npm lint` to lint the code.
-   Run `npm format` to format the code.

## Testing

-   Run `npm test` to execute all tests.
-   Run `npm test:watch` to run tests in watch (loop) mode.
-   Run `npm test:coverage` to see the tests coverage report.
