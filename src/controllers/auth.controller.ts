import bcrypt from "bcryptjs";
import { NextFunction, Request, RequestHandler, Response } from "express";
import createError from "http-errors";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../../config";
import IDataService from "../interfaces/dataService.interface";
import { IUser } from "../models/user";

class AuthController {
    constructor(private userService: IDataService<IUser>) {}

    public loginUser: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
        if (!req.body.username || !req.body.password) {
            return next(createError(400, "Incomplete request"));
        }

        try {
            const user =  await this.userService.getByFields({ username: req.body.username });
            if (!user) { return next(createError(404, "User not found")); }

            const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
            if (!passwordIsValid) { return next(createError(401, "Unauthorized")); }

            const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: 3600 });

            res.send({ auth: true, token});
        } catch (error) {
            return next(createError(500, "Something went wrong"));
        }
    }

    public registerUser: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
        if (!req.body.username || !req.body.password) {
            return next(createError(400, "Incomplete request"));
        }

        try {
            if (await this.userExists(req.body.username, req.body.email)) {
                return next(createError(409, "User already exists"));
            }
        } catch (error) {
            return next(createError(500, "Something went wrong"));
        }

        const hashedPassword = bcrypt.hashSync(req.body.password);

        try {
            const newUser = {
                username: req.body.username,
                password: hashedPassword,
                email: req.body.email || ""
            } as IUser;

            await this.userService.create(newUser);
            const token = jwt.sign({id: newUser._id}, SECRET_KEY, { expiresIn: 3600 });
            res.send({ auth: true, token});
        } catch (error) {
            return next(createError(500, error));
        }
    }

    private userExists = (username: string, email: string) => {
        return this.userService.getByEitherFields([
            { email },
            { username }
        ]);
    }
}

export default AuthController;
