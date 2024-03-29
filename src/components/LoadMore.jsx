
export const LoadMore = ({ state, fetchData, additionalParam }) => {
    if(state != null && state.totalDocs > state.currentPageDocs.length){
        return (
            <button 
                onClick={() => fetchData({ ...additionalParam, page: state.page + 1}) }
                className="latestTag p-2 px-3 text-dark-grey hover:bg-grey/30 rounded-full flex items-center gap-2"
            >
            Load More</button>
        )
    }
}
