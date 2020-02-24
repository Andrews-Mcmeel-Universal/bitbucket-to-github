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
      `BITBUCKET: Getting the repository list for the organization: ${process.env.BITBUCKET_WORKSPACE_ID}`
    );
    const repoList = [];

    // a page of repos we get back from Bitbucket
    let response = {};

    // page counter for api requests
    let currentPage = 1;

    do {
      const url =
        response.next ||
        `https://api.bitbucket.org/2.0/repositories/${process.env.BITBUCKET_WORKSPACE_ID}?page=${currentPage}`;
      console.log(`BITBUCKET: The current api url being called is: ${url}`);
      // make a request to the Bitbucket API
      response = await request(url, {
        auth: {
          // fill in Bitbucket credentials in .env file.  NOTE: This points at a bitbucket organization, if you'd prefer a user, replace: BITBUCKET_WORKSPACE_ID with BITBUCKET_USERNAME
          user: process.env.BITBUCKET_WORKSPACE_ID,
          password: process.env.BITBUCKET_APP_PASSWORD
        },
        json: true
      });

      // compile the repos we just got into an array
      console.log("BITBUCKET: Pushing repository listing into our array.");
      repoList.push(...response.values);

      // make sure we query the next page next time we call the API
      if (process.env.TEST_MODE === 'true') {
        console.log(
          `BITBUCKET: In is in test mode: ${process.env.TEST_MODE}, do not process all paginated repos.  It will only do the first page.`
        );
      } else {
        currentPage++;
      }

      // while there's another page to hit, loop
    } while (response.next);

    // repoList.slice(process.env.REPO_LIMIT);
      console.log(
        `BITBUCKET: Finished building the entire repo list and the current.`
      );
    return repoList;
  }

  /**
   * Clones repositories from Bitbucket
   * into a local folder
   *
   * @param {Array} repositories
   * @param {Integer} limit
   */
  static async pullRepositories(repositories) {
    const successfulRepos = [];
    // if (limit > 0) {
    //   repositories.slice(limit);
    //   console.log(`The limit has been set to ${limit} and repositories are limited to ${repositories.length}`);
    // }
    await Promise.all(
      repositories.map(async repo => {
        console.log(`pulling repository ${repo.slug}`);
        try {
          await Bitbucket.pullRepository(repo);
          successfulRepos.push(repo);
          console.log("pulled repository for", repo.slug);
        } catch (error) {
          console.error(`error pulling repository ${repo.slug}`);
        }
      })
    );

    return successfulRepos;
  }

  /**
   * Clone a new repository from Bitbucket.
   *
   * @param {Object} repository single Bitbucket repo resource
   * @returns {Bolean} success status
   */
  static async pullRepository(repository) {
    // path to the local repository
    const pathToRepo = path.resolve(
      __dirname,
      "../repositories/",
      repository.slug
    );
    console.log(`BITBUCKET: Preparing to setup a directory here: ${pathToRepo} and then mirror clone this repo: ${repository.links.clone[1].href} `)
    // Creates a brand new local directory for repository.  Navigates into it and mirror clones it from bitbucket.  Finally, adding the remote
    let commands = `mkdir -p ${pathToRepo} \
                && cd ${pathToRepo} \
                && git clone --mirror ${repository.links.clone[1].href}`;
    try {
      // initialize repo
      await exec(commands);
    } catch (e) {
      console.log("couldn't pull repository", repository.slug);
      throw e;
    }
  }
}

module.exports = Bitbucket;
