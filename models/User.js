import prisma from "../db";

class User {
    async getAndOrCreateUser(email, spotify_id) {
        return await prisma.user.upsert({
            where: {
                email: email,
            },
            update: {},
            create: {
                email: email,
                spotify_id: spotify_id,
            },
        });
    }
}

export default User;
