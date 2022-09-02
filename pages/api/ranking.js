import Rating from "../../models/Rating";

export default async (req, res) => {
    // if method is not get, return error
    if (req.method !== "GET") {
        res.statusCode = 405;
        res.end();
        return;
    }

    const rating = new Rating();
    res.json(await rating.getTracks());
};
