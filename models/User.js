import prisma from "../db";

class User {
    async getAndOrCreateUser(email, spotify_id) {
        const dbUser = await prisma.user.upsert({
            where: {
                email: email,
            },
            update: {},
            create: {
                email: email,
                spotify_id: spotify_id,
            },
        });

        return dbUser;
    }

    async changeFirstLogin(email, first_login) {
        return await prisma.user.update({
            where: {
                email: email,
            },
            data: {
                first_login: first_login,
            },
        });
    }
}

export default User;
