import { useEffect, useState } from "react"
import { PageAnimation } from "../common/PageAnimation"
import { InPageNavigation, activeTabRef , activeTabLineRef } from "../components/InPageNavigation"
import Loader from "../components/Loader"
import axios from "axios"
import { BlogPostCard } from "../components/BlogPostCard"
import { TrendingBlogCard } from "../components/TrendingBlogCard"
import { NoData } from "../components/NoData"
import { filterPaginationData } from "../common/filterPaginationData"
import { LoadMore } from "../components/LoadMore"
import { PostCard } from "../components/PostCard"
// import { Timeline } from "../components/Timeline"

export const Home = () => {

    let [blogs, setBlogs] = useState(null)
    let [trendingBlog, setTrendingBlog] = useState(null) 

    let [pageState , setPageState] = useState("latest")
    
    let categories = ["fiction", "tech", "history", "art", "movie", "food", "music", "web", "war", "hollywood", "finance", "fashion", "travel"]  
    let latestCategories = ["fiction", "food", "history", "art", "movie", "war", "finance", "fashion", "travel"]  

    // Home/Latest blogs
    const fetchTrendingPosts = ({ page = 1 }) =>{
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs", { page })
        .then( async ({data}) => {

            // Pagination
            // console.log(data.blogs)
            let newData = await filterPaginationData({
                state: blogs,
                data:data.blogs,
                page,
                countRoute: "/total-latest-blogs"
            })
            // console.log(newData)
            setBlogs(newData)
        })
        .catch(err => {
            console.log(err)
        })
    }

    // Home/Latest blogs
    const fetchLatestBlogs = ({ page = 1 }) =>{
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs", { page })
        .then( async ({data}) => {

            // Pagination
            // console.log(data.blogs)
            let newData = await filterPaginationData({
                state: blogs,
                data:data.blogs,
                page,
                countRoute: "/total-latest-blogs"
            })
            // console.log(newData)
            setBlogs(newData)
        })
        .catch(err => {
            console.log(err)
        })
    }
    // Trending blogs
    const fetchTrendingBlogs = () =>{
        axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/trending-blogs")
        .then(({data}) => {
            setTrendingBlog(data.blogs);
        })
        .catch(err => {
            console.log(err)
        })
    }
    // Category filter
    const handleTagFilterBtn = (e) =>{
        let category = e.target.innerText.toLowerCase();
        // console.log(category)
        setBlogs(null);
        if(pageState === category){
            setPageState("latest")
            return
        }
        setPageState(category)

    }
    const fetchLatestBlogByTag = ({page = 1}) =>{
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {tag: pageState, page})
        .then( async ({data}) => {
            // Pagination
            // console.log(data.blogs)
            let newData = await filterPaginationData({
                state: blogs,
                data:data.blogs,
                page,
                countRoute: "/total-search-blogs",
                dataToSend: {tag: pageState}
            })
            // console.log(newData)
            setBlogs(newData)
        })
        .catch(err => {
            console.log(err)
        }) 
    }

    useEffect(()=>{
        activeTabRef.current.click();

        // default
        if(pageState === "latest"){
            fetchLatestBlogs({page: 1});
        }
        // Filtered blogs by tag/category
        else{
            fetchLatestBlogByTag({page: 1})
        }
        // trending blogs
        if(!trendingBlog){
            fetchTrendingBlogs();
        }
    },[pageState])
  return (
    <PageAnimation>
        <section className="h-cover sm:flex justify-center gap-10">
        {/* HOME/LATEST BLOGS  */}
        <div className="w-full">
            {/* <InPageNavigation routes={[pageState , "trending"]} defaultHidden={["trending"]}> */}
            <InPageNavigation routes={[pageState , "trending", "career"]} >
                <>   
                    <div className="flex gap-3 flex-wrap mb-6 md:hidden lg:hidden">
                        {   
                            latestCategories.map((category, i) =>{
                                return (<button onClick={handleTagFilterBtn} 
                                            className={"latestTag " + (pageState === category ? "bg-black text-white" : "")} 
                                            key={i}
                                            >{category}
                                        </button>
                                )
                            })
                        }
                    </div>
                    {
                        blogs === null ? (<Loader/>)
                        : 
                        blogs.currentPageDocs.length ? (blogs.currentPageDocs.map((blog, i) => {
                                        return ( <PageAnimation transition={{duration: 1, delay: i*.1 }} key={i}>
                                                    <PostCard blog={blog} index={i} />
                                                </PageAnimation>)
                                        }))
                                        :
                                        (<NoData message={"No Related Blogs"}/>)
                    }
                    <LoadMore state={blogs} fetchData={(pageState === "latest" ? fetchLatestBlogs : fetchLatestBlogByTag)} />
                </>
                {
                    trendingBlog === null ? (<Loader/>)
                    : 
                    trendingBlog.length ? (trendingBlog.map((blog, i) =>{
                                        return  (<PageAnimation transition={{duration: 1, delay: i*.1 }} key={i}>
                                                    <BlogPostCard content={blog} author={blog.author.personal_info} />
                                                </PageAnimation>)
                                         }))
                                         :
                                         (<NoData message={"No Trending Blogs"}/>)
                }
                {/* <LoadMore state={blogs} fetchData={(pageState === "Timeline" ? fetchTrendingPosts : fetchLatestBlogByTag)} /> */}
            </InPageNavigation>
        </div>
        
        {/* FILTER TAG AND TRENDING BLOGS */}
        <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden ">
            
            <div className="flex flex-col gap-10">
                <div>
                    <h1 className="font-medium text-xl mb-8">A Cornucopia of Tales: Explore Stories Tailored for Every Interest.</h1>
                    <div className="flex gap-3 flex-wrap">
                        {   
                            categories.map((category, i) =>{
                                return (<button onClick={handleTagFilterBtn} 
                                            className={"tag " + (pageState === category ? "bg-black text-white " : "")} 
                                            key={i}
                                            >{category}
                                        </button>
                                )
                            })
                        }
                    </div>
                </div>

                <div >
                    <div className="flex  gap-1 mb-4 ">
                        <h1 className="font-medium text-xl">Trending</h1>
                        <svg className="w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6h18M3 12h9m-9 6h6"/></svg>
                    </div>
                    {
                        trendingBlog === null ? <Loader/> 
                        : 
                        trendingBlog.length ? (trendingBlog.map((blog, i) =>{
                                            return  (<PageAnimation transition={{duration: 1, delay: i*.1 }} key={i}>
                                                        <TrendingBlogCard blog={blog} index={i} />
                                                    </PageAnimation>)
                                            }))
                                            :
                                            (<NoData message={"No Trending Blogs"}/>)

                    }
                </div>

            </div>
        </div>
        
        <div>

        </div>

        </section>
    </PageAnimation>
  )
}
