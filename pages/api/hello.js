import Database from "../../models/Database";

export default async function handler(req, res) {
    res.json(await new Database().query("SELECT * FROM tracks"));
}
