import { getProviders, signIn } from "next-auth/react";

function Login({ providers }) {
    return (
        <div className=" flex flex-col w-full justify-center items-center min-h-screen">
            <span className="login-title">SONGSRATED</span>
            <span className="login-subtitle">Rate your songs</span>
            <p className="login-text">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Pellentesque venenatis lorem nec justo pretium, quis feugiat
                enim vulputate. Mauris a malesuada nibh. Curabitur id ligula
                lectus. Donec hendrerit lectus quis elementum bibendum. Sed nec
                erat sed orci egestas mattis.
            </p>

            {Object.values(providers).map((provider) => {
                return (
                    <div key={provider.name}>
                        <button
                            onClick={() =>
                                signIn(provider.id, { callbackUrl: "/" })
                            }
                        >
                            <div className="flex flex-row py-4 items-center justify-center rounded-sm bg-black w-80 login-button">
                                <img
                                    src="logo_spotify.png"
                                    className="h-10 w-10"
                                    alt=""
                                />
                                <span className="text-white pl-2">
                                    Login with {provider?.name}
                                </span>
                            </div>
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
export default Login;

export async function getServerSideProps() {
    const providers = await getProviders();

    return {
        props: {
            providers,
        },
    };
}
