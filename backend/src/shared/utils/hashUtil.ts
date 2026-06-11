import bcrypt from "bcryptjs";

export const hashData = async (data: string, saltRounds: number = 10): Promise<string> => {
    return await bcrypt.hash(data, saltRounds);
};

export const compareData = async (data: string, encryptedData: string): Promise<boolean> => {
    return await bcrypt.compare(data, encryptedData);
};
