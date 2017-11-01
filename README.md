# Millennium-Data-Model-Visualizer
https://jira2.cerner.com/browse/ACADEM-23715

## Installation Instructions

- After cloning down the initial repository you will need to install MySQL Database from
[this link](https://dev.mysql.com/downloads/file/?id=467606).
  - The installer includes a number of extra software. You can either choose to install the "Developer Suite," which installs all the optional extra software, or you can manually choose which applications to install individually.
  - You will *need* to install the MySQL Database, but you can optionally install the MySQL Workbench for a GUI interface.
  - The credentials you should use when creating your database are:
    - user name: 'root'
    - password: 'root'
- This project also requires Node. Download the current LTS release from
[their site](https://nodejs.org/en/).
- Once Node and MySQL are installed the project build tool ([Grunt](https://gruntjs.com))
  will need its command line tool installed globally. From a command prompt (PowerShell
  and Git Bash also work) run `npm install -g grunt-cli`.
- Next navigate to the project repository from the command line and install the project
specific dependencies via `npm install`.
- The node project needs to connect to a database. Create a database via the MySQL
Command Line Client.
  - Open a MySQL Command Line Client and login using the credentials you created upon
  installation.
  - Once connected, create the database millennium_db with the following command:
    - `CREATE DATABASE millennium_db;`
  - If you have any difficulties, consider [following along with a tutorial](https://www.w3schools.com/sql/sql_create_table.asp).
  - Alternatively, you can make changes through the MySQL Workbench GUI if you installed it in the first step.
  - If you run into other startup difficulties, the `Gruntfile.js` and `knexfile.js` files contain a number of hardcoded config
  options that might be causing issues.

## Run Instructions

### Command line

#### Web Server

In a command line, from the project repository, run `grunt`. This will start the application.
It connects to the database and runs a web server accessible from
[http://localhost:3000](http://localhost:3000).

#### Unit Tests

Unit tests can be run on their own via `grunt test` or `npm test`. `npm test` just runs grunt
test.

Grunt will also automatically run all tests in the `test/` directory when you start the
project with `grunt` or `npm start`.

The code coverage tool used is
[grunt-mocha-istanbul](https://www.npmjs.com/package/istanbul-grunt-mocha) which gives a
general coverage report on the console. To view reports for individual files look in the
`coverage/lcov-report/Millennium-Data-Model-Visualizer` directory at the corresponding
html files. If you load those in a browser you will see a visual interface showing the
code coverage.

#### Mutation Tests

Mutations testing is done via [Stryker](https://www.npmjs.com/package/stryker).
The Mocha [framework](https://github.com/stryker-mutator/stryker/tree/master/packages/stryker-mocha-framework)
and [runner](https://github.com/stryker-mutator/stryker/tree/master/packages/stryker-mocha-runner) for Stryker
have been installed. Thus, Stryker can (and does) use the project's Mocha unit tests.

While developing there are three main ways of using Stryker:

- Command line arguments, as documented [here](https://github.com/stryker-mutator/stryker#usage).
  This is not recommended as temporarily altering the config file is likely easier.
- Running Stryker based on the config file, stryker.conf.js. Currently, doing so runs tests against most of the server.
  A npm command has been set up to make this easier. Entering "npm run mutationTest" runs the mutation testing
  based on stryker.conf.js. Output is displayed on the console and as html in a project level folder,
  /stryker_report.
- Changing the config file and running Stryker with the alterations. Instructions for the config file can be
  found [here](https://github.com/stryker-mutator/stryker/blob/master/packages/stryker/README.md#configuration).
  However, reading the entire README is recommended. The current config file can also serve as a guide.

Current Limitations:

- The use of jQuery and JSDom currently throw errors due to a missing DOM object.
- Objects with a limited number of listeners throw errors as the maximum number of listeners is exceeded.

#### Updating the Database

This project has database migration built in using [knex.js](http://knexjs.org).

To get the latest version of the migration run the following command:
  - `knex migrate:latest`

To revert the changes and go back to a previous version of the migration (or revert to nothing in the database) use the command:
  - `knex migrate:rollback`
  
Creating the large database:
  - In order to generate the large database, you must create the database "large_db" in your local MySQL server.
  - Then, you must run the following knex command: `knex migrate:latest --env large_db`.
  - The database is generated "randomly", but seeded so that it is generated the same way every time.
  - Tp view the large database in app, change the displayed database in the UI controls to "large_db".

#### Linting

Grunt will automatically lint all javascript files in `app/`, `public/`, and will also lint
`Gruntfile.js` for any style errors.

Lint rules can be configured in the `.eslintrc.json` file.
