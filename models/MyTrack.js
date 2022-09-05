import { getSession } from "next-auth/react";
import Album from "./Album";
import Track from "./Track";
import Artist from "./Artist";
import prisma from "../db";
import serverSpotify from "../hooks/serverSpotify";
import DatabaseConnector from "../database/connection";
import Vote from "./Vote";

const NodeCache = require("node-cache");
const myCache = new NodeCache({ stdTTL: 200 });

class MyTrack {
    constructor(req) {
        this.req = req;
        this.track = new Track();
        this.album = new Album();
        this.artist = new Artist();
    }

    async getSession() {
        const req = this.req;
        return await getSession({ req });
    }

    async getMyTopTracksFromSpotify(count = 50) {
        const session = await this.getSession();
        const spotifyApi = await serverSpotify(session);
        return await spotifyApi.getMyTopTracks({ limit: count });
    }

    async getOffsetFromDatabase() {
        const session = await this.getSession();
        const user = await prisma.user.findFirst({
            where: {
                id: session?.user?.db_id,
            },
            select: {
                offset: true,
            },
        });

        return user?.offset ?? 0;
    }

    async setOffsetInDatabase(offset) {
        // Check if offset is higher than 10000 and lower than 0, if so reset to 0
        if (offset > 10000 || offset < 0) {
            offset = 0;
        }
        const session = await this.getSession();

        return await prisma.user.update({
            where: {
                id: session?.user?.db_id,
            },
            data: {
                offset: offset,
            },
        });
    }

    // Get track from my spotify tracks library
    async getTracksFromSpotify() {
        const spotifyApi = await serverSpotify(await this.getSession());
        const offset = await this.getOffsetFromDatabase();
        const tracks = await spotifyApi.getMySavedTracks({
            limit: 50,
            offset: offset,
        });
        const len = tracks?.body?.items?.length ?? 0;
        await this.setOffsetInDatabase(offset + Math.min(len, 50));
        var formattedTracks = [];

        for (const track of tracks?.body?.items) {
            if (track?.track?.id && track?.track?.preview_url) {
                formattedTracks.push(track?.track);
            }
        }
        return formattedTracks;
    }

    async getTopTracksFromSpotifyAndInsertInDb(topTracks = false) {
        var tracks = [];
        if (topTracks) {
            tracks = await this.getMyTopTracksFromSpotify();
            tracks = this.track.getTracksFromResponse(tracks);
        } else tracks = await this.getTracksFromSpotify();

        var promises = [];
        promises.push(this.insert(tracks));
        promises.push(this.track.insert(tracks));
        promises.push(this.album.insert(tracks));
        promises.push(this.artist.insert(tracks));

        return await Promise.all(promises);
    }

    // Function that inserts formatted myTracks into the database
    async insert(tracks) {
        return await prisma.myTrack.createMany({
            data: await this.formatTracksToMyTracksForDatabase(tracks),
            skipDuplicates: true,
        });
    }

    // Format a list of tracks to a list of myTracks for insertion into the database
    async formatTracksToMyTracksForDatabase(tracks) {
        var formattedMyTracks = [];

        for (const track of tracks) {
            formattedMyTracks.push(await this.formatMyTrackForDatabase(track));
        }

        return formattedMyTracks;
    }

    // Function that formats a track object from spotify for insertion as a myTrack object into the database
    async formatMyTrackForDatabase(track) {
        const session = await this.getSession();
        const user_id = session?.user?.db_id;

        return {
            track_id: track?.id,
            user_id: user_id,
        };
    }

    getTwoRandomSongsFromMyTracks(arr, n = 2) {
        const shuffled = arr.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, n);
    }

    async checkIfTracksHaveNotVoted(tracks) {
        // check if tracks contain two tracks
        if (tracks.length != 2) {
            return false;
        }

        const [track1, track2] = tracks;
        const session = await this.getSession();
        const user_id = session?.user?.db_id;

        const isFound = await prisma.vote.findFirst({
            where: {
                OR: [
                    {
                        user_id: user_id,
                        winner_id: track1?.track_id,
                        loser_id: track2?.track_id,
                    },
                    {
                        user_id: user_id,
                        winner_id: track2?.track_id,
                        loser_id: track1?.track_id,
                    },
                ],
            },
        });
        if (isFound == null) return true;
        else return false;
    }

    async getMyTracksFromDB(user_id) {
        return await prisma.myTrack.findMany({
            where: {
                user_id: user_id,
            },
            select: {
                track_id: true,
            },
        });
    }

    // Function that removes random item from object and returns the item and new object in an array
    getRandomItemFromObjectAndRemoveIt(obj) {
        var keys = Object.keys(obj);
        var randomIndex = Math.floor(Math.random() * keys.length);
        var randomKey = keys[randomIndex];
        var randomItem = obj[randomKey];
        delete obj[randomKey];
        return [randomItem, obj];
    }

    // Function that returns a list of all the combinations of two tracks from a list of tracks that have not been voted on by the user
    async getMyUnvotedTracks() {
        const session = await this.getSession();
        const user_id = session?.user?.db_id;

        var myTracks = myCache.get(`${user_id}tracks`);

        if (
            !myTracks ||
            (typeof myTracks == "object" && Object.keys(myTracks).length == 0)
        ) {
            myTracks = await new Vote().getAllUnusedVotes(user_id);
            if (
                typeof myTracks == "object" &&
                Object.keys(myTracks).length == 0
            ) {
                await this.getTopTracksFromSpotifyAndInsertInDb(true);
                myTracks = await new Vote().getAllUnusedVotes(user_id);
            }

            if (Object.keys(myTracks).length == 0) {
                myTracks = false;
            }

            myCache.set(`${user_id}tracks`, myTracks);
            return myTracks;
        } else {
            return myTracks;
        }
    }

    async getTwoRandomUnvotedTracks() {
        const session = await this.getSession();
        const user_id = session?.user?.db_id;

        const unvotedTracks = await this.getMyUnvotedTracks(); // get all unvoted tracks from database

        if (unvotedTracks === false) return [];
        var [randomTrack, unvotedTracksWithoutTheseTracks] =
            this.getRandomItemFromObjectAndRemoveIt(unvotedTracks); // get random track combination from unvoted tracks and remove it from the list of unvoted tracks
        const tracks = [randomTrack.t1, randomTrack.t2];

        myCache.set(`${user_id}tracks`, unvotedTracksWithoutTheseTracks); // update cache with new list of unvoted tracks

        return (await new Vote().formatTracksForVote(tracks, session)) ?? [];
    }
}

export default MyTrack;
