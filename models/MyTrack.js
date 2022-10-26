import { getSession } from 'next-auth/react';
import Album from './Album';
import Track from './Track';
import Artist from './Artist';
import prisma from '../db';
import serverSpotify from '../hooks/serverSpotify';
import DatabaseConnector from '../database/connection';
import Vote from './Vote';

const NodeCache = require('node-cache');
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

    async getMyTopTracksFromSpotify(count = 50, time_range = 'short_term') {
        const session = await this.getSession();
        const spotifyApi = await serverSpotify(session);

        return await spotifyApi.getMyTopTracks({
            limit: count,
            time_range: time_range,
        });
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
        if (offset > 10000 || offset < 0) offset = 0;

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

    async getTopTracksFromSpotifyAndInsertInDb(count = 50, time_range = 'short_term') {
        var tracks = [];

        tracks = await this.getMyTopTracksFromSpotify(count, time_range);
        tracks = this.track.getTracksFromResponse(tracks);

        if (!tracks || tracks.length == 0) tracks = await this.getTracksFromSpotify();

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

        for (const track of tracks) formattedMyTracks.push(await this.formatMyTrackForDatabase(track));

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
        if (tracks.length != 2) return false;

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

    async getTwoRandomUnvotedTracks() {
        const session = await this.getSession();
        const user_id = session?.user?.db_id;

        const unusedVotes = await this.getMyUnusedVotes(); // get all unvoted tracks from database

        if (unusedVotes === false) return [];

        // get random track combination from unvoted tracks and remove it from the list of unvoted tracks
        var [newVote, unvotedTracksWithoutNewVote] = this.getRandomItemFromObjectAndRemoveIt(unusedVotes);

        const tracks = [newVote.t1, newVote.t2];

        myCache.set(`${user_id}tracks`, unvotedTracksWithoutNewVote); // update cache with new list of unvoted tracks

        return (await new Vote().formatTracksForVote(tracks, session)) ?? [];
    }

    async getMyUnusedVotes() {
        const session = await this.getSession();
        const user_id = session?.user?.db_id;

        var myUnusedVotes = myCache.get(`${user_id}tracks`);

        if (!myUnusedVotes || myUnusedVotes.length == 0) {
            const currentUnusedVotes = await new Vote().getAllUnusedVotes(user_id, 10);

            if (currentUnusedVotes.length < 10) {
                await this.getTopTracksFromSpotifyAndInsertInDb();
            }
            myUnusedVotes = await new Vote().getAllUnusedVotes(user_id, 10);
        }
        return myUnusedVotes;
    }
}

export default MyTrack;
