import userRouters from "./userRoutes.js";
import walletRouters from "./walletRoutes.js";

const initRoutes = (app) => {
    app.use('/api/user', userRouters);
    app.use('/api/wallet', walletRouters);
}

export default initRoutes;