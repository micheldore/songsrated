import Rating from "./Rating";
import prisma from "../db";

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
        );
    }
}

export default Vote;