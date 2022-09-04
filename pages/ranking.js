import Head from "next/head";
import RankingTable from "../components/rankingtable";

const Ranking = () => {
    return (
        <>
            <div className="flex min-h-screen min-w-screen flex-col items-center justify-center text-white">
                <Head>
                    <title>Songsrated</title>
                    <link rel="icon" href="/favicon.ico" />
                </Head>

                <h1>Ranking</h1>
                <RankingTable></RankingTable>
            </div>
        </>
    );
};

export default Ranking;