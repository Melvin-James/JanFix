import jwt from "jsonwebtoken";

const generateToken = (
  userId: string,
  role: string
): string => {

  return jwt.sign(
    {
      userId,
      role,
    },

    process.env.JWT_SECRET!,

    {
      expiresIn: "7d",
    }
  );
};

export default generateToken;