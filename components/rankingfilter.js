export default function RankingFilter({ ...props }) {
    return (
        <div className="flex flex-row justify-center text-white ranking-filter relative">
            {props.loading && <div className="overlay bg-slate-400 bg-opacity-75"></div>}
            <div className="flex flex-col m-2 page-size">
                <label className="form-label">Page size</label>
                <select
                    className="form-select block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    value={props.per_page}
                    onChange={(e) => {
                        props.setPerPage(e.target.value);
                    }}
                >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                </select>
            </div>

            <div className="flex flex-col m-2 page-number">
                <label className="form-label">Page</label>
                <input
                    className="form-control text-black uppercase tracking-wide text-md block mb-2"
                    type="number"
                    value={props.page}
                    onChange={(e) => {
                        props.setPage(e.target.value);
                    }}
                />
            </div>

            <div className="flex flex-col m-2 sort-by">
                <label className="form-label">Sort by</label>
                <select
                    className="form-select block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    value={props.sort_by}
                    onChange={(e) => {
                        props.setSortBy(e.target.value);
                    }}
                >
                    <option value="rating">Rating</option>
                    <option value="name">Song</option>
                    <option value="artist">Artist</option>
                    <option value="album">Album</option>
                    <option value="release_date">Release date</option>
                </select>
            </div>

            <div className="flex flex-col m-2 sort-order">
                <label className="form-label">Sort order</label>
                <select
                    className="form-select block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    value={props.sort_order}
                    onChange={(e) => {
                        props.setSortOrder(e.target.value);
                    }}
                >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                </select>
            </div>

            <div className="flex flex-col m-2 filter-by">
                <label className="form-label">Filter by</label>
                <select
                    className="form-select block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    value={props.filter_by}
                    onChange={(e) => {
                        props.setFilterBy(e.target.value);
                    }}
                >
                    <option value="">None</option>
                    <option value="rating">Rating</option>
                    <option value="name">Name</option>
                    <option value="artist">Artist</option>
                    <option value="album">Album</option>
                    <option value="release_date">Release date</option>
                </select>
            </div>

            <div className="flex flex-col m-2 filter-value">
                <label className="form-label">Filter value</label>
                <input
                    className="form-control text-black tracking-wide text-md block mb-2"
                    type="text"
                    value={props.filter_value}
                    onChange={(e) => {
                        props.setFilterValue(e.target.value);
                    }}
                />
            </div>

            <button
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded clear-button"
                onClick={() => {
                    props.setFilterBy('');
                    props.setFilterValue('');
                    props.setPage(1);
                    props.setPerPage(10);
                    props.fetchRanking();
                }}
            >
                Clear
            </button>
        </div>
    );
}
