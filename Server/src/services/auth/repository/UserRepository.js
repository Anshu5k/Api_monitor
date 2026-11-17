import User from "../../../shared/models/User.js";
import BaseRepository from "./BaseRepository.js";
import logger from "../../../shared/config/logger.js";

class MongoUserRepository extends BaseRepository {
  /**
   * MongoDB implementation of the UserRepository.
   * This class provides methods to interact with the User collection in MongoDB.
   */
  constructor() {
    super(User);
  }

  /**
   * Creates a new user in the database.
   * @param {Object} userData - The data of the user to be created.
   * @returns {Promise<Object>} - Returns the created user object.
   */

  async create(userData) {
    try {
     
      let data = { ...userData };
     
      if (data.role === "super_admin" && !data.permissions) {
        data.permissions = {
          canCreateApiKeys: true,
          canManageUsers: true,
          canViewAnalytics: true,
          canExportData: true,
        };
      }
        const user = new this.model(data);
         console.log(user,"jdksfhreffd")
        await user.save();
        logger.info("user created", { username: user.username });
        return user;
      }
    catch (err) {
      logger.error("Error creating user", err);
      throw err;
    }
  }

  /**
   * Finds a user by their ID.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<Object>} - Returns the user object if found.
   */
  async findById(userId) {
    try {
      const user = await this.model.findById(userId);
      return user;
    } catch (err) {
      logger.error("Error to find User by userId", err);
      throw err;
    }
  }
  /**
   * Finds a user by their username.
   * @param {string} username - The username of the user.
   * @returns {Promise<Object>} - Returns the user object if found.
   */

  async findByUserName(username) {
    try {
      console.log(username,"username");
      const user = await this.model.findOne({username});
      console.log(user,"user")
      return user;
    } catch (err) {
      logger.error("Error to find User by username", err);
      throw err;
    }
  }
  /**
   * Finds a user by their email.
   * @param {string} email - The email of the user.
   * @returns {Promise<Object>} - Returns the user object if found.
   */
  async findByEmail(useremail) {
    try {
      const user = await this.model.findOne({useremail});
      return user;
    } catch (err) {
      logger.error("Error to find User by email", err);
      throw err;
    }
  }

  /**
   * Finds all active users.
   * @returns {Promise<Array>} - Returns an array of active user objects.
   */
  async findAll() {
    try {
      const user = this.model.find({ isActive: true }).select("-password");
      return user;
    } catch (err) {
      logger.error("Error to find User", err);
      throw err;
    }
  }
}
export default new MongoUserRepository();
