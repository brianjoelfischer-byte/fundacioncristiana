import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { env } from "../config/env";

export const generateAccessToken = (userId: string, email: string, role: string) => {
  return jwt.sign(
    { id: userId, email, role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRE }
  );
};

export const generateRefreshToken = (userId: string) => {
  return jwt.sign(
    { id: userId },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRE }
  );
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, env.JWT_SECRET) as {
    id: string;
    email: string;
    role: string;
  };
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as {
    id: string;
  };
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};
