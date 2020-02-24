const Bitbucket = require("./bin/Bitbucket");
const Github = require("./bin/Github");
const dotenv = require("dotenv");

// load in our environment variables
// node -r dotenv/config index.js

console.log(
  `MIGRATER: Loaded your dotenv vars: ${process.env.BITBUCKET_WORKSPACE_ID} and TEST_MODE=${process.env.TEST_MODE}`
);

(async () => {
  // get all the bitbucket repositories we're going to transfer
  const repositories = await Bitbucket.getRepositories();

  // create a new repository on Github for the repos
  const successfulCreates = await Github.createRepositories(repositories);

  // clone into a local folder
  const successfulClones = await Bitbucket.pullRepositories(successfulCreates);

  // push to Github
  const succesfulPushes = await Github.pushRepositories(successfulClones);

  console.log(
    `The Bitbucket-to-Github Migrater has successfully finished!\r\nREPOS MIGRATED: ${succesfulPushes
      .map(repo => repo.slug)
      .join("\r\n")} / ${repositories.length}`
  );
})();
