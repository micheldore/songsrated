import Head from 'next/head';
import Menu from '../components/menu';
import RankingTable from '../components/rankingtable';

const Ranking = () => {
    return (
        <>
            <div className="flex min-h-screen min-w-screen flex-col items-center justify-center">
                <main className="pb-10 pt-10 text-center text-white">
                    <Menu></Menu>
                    <RankingTable></RankingTable>
                </main>
            </div>
        </>
    );
};

export default Ranking;
