const Elo = require("arpad");
const uscf = {
    default: 32,
    1800: 28,
    2100: 24,
    2400: 16,
};
const min_score = 100;
const max_score = 10000;
import prisma from "../db";

class Rating {
    elo = null;

    constructor() {
        this.elo = new Elo(uscf, min_score, max_score);
    }

    // Get first 100 tracks from the database
    async getTracks() {
        var tracks = await prisma.track.findMany({
            select: {
                name: true,
                artist: {
                    select: {
                        name: true,
                    },
                },
                album: {
                    select: {
                        release_date: true,
                        name: true,
                    },
                },
                rating: true,
            },
            orderBy: {
                rating: "desc",
            },
        });

        // Add ranking number to each track
        for (var i = 0; i < tracks.length; i++) {
            tracks[i].rank = i + 1;
        }

        return tracks;
    }

    // Function to paginate the tracks
    // The tracks can be sorted by rating, song name, artist name, album name or release date
    // The tracks can be sorted in ascending or descending order
    // The tracks can be filtered by rating, song name, artist name, album name or release date
    async paginateTracks(
        page,
        per_page,
        sort_by,
        sort_order,
        filter_by,
        filter_value,
        tracks
    ) {
        // Get the total number of tracks
        const total = tracks.length;

        // Get the total number of pages
        const total_pages = Math.ceil(total / per_page);

        // Get the start index of the tracks
        const start_index = (page - 1) * per_page;

        // Get the end index of the tracks
        const end_index = page * per_page;

        var results = tracks;

        // Sort the tracks
        if (sort_by) {
            if (sort_by === "rating") {
                results.sort((a, b) => {
                    if (sort_order === "asc") {
                        return a.rating - b.rating;
                    } else {
                        return b.rating - a.rating;
                    }
                });
            } else if (sort_by === "name") {
                results.sort((a, b) => {
                    if (sort_order === "asc") {
                        return a.name.localeCompare(b.name);
                    } else {
                        return b.name.localeCompare(a.name);
                    }
                });
            } else if (sort_by === "artist") {
                results.sort((a, b) => {
                    if (sort_order === "asc") {
                        return a.artist.name.localeCompare(b.artist.name);
                    } else {
                        return b.artist.name.localeCompare(a.artist.name);
                    }
                });
            } else if (sort_by === "album") {
                results.sort((a, b) => {
                    if (sort_order === "asc") {
                        return a.album.name.localeCompare(b.album.name);
                    } else {
                        return b.album.name.localeCompare(a.album.name);
                    }
                });
            } else if (sort_by === "release_date") {
                results.sort((a, b) => {
                    if (sort_order === "asc") {
                        return a.album.release_date.localeCompare(
                            b.album.release_date
                        );
                    } else {
                        return b.album.release_date.localeCompare(
                            a.album.release_date
                        );
                    }
                });
            }
        }

        // Filter the tracks
        if (filter_by) {
            if (filter_by === "rating") {
                results = results.filter((track) => {
                    return track.rating === filter_value;
                });
            } else if (filter_by === "name") {
                results = results.filter((track) => {
                    return track.name === filter_value;
                });
            } else if (filter_by === "artist") {
                results = results.filter((track) => {
                    return track.artist.name === filter_value;
                });
            } else if (filter_by === "album") {
                results = results.filter((track) => {
                    return track.album.name === filter_value;
                });
            } else if (filter_by === "release_date") {
                results = results.filter((track) => {
                    return track.album.release_date === filter_value;
                });
            }
        }

        // Get the tracks for the current page
        results = tracks.slice(start_index, end_index);

        // Return the tracks for the current page
        return {
            page: page,
            per_page: per_page,
            total: total,
            total_pages: total_pages,
            data: results,
        };
    }

    // Get the rating for a track from the database
    async getRating(track_id) {
        const track = await prisma.track.findFirst({
            where: {
                spotify_id: track_id,
            },
            select: {
                rating: true,
            },
        });

        if (!track) {
            return 0;
        }

        return track?.rating ?? 0;
    }

    // Set the rating for a track in the database
    async setRating(track_id, rating) {
        await prisma.track.update({
            where: {
                spotify_id: track_id,
            },
            data: {
                rating: rating,
            },
        });
    }

    // Calculate the new rating for a track based on the winner and loser
    async calculateNewRatingAndSetToDatabase(winner_id, loser_id) {
        const pre_winner_rating = await this.getRating(winner_id);
        const pre_loser_rating = await this.getRating(loser_id);

        let odds_winner_winning = this.elo.expectedScore(
            pre_winner_rating,
            pre_loser_rating
        );
        var new_winner_rating = this.elo.newRating(
            odds_winner_winning,
            1.0,
            pre_winner_rating
        );

        let odds_loser_winning = this.elo.expectedScore(
            pre_loser_rating,
            pre_winner_rating
        );
        var new_loser_rating = this.elo.newRating(
            odds_loser_winning,
            0.0,
            pre_loser_rating
        );

        await this.setRating(winner_id, new_winner_rating);
        await this.setRating(loser_id, new_loser_rating);

        return {
            pre_winner_rating: pre_winner_rating,
            pre_loser_rating: pre_loser_rating,
            post_winner_rating: new_winner_rating,
            post_loser_rating: new_loser_rating,
        };
    }
}

export default Rating;
