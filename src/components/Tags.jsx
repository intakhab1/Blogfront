import { useContext } from "react"
import { EditorContext } from "../pages/Editor"

export const Tags = ({tag, tagIndex}) => {
    let {setBlog, blog, blog:{ tags } } = useContext(EditorContext)
    
    // delete tag
    const handleDeleteTag = () =>{
        tags = tags.filter(t => t !== tag)
        setBlog({...blog, tags})
    }
    // edit tag
    const handleKeydown = (e) =>{
        if(e.keyCode === 13 || e.keyCode === 188){
            e.preventDefault()
            
            let currentTag = e.target.innerText
            tags[tagIndex] = currentTag;
            setBlog({...blog, tags})
            e.target.setAttribute("contentEditable", false)
            // console.log(blog.tags)
        }
    }
    const handleEditable = (e) =>{
        e.target.setAttribute("contentEditable", true)
        e.target.focus()
    }

  return (
    <div className="relative p-2 mt-2 mr-2 px-5 bg-white rounded-full inline-block hover:bg-opacity-50 pr-10 ">
        <p 
            className="outline-none" 
            onClick={handleEditable}
            onKeyDown={handleKeydown}
            >{tag}</p>
        <button className="mt-[2px] rounded-full absolute right-3 top-1/2 -translate-y-1/2 "
            onClick={handleDeleteTag}
        >
            <i className="fi fi-br-cross text-sm pointer-events-none"></i>
        </button>
    </div>
  )
}
