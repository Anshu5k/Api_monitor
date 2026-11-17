import logger from "../../../shared/config/logger.js";
import jwt from "jsonwebtoken";
import config from "../../../shared/config/index.js";
import bcrypt from "bcryptjs";
import { APPLICATION_ROLES } from "../../../shared/constants/roles.js";
import AppError from "../../../shared/utils/AppError.js";

/**
 * AuthService handles user authentication and authorization related operations such as onboarding super admin, user registration, login, and fetching user profile.
 * It interacts with the UserRepository to perform these operations and generates JWT tokens for authenticated users.
 */

export class AuthService {
  constructor(userRepository) {
    if (!userRepository) {
      throw new Error("User Repository is required");
    }

    this.userRepository = userRepository;
  }

  /**
   * Generates a JWT token for the given user.
   * @param {Object} user - The user object for which the token is generated.
   * @returns {string} - The generated JWT token.
   */

  generateToken(user) {
    const { _id, role, username, email, clientId } = user;
    const payload = {
      userId: _id,
      username,
      email,
      role,
      clientId,
    };
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  /**
   * Formats the user object for response by removing sensitive information.
   * @param {Object} user - The user object to be formatted.
   * @returns {Object} - The formatted user object.
   */

  formatUserForResponse(user) {
    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;
    return userObj;
  }
  /**
   * Compares the user-entered password with the hashed password.
   * @param {string} userEnteredPassword - The password entered by the user.
   * @param {string} hashedPassword - The hashed password stored in the database.
   * @returns {Promise<boolean>} - Returns true if the passwords match, otherwise false.
   */
  async comparePassword(userEnterPassword, hashedPassword) {
    return await bcrypt.compare(userEnterPassword, hashedPassword);
  }

  /**
   * Onboards a new super admin user.
   * @param {Object} superAdminData - The data of the super admin to be onboarded.
   * @returns {Promise<Object>} - Returns an object containing the user and token.
   */

  async onboardSuperAdmin(superAdminData) {
    try {
      const existingUser = await this.userRepository.findAll();
      console.log("existing user",existingUser);
      if (existingUser && existingUser.length > 0) {
        throw new AppError("Super Admin Onboarding is disabled", 403);
      }
      const user = await this.userRepository.create(superAdminData);
      const token = this.generateToken(user);
      logger.info("user Onboarded successfully", {
        username: user.username,
      });
      return {
        user: this.formatUserForResponse(user),
        token,
      };
    } catch (err) {
      logger.error("Error in onboarding super admin");
      throw err;
    }
  }
  /**
   * Registers a new user.
   * @param {Object} userData - The data of the user to be registered.
   * @returns {Promise<Object>} - Returns an object containing the user and token.
   */
  async register(userdata) {
    try {
      const existingUser = await this.userRepository.findByUserName(
        userdata.username,
      );
      if (existingUser) {
        throw new AppError("userName already exist", 409);
      }
      const existingEmail = await this.userRepository.findByEmail(userdata.email);
      if (existingEmail) {
        throw new AppError("email already exist", 409);
      }
      const user = await this.userRepository.create(userdata);
      const token = this.generateToken(user);
      logger.info("User Register Successfully", {
        username: user.username,
      });
      return {
        user: this.formatUserForResponse(user),
        token,
      };
    } catch (err) {
      logger.error("Error in register service", err);
      throw err;
    }
  }

  /**
   * Logs in a user.
   * @param {string} username - The username of the user.
   * @param {string} password - The password of the user.
   * @returns {Promise<Object>} - Returns an object containing the user and token.
   */
  async login(username, password) {
    const user =await  this.userRepository.findByUserName(username);
    if (!user) {
      throw new AppError("Invalid credential", 401);
    }
    if (!user.isActive) {
      throw new AppError("User is deActivated", 403);
    }
    const isValidPassword = await this.comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new AppError("Invalid Credential", 401);
    }
    const token = this.generateToken(user);
    logger.info("user login successfully", {
      username: user.username,
    });
    return {
      user: this.formatUserForResponse(user),
      token,
    };
  }
  /**
   * Fetches the profile of a user by their ID.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<Object>} - Returns the user's profile data.
   */
  async getProfile(userId) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw AppError("User not found", 404);
      }
      return this.formatUserForResponse(user);
    } catch (err) {
      logger.error("User not found for this id", err);
      throw err;
    }
  }
  async checkSuperAdminPermissions(userId) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new AppError("User not found", 404);
      }
      return user.role === APPLICATION_ROLES.SUPER_ADMIN;
    } catch (err) {
      throw err;
    }
  }
}
