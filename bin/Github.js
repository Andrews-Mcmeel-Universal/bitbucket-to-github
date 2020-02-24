const request = require("request-promise");
const path = require("path");
const exec = require("util").promisify(require("child_process").exec);

class Github {
  /**
   * Create repositories on Github an array
   * of Bitbucket repositories
   *
   * @param {Array} repositories
   * @returns {Array} of successfully created `repositories`
   */
  static async createRepositories(repositories) {
    console.log(
      `GITHUB: Preparing to create the ${repositories.length} repositories.`
    );
    const successfulRepos = [];
    await Promise.all(
      repositories.map(async repo => {
        try {
          presentOnGithub = await Github.checkRepository(repo);
          createdOnGithub = await Github.createRepository(repo);
          if (Boolean(presentOnGithub) || Boolean(createdOnGithub)) {
            successfulRepos.push(repo);
            console.log(`Already on Github: ${presentOnGithub} | Created on Github: ${createdOnGithub} repository for ${repo.slug}`);
          }
        } catch (error) {
          console.log(`Error creating or finding repository for ${repo.slug}`);
        }
      })
    );
    if (successfulRepos && successfulRepos.length) {
      console.log(
        `GITHUB: Finishing creation of ${successfulRepos.length || 0}/${
          repositories.length
        } repositories.`
      );
    } else {
      console.log(
        `GITHUB: Finished the creation step but 0 new repos were created.`
      );
    }
    return successfulRepos;
  }

  /**
   * Checks to see if the repository exists first before creating a new one on * Github.
   *
   * @param {Object} repository single Bitbucket repo resource
   * @returns {Bolean} success status
   */
  static async checkRepository(repository) {
    console.log(
      `GITHUB: Checking if ${repository.slug} already exists for ${GITHUB_USERNAME}...`
    );
    try {
      // First check to see if the repo already exists
      await request.get({
        url: "https://api.github.com/user/repos/${repository.slug}",
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
        },
        json: true
      });
    } catch (e) {
      // something went wrong, log the message
      // but don't kill the script
      const errors = e.error.errors;

      for (let i = 0; i < errors.length; i++) {
        console.log(
          "Could not find the repo so we will create one.",
          repository.slug + ",",
          errors[i].message + "."
        );
      }
      throw e;
    }
  }

  /**
   * Creates a new repository on Github.
   *
   * @param {Object} repository single Bitbucket repo resource
   * @returns {Bolean} success status
   */
  static async createRepository(repository) {
    console.log(
      `GITHUB: Going to try to create the single repo: ${repository.slug}...`
    );
    try {
      // First check to see if the repo already exists
      // make the request for a new repo
      await request.post({
        url: "https://api.github.com/user/repos",
        body: {
          name: repository.slug,
          description: repository.description,
          private: repository.is_private,
          has_issues: repository.has_issues,
          has_wiki: repository.has_wiki
        },
        headers: {
          "User-Agent": "UA is required",
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
        },
        json: true
      });
    } catch (e) {
      // something went wrong, log the message
      // but don't kill the script
      const errors = e.error.errors;

      for (let i = 0; i < errors.length; i++) {
        console.log(
          "Failed creating repository",
          repository.slug + ",",
          errors[i].message + "."
        );
      }
      throw e;
    }
  }

  /**
   * Push all repositories that have been created or exist on Github.
   *
   * @param {Array} Repositories to be Pushed
   * @returns {Array} Successfully Pushed Repos
   */
  static async pushRepositories(repositories) {
    // keep track of which repos have failed to be pushed to Github
    const successfulRepos = [];
    console.log(
      `GITHUB: Beginning to push the ${repositories.length} repositories`
    );
    await Promise.all(
      repositories.map(async repo => {
        try {
          await Github.pushRepository(repo);
          successfulRepos.push(repo);
          console.log(`successfully pushed repository: ${repo.slug}`);
        } catch (e) {
          console.log(e);
          console.log(`failed to push repository: ${repo.slug}`);
        }
      })
    );
    return successfulRepos;
  }

  /**
   * Push to the repository a new repository on Github.
   *
   * @param {Object} repository single Bitbucket repo resource
   * @returns {Bolean} success status
   */
  static async pushRepository(repository) {
    // set upstream
    // push

    // path to the local repository
    const pathToRepo = path.resolve(
      __dirname,
      "../repositories/",
      repository.slug
    );
    console.log(
      `GITHUB: Pushing the repo: ${repository.slug} from this path ${pathToRepo}`
    );

    // Push the locally cloned repository to GitHub using the "mirror" option, which ensures that all references, such as branches and tags, are copied to the imported repository.
    const commands = ` cd ${pathToRepo} \
                git push --mirror https://${process.env.GITHUB_USERNAME}:${process.env.GITHUB_TOKEN}@github.com/${process.env.GITHUB_USERNAME}/${repository.slug}.git`;
    try {
      // initialize repo
      await exec(commands);
    } catch (e) {
      console.log(e);
      console.log("could not push repository", repository.slug);
    }
  }
}

module.exports = Github;
