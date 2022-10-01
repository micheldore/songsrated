import { useState, useEffect } from "react";
import RankingFilter from "./rankingfilter";

export default function RankingTable({ ...props }) {
    const [tracks, setTracks] = useState([]);
    const [page, setPage] = useState(1);
    const [per_page, setPerPage] = useState(10);
    const [sort_by, setSortBy] = useState("rating");
    const [sort_order, setSortOrder] = useState("desc");
    const [filter_by, setFilterBy] = useState(null);
    const [filter_value, setFilterValue] = useState(null);
    const [total_pages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetchRanking();
    }, []);

    useEffect(() => {
        fetchRanking();
    }, [page, per_page, sort_by, sort_order, filter_by, filter_value]);

    function fetchRanking() {
        fetch(
            `/api/ranking?page=${page}&per_page=${per_page}&sort_by=${sort_by}&sort_order=${sort_order}&filter_by=${filter_by}&filter_value=${filter_value}`
        )
            .then((res) => res.json())
            .then((data) => {
                if (data) {
                    setTracks(data?.data ?? []);
                    // setPage(data?.page ?? 1);
                    // setPerPage(data?.per_page ?? 10);
                    setTotalPages(data?.total_pages ?? 1);
                }
                setLoading(false);
            });
        // Set loading false after 5 seconds
        setTimeout(() => {
            setLoading(false);
        }, 5000);
    }

    function nextPage() {
        setPage(page + 1);
    }

    function prevPage() {
        setPage(page - 1);
    }

    return (
        <div className="display-block p-5">
            <RankingFilter
                page={page}
                per_page={per_page}
                sort_by={sort_by}
                sort_order={sort_order}
                filter_by={filter_by}
                filter_value={filter_value}
                setPerPage={setPerPage}
                setPage={setPage}
                setSortBy={setSortBy}
                setSortOrder={setSortOrder}
                setFilterBy={setFilterBy}
                setFilterValue={setFilterValue}
                fetchRanking={fetchRanking}
                loading={loading}
            />
            <table className="table table-striped table-responsive table-auto text-left">
                <thead>
                    <tr>
                        <th className="min-w-fit">#</th>
                        <th className="min-w-fit">Track</th>
                        <th className="min-w-fit ranking-artist-name">
                            Artist
                        </th>
                        <th className="min-w-fit ranking-album-name">Album</th>
                        <th className="min-w-fit ranking-album-release-date w-100">
                            Release date
                        </th>
                        <th className="min-w-fit ranking-rating">Score</th>
                    </tr>
                </thead>
                <tbody>
                    {tracks &&
                        tracks?.map((track, index) => (
                            <tr key={index}>
                                <td>#{track?.rank}</td>
                                <td className="ranking-song-name">
                                    {track?.name}
                                </td>
                                <td className="ranking-artist-name">
                                    {track?.artist?.name}
                                </td>
                                <td className="min-w-fit ranking-album-name">
                                    {track?.album?.name}
                                </td>
                                <td className="min-w-fit ranking-album-release-date">
                                    {new Date(
                                        track?.album?.release_date
                                    ).toLocaleDateString()}
                                </td>
                                <td className="min-w-fit ranking-rating">
                                    {track?.rating}
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
            {/* Buttons for the pagination and page size */}
            <div className="flex flex-col justify-center text-black pagination-buttons">
                <div className="flex flex-row justify-center">
                    <button
                        className="m-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                        disabled={page === 1}
                        onClick={prevPage}
                    >
                        Previous
                    </button>
                    <button
                        className="m-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                        disabled={page === total_pages}
                        onClick={nextPage}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
