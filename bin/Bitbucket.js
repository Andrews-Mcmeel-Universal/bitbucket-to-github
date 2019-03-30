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
    const repoList = [];

    // a page of repos we get back from Bitbucket
    let response = {};

    do {
      const url = response.next || `https://api.bitbucket.org/2.0/repositories/${process.env.BITBUCKET_USERNAME}?page=1`
      // make a request to the Bitbucket API
      response = await request(
        url,
        {
          auth: {
            // fill in Bitbucket credentials in .env file
            user: process.env.BITBUCKET_USERNAME,
            password: process.env.BITBUCKET_PASSWORD
          },
          json: true
        }
      );

      // compile the repos we just got into an array
      repoList.push(...response.values);

      // while there's another page to hit, loop
    } while (response.next);

    return repoList;
  }

  /**
   * Clones repositories from Bitbucket
   * into a local folder
   *
   * @param {Array} repositories
   */
  static async pullRepositories(repositories) {
    const successfulRepos = [];
    await Promise.all(repositories.map(async repo => {
          console.log(`pulling repository ${repo.slug}`)
          try {
            await Bitbucket.pullRepository(repo);
            successfulRepos.push(repo);
            console.log("pulled repository for", repo.slug);
          } catch (error) {
            console.error(`error pulling repository ${repo.slug}`)
          }
        }
      ));

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

    // initialize a folder and git repo on this machine
    // add Bitbucket as a remote and pull
    let commands = `mkdir ${pathToRepo}  \
                && cd ${pathToRepo} \
                && git init \
                && git remote add origin ${repository.links.clone[1].href} \
                && git pull origin master`;
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
