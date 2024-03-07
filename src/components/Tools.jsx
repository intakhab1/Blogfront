
import Embed from "@editorjs/embed"
import List from "@editorjs/list"
import Image from "@editorjs/image"
import Header from "@editorjs/header"
import Quote from "@editorjs/quote"
import Marker from "@editorjs/marker"
import InlineCode from "@editorjs/inline-code"

// upload image from a url
const uploadImgByUrl = (e) =>{
    let link = new Promise(( resolve, reject ) =>{
        try {
            resolve(e)
        }
        catch(err){
            reject(err)
        }
    })
    return link.then(url =>{
        return {
            success: true,
            file: {url}
        }
    })
}
// Upload image from local
import { UploadImage } from "../common/aws"
const uploadImgByFile = (e) => {
    return UploadImage(e).then(url =>{
        if(url){
            return{
                success: true,
                file: {url}
            }
        }
    })
}

export const Tools = {
    embed: Embed,
    list: {
        class: List,
        inlineToolbar: true
    },
    image: {
        class: Image,
        config: {
            uploader: {
                uploadByUrl: uploadImgByUrl,
                uploadByFile: uploadImgByFile,
            }
        }
    },
    header: {
        class: Header,
        config:{
            placeholder: "Type Heading...",
            levels: [2, 3],
            defaultlevel:2,
        }
    },
    quote: {
        class: Quote,
        inlineToolbar:true
    },
    marker: Marker,
    inlineCode: InlineCode
}
