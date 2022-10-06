import Rating from "./Rating";
import prisma from "../db";
import serverSpotify from "../hooks/serverSpotify";
import DatabaseConnector from "../database/connection";
// setup node cache
const NodeCache = require("node-cache");
const myCache = new NodeCache({ stdTTL: 1200 });

const rating = new Rating();

class Vote {
    // Based on user_id, winner_id, loser_id, and ratings of the two tracks from before and after the vote, create a record in the database
    async create(
        user_id,
        winner_id,
        loser_id,
        pre_rating_winner,
        pre_rating_loser,
        post_rating_winner,
        post_rating_loser
    ) {
        return await prisma.vote.create({
            data: {
                user_id: user_id,
                winner_id: winner_id,
                loser_id: loser_id,
                pre_rating_winner: pre_rating_winner,
                pre_rating_loser: pre_rating_loser,
                post_rating_winner: post_rating_winner,
                post_rating_loser: post_rating_loser,
            },
        });
    }

    // Function that votes for a track based on user_id and winner_id and loser_id using the Rating model, then call the create function to create a record in the database
    async vote(user_id, winner_id, loser_id) {
        const calculatedRating =
            await rating.calculateNewRatingAndSetToDatabase(
                winner_id,
                loser_id
            );

        await this.create(
            user_id,
            winner_id,
            loser_id,
            calculatedRating?.pre_winner_rating,
            calculatedRating?.pre_loser_rating,
            calculatedRating?.post_winner_rating,
            calculatedRating?.post_loser_rating
        ).then((result) => {
            // this.addOneToVoteCountOfToday(user_id);
        });
    }

    async getAllUnusedVotes(user_id) {
        const query = `select t1.track_id as 't1', t2.track_id as 't2' from myTrack t1 
                            join myTrack t2
                            left join vote v on (v.user_id = ? 
                                        and (v.winner_id = t1.track_id and v.loser_id = t2.track_id or v.loser_id = t1.track_id and v.winner_id = t2.track_id))
                            where v.id is null AND t1.user_id = ? and t2.user_id = ?
                            and t1.id != t2.id
                            limit 2000`;

        return await new DatabaseConnector().query(query, [
            user_id,
            user_id,
            user_id,
        ]);
    }

    // Function that returns the vote count of the user for today using the user_id and prisma
    // Save the result in the cache for 1200 seconds
    async getVoteCountOfToday(user_id) {
        var today = new Date(new Date().getTime());
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const cacheKey = `voteCountOfToday-${user_id}`;
        const cachedValue = myCache.get(cacheKey);
        if (cachedValue) {
            return cachedValue;
        } else {
            const voteCount = await prisma.vote.count({
                where: {
                    user_id: user_id,
                    created_at: {
                        gte: today,
                        lt: tomorrow,
                    },
                    NOT: {
                        created_at: null,
                    },
                },
            });

            myCache.set(cacheKey, voteCount);
            return voteCount;
        }
    }

    async addOneToVoteCountOfToday(user_id) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const cacheKey = `voteCountOfToday-${user_id}`;
        const cachedValue = myCache.get(cacheKey);
        if (cachedValue) {
            myCache.set(cacheKey, cachedValue + 1);
        } else {
            const voteCount = await prisma.vote.count({
                where: {
                    user_id: user_id,
                    created_at: {
                        gte: today,
                        lt: tomorrow,
                    },
                },
            });

            myCache.set(cacheKey, voteCount + 1);
        }
    }

    async formatTracksForVote(tracks, session) {
        const spotifyApi = await serverSpotify(session);
        tracks = await spotifyApi.getTracks(tracks);

        var formattedTracks = [];
        for (var track of tracks?.body?.tracks) {
            var formattedTrack = {};
            formattedTrack.spotify_id = track.id;
            formattedTrack.name = track.name;
            formattedTrack.artist_name = track.artists[0].name;
            formattedTrack.album_name = track.album.name;
            formattedTrack.album_image = track.album.images[0].url;
            formattedTrack.preview_url = track.preview_url;
            formattedTrack.release_date = new Date(track.album.release_date);

            formattedTrack.rating = (
                await prisma.track.findFirst({
                    where: {
                        spotify_id: track.id,
                    },
                    select: {
                        rating: true,
                    },
                })
            ).rating;

            formattedTracks.push(formattedTrack);
        }

        return formattedTracks;
    }

    async hasUserVotedForTrack(user_id, track_id) {
        if (!user_id || !track_id) {
            return false;
        }

        return (
            (await prisma.vote.count({
                where: {
                    user_id: user_id,
                    OR: [
                        {
                            winner_id: track_id,
                        },
                        {
                            loser_id: track_id,
                        },
                    ],
                },
            })) > 0
        );
    }
}

export default Vote;
