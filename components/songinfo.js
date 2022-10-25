import { useState, useEffect } from "react";
import ReactAudioPlayer from "react-audio-player";

export default function SongInfo({ ...props }) {
    const [player, setSongPlayer] = useState(null);
    const [isPlaying, setPlayingStatus] = useState(false);

    function changePlayState() {
        setPlayingStatus(!isPlaying);
    }

    useEffect(() => {
        if (player !== null) {
            if (isPlaying) {
                player.play();
            } else {
                player.pause();
            }
        }
    }, [isPlaying]);

    return (
        <>
            <div className="lg:px-10 py-2">
                <div className="md:flex sm:flex-col md:flex-row justify-items-center margin-auto items-center justify-center">
                    <div className="flex flex-col md:mr-4 sm:m-4 rounded-sm mb-4 margin-auto justify-center">
                        <table className="table table-striped table-striped-vertical table-responsive table-auto text-left rounded-sm">
                            <tbody>
                                <tr>
                                    <th>Song</th>
                                    <td className="border px-4 py-2">
                                        {props.track?.name}
                                    </td>
                                </tr>
                                <tr>
                                    <th>Artist</th>
                                    <td className="border px-4 py-2">
                                        {props.track?.artist}
                                    </td>
                                </tr>
                                <tr>
                                    <th>Album</th>
                                    <td className="border px-4 py-2">
                                        {props.track?.album}
                                    </td>
                                </tr>
                                <tr>
                                    <th>Rating</th>
                                    <td className="border px-4 py-2">
                                        {props.track?.rating}
                                    </td>
                                </tr>
                                <tr>
                                    <th>Release Date</th>
                                    <td className="border px-4 py-2">
                                        {props.track?.year}
                                    </td>
                                </tr>
                                <tr>
                                    <th>Duration</th>
                                    <td className="border px-4 py-2">
                                        {props.track?.duration}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="flex flex-col rounded-sm">
                        <div>
                            <div className="flex flex-row items-center justify-between">
                                <div className="img-gradient flex items-center">
                                    <div
                                        className="vote-image-wrapper flex items-center"
                                        onClick={changePlayState}
                                    >
                                        <img
                                            className="vote-play-button"
                                            src={
                                                isPlaying
                                                    ? "../pause_button.png"
                                                    : "../play_button.png"
                                            }
                                            alt=""
                                        />
                                    </div>
                                    <div className="vote-title-wrapper">
                                        <span className="vote-song">
                                            {props.track?.name}
                                        </span>
                                        <span className="vote-artist">
                                            {props.track?.artist}
                                        </span>
                                    </div>

                                    <img
                                        className="vote-img"
                                        onClick={changePlayState}
                                        src={props.track?.album_image}
                                    />
                                </div>
                            </div>

                            <ReactAudioPlayer
                                src={props.track?.preview_url}
                                ref={(element) => {
                                    setSongPlayer(element?.audioEl?.current);
                                }}
                                controls
                                loop
                                className="w-full hidden"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
