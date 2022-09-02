import { useState } from "react";

export default function RankingTable({ ...props }) {
    const [tracks, setTracks] = useState(props.tracks);

    useState(() => {
        fetch("/api/ranking")
            .then((res) => res.json())
            .then((data) => {
                if (data) {
                    setTracks(data);
                }
            });
    }, []);

    return (
        <div className="flex flex-col items-center justify-center table-responsive">
            <table className="table-auto table-striped">
                <thead>
                    <tr>
                        <th className="px-4 py-2">Rank</th>
                        <th className="px-4 py-2">Track</th>
                        <th className="px-4 py-2">Artist</th>
                        <th className="px-4 py-2">Rating</th>
                    </tr>
                </thead>
                <tbody>
                    {tracks?.map((track, index) => (
                        <tr key={index}>
                            <td className="border px-4 py-2">{index + 1}</td>
                            <td className="border px-4 py-2">{track?.name}</td>
                            <td className="border px-4 py-2">
                                {track?.artist?.name}
                            </td>
                            <td className="border px-4 py-2">
                                {track?.rating}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
