import { useState, useEffect } from 'react';
import { BiUpvote, BiPlay, BiPause } from 'react-icons/bi';
import ReactAudioPlayer from 'react-audio-player';

export default function Song({ ...props }) {
    const [player, setSongPlayer] = useState(null);

    function changePlayState() {
        props.setParentPlayingStatus(!props.isPlaying);
    }

    useEffect(() => {
        if (player !== null) {
            if (props.isPlaying) {
                player.play();
            } else {
                player.pause();
            }
        }
    }, [props.isPlaying]);

    const track = props.track;
    return (
        <>
            <div className="md:px-10 py-2">
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
                                            props.isPlaying
                                                ? 'pause_button.png'
                                                : 'play_button.png'
                                        }
                                        alt=""
                                    />
                                </div>
                                <div className="vote-title-wrapper">
                                    <span className="vote-song">
                                        {track?.name}
                                    </span>
                                    <span className="vote-artist">
                                        {track?.artist_name}
                                    </span>
                                </div>
                                <div className="vote-button-wrapper flex items-center">
                                    <img
                                        className="vote-button"
                                        onClick={() => {
                                            props.set(track?.spotify_id);
                                        }}
                                        src="pick_button.png"
                                    />
                                </div>
                                <img
                                    className="vote-img"
                                    onClick={changePlayState}
                                    src={track?.album_image}
                                />
                            </div>
                        </div>

                        <ReactAudioPlayer
                            src={track?.preview_url}
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
        </>
    );
}
