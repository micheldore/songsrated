import Vote from '../../../models/Vote';

export default async (req, res) => {
    // Check if method is post, if not return error
    if (req.method !== 'POST' && req.method !== 'GET') {
        res.statusCode = 405;
        res.end();
        return;
    }

    if (req.method === 'POST') {
        const vote = new Vote();
        await vote.set(req, res);
    }

    if (req.method === 'GET') {
        const vote = new Vote();
        await vote.get(req, res);
    }
};
