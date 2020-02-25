const request = require("request-promise");
const path = require("path");
const exec = require("util").promisify(require("child_process").exec);

class Bitbucket {
  /**
   * Gets all of a user's bitbucket repositories
   *
   * @returns {Array} list of repositories from Bitbucket
   */
  static async getRepositories() {
    // use this to compile a list of our repos
    console.log(
      `BITBUCKET: Retrieving ${process.env.BITBUCKET_WORKSPACE_ID}'s repository list from the bitbucket API...`
    );
    const repositoryList = [];

    // a page of repos we get back from Bitbucket
    let response = {};

    // page counter for api requests
    let currentPage = 1;

    do {
      const pageLength = process.env.REPO_LIMIT ? `&pagelen=${process.env.REPO_LIMIT}` : '';
      const url =
        response.next ||
        `https://api.bitbucket.org/2.0/repositories/${process.env.BITBUCKET_WORKSPACE_ID}?page=${currentPage}${pageLength}`;
      if (process.env.TEST_MODE === "true") {
        console.log(`BITBUCKET: The current api url being called is: ${url}`);
      }
      // Make a request to the Bitbucket API
      response = await request(url, {
        auth: {
          // fill in Bitbucket credentials in .env file.  NOTE: This points at a bitbucket organization, if you'd prefer a user, replace: BITBUCKET_WORKSPACE_ID with BITBUCKET_USERNAME TODO: Make this a friendly option in the settings.
          user: process.env.BITBUCKET_WORKSPACE_ID,
          password: process.env.BITBUCKET_APP_PASSWORD
        },
        json: true
      });

      // Compile the repos we just got into an array
      console.log("BITBUCKET: Pushing repository listing into our array.");
      repositoryList.push(...response.values);

      // Make sure we query the next page next time we call the API
      if (process.env.TEST_MODE === "true") {
        console.log(
          `BITBUCKET: TEST_MODE: ${process.env.TEST_MODE}, do not process all paginated repos.  It will only do the first page and take into account the REPO_LIMIT.`
        );
      } else {
        currentPage++;
      }

      // While there's another page to hit and there is NOT a repo limit, increment.
    } while (
      response.next && (!process.env.REPO_LIMIT || repositoryList.length <= parseInt(process.env.REPO_LIMIT, 10))
    );
    console.log(
      `BITBUCKET: Finished building ${process.env.BITBUCKET_WORKSPACE_ID}'s entire repo list of ${repositoryList.length} repos.`
    );
    return repositoryList;
  }

  /**
   * Clones repositories from Bitbucket
   * into a local folder
   *
   * @param {Array} repositories
   * @param {Integer} limit
   */
  static async pullRepositories(repositories) {
    const successfulRepositories = [];
    await Promise.all(
      repositories.map(async repository => {
        console.log(`Pulling repository ${repository.slug}...`);
        try {
          await Bitbucket.pullRepository(repository);
          successfulRepositories.push(repository);
          console.log(`Successfully pulled the repository: ${repository.slug}`);
        } catch (error) {
          console.error(`Failed to pull the repository: ${repository.slug}`);
        }
      })
    );

    return successfulRepositories;
  }

  /**
   * Clone a new repository from Bitbucket.
   *
   * @param {Object} repository single Bitbucket repo resource
   * @returns {Bolean} success status
   */
  static async pullRepository(repository) {
    // path to the local repository
    const pathToRepository = path.resolve(
      __dirname,
      "../repositories/",
      repository.slug
    );
    // Creates a brand new local directory for repository.  Navigates into it and mirror clones it from bitbucket.  TODO: Make adding the remote and effectively syncing both repos a friendly option in the settings.
    let commands = ` mkdir -p ${pathToRepository} \
                && cd ${pathToRepository} \
                && git clone --mirror ${repository.links.clone[1].href}`;
    try {
      // initialize repo
      await exec(commands);
    } catch (e) {
      console.log(`Failed to pull the repository: ${repository.slug} because of the error: ${e}`);
    }
  }
}

module.exports = Bitbucket;
