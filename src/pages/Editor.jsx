import { useContext, useEffect, useState } from "react"
import { UserContext } from "../App"
import { Navigate, useParams } from "react-router-dom"
import { BlogEditor } from "../components/BlogEditor"
import { PublishForm } from "../components/PublishForm"
import { createContext } from "react"
import Loader from "../components/Loader"
import axios from "axios"


const blogContext = {
  title: '',
  banner: '',
  content: [],
  tags: [],
  desc: '',
  author: { personal_info : {}}
}
export const EditorContext = createContext({})

export const Editor = () => {

    let { blog_id } = useParams()
    const [loading , setLoading] = useState(true)

    const [blog, setBlog] = useState(blogContext)
    const [ editorState, setEditorState] = useState("editor")
    const [ textEditor, setTextEditor ] = useState( {isReady: false} )

    let { userAuth: {token} } = useContext(UserContext)

    useEffect(() =>{
      if( !blog_id ){
        return setLoading(false)
      }
      axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog", { blog_id, draft: true, mode: "edit" })
      .then(({ data: {blog}} )=>{
        setBlog(blog);
        setLoading(false)
      })
      .catch(err =>{
        setBlog(null)
        setLoading(false)
      })

    },[])

  return (
   <EditorContext.Provider value={{ blog, setBlog, editorState, setEditorState, textEditor, setTextEditor }}>
   {
      token === null ? <Navigate to="/login"/> 
      : loading ? <Loader/> 
      : editorState == "editor" ? <BlogEditor/> : <PublishForm/>

   }

   </EditorContext.Provider>

  )
}
