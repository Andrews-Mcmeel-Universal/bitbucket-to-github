const Bitbucket = require("./bin/Bitbucket");
const Github = require("./bin/Github");
require("dotenv").config();

// load in our environment variables
// node -r dotenv/config index.js

console.log(
  `MIGRATER: Loaded your dotenv vars: ${process.env.BITBUCKET_WORKSPACE_ID} and TEST_MODE=${process.env.TEST_MODE}`
);

(async () => {
  // get all the bitbucket repositories we're going to transfer
  const repositories = await Bitbucket.getRepositories();
  console.log(`********** STEP 1: Has successfully finished!\r\nREPOS RETRIEVED FROM BITBUCKET: ${repositories.length}`);



  // create a new repository on Github for the repos
  const successfulCreates = await Github.createRepositories(repositories);
  if (successfulRepos !== undefined && successfulRepos.length) {
    console.log(
      `********** STEP 2: Has successfully finished!\r\nREPOS CREATED: ${successfulRepos.length} / ${repositories.length}`
    );
  } else {
    console.log(
      "********** STEP 2: Has finished.  However there were 0 repos created."
    );
  }



  // clone into a local folder
  const successfulClones = await Bitbucket.pullRepositories(successfulCreates);
  if (successfulRepos && successfulRepos.length) {
    console.log(
      `********** STEP 3: Has successfully finished!\r\nREPOS CLONED LOCALLY: ${successfulRepos.length} / ${repositories.length}`
    );
  } else {
    console.log(
      "********** STEP 3: Has finished.  However there were 0 repos cloned."
    );
  }



  // Push to Github
  const successfulPushes = await Github.pushRepositories(successfulClones);
  if (successfulRepos && successfulRepos.length) {
    console.log(
      `********** STEP 4: Has successfully finished!\r\nREPOS MIGRATED: ${successfulRepos.length} / ${repositories.length}`
    );
  } else {
    console.log(
      "********** STEP 4: Has finished.  However there were 0 repos pushed."
    );
  }
})();
