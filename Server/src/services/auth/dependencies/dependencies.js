import AuthController from "../controller/authController.js";
import MongoUserRepository from "../repository/UserRepository.js"
import { AuthService } from "../services/authservice.js";
class Container{
    /**
 * Dependency Injection Container for the Auth module.
 * This container initializes and manages the dependencies for the Auth module,
 * including repositories, services, and controllers.
 */
  static init()
  {
    const repositories ={
        userRepository : MongoUserRepository
    };
    const services={
        authservice:new AuthService(repositories.userRepository)
    }
    const controller={
        authController:new AuthController(services.authservice)
    }
     return {
            repositories, services, controller
        }
  }

}
const initialized=Container.init();
export {Container};
export default initialized;