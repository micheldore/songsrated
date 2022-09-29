import { useState, useEffect } from "react";

export default function RankingTable({ ...props }) {
    const [tracks, setTracks] = useState([]);

    useEffect(() => {
        fetch("/api/ranking")
            .then((res) => res.json())
            .then((data) => {
                if (data) {
                    setTracks(data);
                }
            });
    }, []);

    return (
        <div className="display-block p-5">
            <table className="table table-striped table-responsive table-auto">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Track</th>
                        <th className="ranking-artist-name">Artist</th>
                        <th className="ranking-rating">Score</th>
                    </tr>
                </thead>
                <tbody>
                    {tracks &&
                        tracks?.map((track, index) => (
                            <tr key={index}>
                                <td>#{index + 1}</td>
                                <td>{track?.name}</td>
                                <td className="ranking-artist-name">{track?.artist?.name}</td>
                                <td className="ranking-rating">{track?.rating}</td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
}
