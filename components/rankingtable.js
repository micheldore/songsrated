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
                        <th>Artist</th>
                        <th>Score</th>
                    </tr>
                </thead>
                <tbody>
                    {tracks &&
                        tracks?.map((track, index) => (
                            <tr key={index}>
                                <td>#{index + 1}</td>
                                <td>{track?.name}</td>
                                <td>{track?.artist?.name}</td>
                                <td>{track?.rating}</td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
}
