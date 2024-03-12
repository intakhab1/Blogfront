import { Link, useParams } from 'react-router-dom'
import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { UserContext } from '../App'
import { PageAnimation } from '../common/PageAnimation';
import Loader from '../components/Loader';
import { AboutUser } from '../components/AboutUser';
import { filterPaginationData } from '../common/filterPaginationData';
import { InPageNavigation } from '../components/InPageNavigation';
import { PostCard } from '../components/PostCard';
import { BlogPostCard } from '../components/BlogPostCard';
import { NoData } from '../components/NoData';
import { LoadMore } from '../components/LoadMore';
import { PageNotFound } from './PageNotFound';

export const profileDataStructure = {
    personal_info:{
        fullname:"",
        usename:" ",
        profile_img:"",
        bio:"",
    },
    account_info:{
        total_posts:0,
        total_blogs:0,
    },
    social_links:{},
    joinedAt:""
}

export const Profile = () => {
    let { userAuth: { username} } = useContext(UserContext)
    let { id: profileId } = useParams();
    let [profile, setProfile] = useState(profileDataStructure);
    let [blogs, setBlogs] = useState(null);
    let [loading, setLoading] = useState(true)
    let [currentProfile, setCurrentProfile] = useState("")
    let { 
        personal_info: {fullname, username: profile_username, profile_img, bio}, 
        account_info: {total_posts, total_reads}, 
        social_links, 
        joinedAt 
        } = profile;
    
    // fetch user profile
    const fetchUserProfile = () =>{
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/profile", {username: profileId} )
        .then(({data: user}) =>{
            if(user != null){
                setProfile(user)
            }
            setCurrentProfile(profileId)
            getBlogs({user_id: user._id})
            setLoading(false)
        })
        .catch(err =>{
            
            setLoading(false)
        })
    }  

    // fetch user posts
    const getBlogs = ({page = 1, user_id }) =>{
        user_id = user_id  == undefined ? blogs.user_id : user_id;
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {
            author: user_id,
            page
        })
        .then( async ({data}) =>{
            let newData = await filterPaginationData({
                state: blogs,
                data: data.blogs,
                page,
                countRoute: "/total-search-blogs",
                dataToSend: {authod: user_id}
            })
            // console.log(newData)
            newData.user_id = user_id;
            // console.log(newData)
            setBlogs(newData)
        })
    }

    const resetState  = () =>{
        setProfile(profileDataStructure);
        setLoading(true)
        setCurrentProfile("")
    }
    useEffect(()=>{
        if(profileId != currentProfile){
            setBlogs(null);
        }
        if(blogs == null){
            resetState()
            fetchUserProfile();
        }

    },[blogs, profileId]) 

    return (
    <PageAnimation>
    {
    loading ? <Loader/> : 
        profile_username?.length ?

            <section className='h-cover gap-5 md:flex flex--row-reverse  min-[1100px]:gap-12 items-start '>
                <div className='flex flex-col gap-5 min-w-[250px] max-md:items-center md:w-[50%] md:pl-8 md:py-10 md:border-r border-grey md:sticky '>
                    <img src={profile_img} className='w-48 h-48 bg-grey rounded-full md:w-32 md:h-32'/>
                    <h1 className='text-2xl font-medium' >@{profile_username} </h1>
                    <p className='text-xl capitalize h-6'>{fullname}</p>
                    <p>Total {total_posts.toLocaleString()} post </p>
                    <p>Total {total_reads.toLocaleString()} views on all the posts </p>

                    <div className='mt-2 gap-4 flex'>
                        { 
                            profileId === username ? 
                            <Link to="/settings/edit-profile" className="btn-light rounded-md">Edit profile</Link>
                            : ""
                        }
                    </div>
                    <AboutUser bio={bio} social_links={social_links} joinedAt={joinedAt} className="max-md:hidden" />
                </div>
                <div className='max-md:mt-12 w-full'>
                <InPageNavigation routes={["Blogs Published" , "about"]} defaultHidden={["about"]} >

                    <>  
                        {
                            blogs === null ? <Loader/>
                            : 
                            blogs.currentPageDocs.length ? blogs.currentPageDocs.map((blog, i) => {
                                            return <PageAnimation transition={{duration: 1, delay: i*0.1 }} key={i}>

                                                        <PostCard blog={blog} index={i} />
                                                        {/* <BlogPostCard content={blog} author={blog.author.personal_info} /> */}
                                                    </PageAnimation>
                                            })
                                            :
                                            <NoData message={"No Related Blogs"}/>
                        }
                        <LoadMore state={blogs} fetchData={getBlogs} />
                        
                    </>
                    <AboutUser bio={bio} social_links={social_links} joinedAt={joinedAt}/>

                </InPageNavigation>
                </div>
            </section>
            :

            <PageNotFound/>            
    }
    </PageAnimation>
  )
}
