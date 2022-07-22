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
