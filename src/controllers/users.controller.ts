import {
    NextFunction,
    Request,
    RequestHandler,
    Response } from "express";
import createError from "http-errors";
import { User } from "../models/user";
import UserService from "../services/user.service";

const getUsers: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const users = await UserService.getAll();
        res.send(users);
	} catch (error) {
		return next(createError(500, "Something went wrong"));
	}
};

const getUserById: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
	if (req.userId !== req.params.id) { return next(createError(401, "Not authorized")); }

	try {
		// const user = await User.findById(req.userId, { password: 0 }).populate("portfolios").exec();
		const user = await UserService.get(req.params.id);
		res.send(user);
	} catch (error) {
		return next(createError(500, "Something went wrong"));
	}
};

//TODO: Add authorization to this endpoint.  Only admin user should be able to perform this action
const deleteUser: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const deletedUser = await UserService.delete(req.params.id);
		res.send(deletedUser);
	} catch (error) {
		return next(createError(500, "Something went wrong"));
	}
};

export {
    deleteUser,
    getUsers,
    getUserById,
};
