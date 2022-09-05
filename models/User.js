import prisma from "../db";
import MyTrack from "./MyTrack";

class User {
    async getAndOrCreateUser(email, spotify_id, sessionCheck = false) {
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

        if (false) {
            if (dbUser?.first_login || false) {
                await this.changeFirstLogin(email, false);
                await new MyTrack().getTopTracksFromSpotifyAndInsertInDb(true);
            }
        }

        return dbUser;
    }

    async changeFirstLogin(email, first_login) {
        return await prisma.user.update({
            where: {
                email: email,
            },
            data: {
                first_login: first_login,
                // add last activity with current date and time in Amsterdam timezone
                last_activity: new Date(
                    new Date().toLocaleString("nl-NL", {
                        timeZone: "Europe/Amsterdam",
                    })
                ),
            },
        });
    }

    async updateLastActivity(email) {
        return await prisma.user.update({
            where: {
                email: email,
            },
            data: {
                // add last activity with current date and time in Amsterdam timezone
                last_activity: new Date(
                    new Date().toLocaleString("nl-NL", {
                        timeZone: "Europe/Amsterdam",
                    })
                ),
            },
        });
    }
}

export default User;
