import { exit } from 'process';
import Rating from '../../models/Rating';

// Initiate node cache
const NodeCache = require('node-cache');
const myCache = new NodeCache({ stdTTL: 60 * 60 * 24 });

export default async (req, res) => {
    // if method is not get, return error
    if (req.method !== 'GET') {
        res.statusCode = 405;
        res.end();
        return;
    }

    // get tracks from cache
    var tracks = myCache.get('ranking');
    const rating = new Rating();

    // if tracks are not in cache, get them from the database
    if (!tracks) {
        tracks = await rating.getTracks();
        myCache.set('ranking', tracks);
    }

    // get page and filter arguments from query
    const page = req.query.page ?? 1;
    const per_page = req.query.per_page ?? 10;
    const sort_by = req.query.sort_by ?? 'rating';
    const sort_order = req.query.sort_order ?? 'desc';
    const filter_by = req.query.filter_by ?? null;
    const filter_value = req.query.filter_value ?? null;

    res.json(await rating.paginateTracks(page, per_page, sort_by, sort_order, filter_by, filter_value, tracks));
};
