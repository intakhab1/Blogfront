import React from 'react'

export const BlogContent = ({ block }) => {

    let { type, data } = block

    const Img = ({url, caption}) => {
        return <div>
            <img src={url}/>
            {caption.length ? <p className='w-full my-2 md:mb-12 text-base text-dark-grey text-center' >{caption}</p> : "" }
        </div>
    }

    const Quote = ({quote, caption })=>{
        return <div className='bg-purple/10 border-purple p-3 pl-5 '>
            <p className='text-xl leading-10 md:text-2xl'>{quote}</p>
                {caption.length ? <p className='w-full text-base text-purple '>{caption}</p> : "" }
        </div>
    }

    const List = ({style, items }) => {
        return (
            <ol className={`pl-5 ${ style === "ordered" ? "list-decimal" : "list-disc"}`} >
                {
                    items.map((listItem, i) =>{
                        return <li 
                        key={i} 
                        className='my-4'
                        dangerouslySetInnerHTML={{__html: listItem}}
                        ></li>
                    })
                }
            </ol>
        )
    }


// paragraph
    if(type == "paragraph"){
        return <p dangerouslySetInnerHTML={{__html: data.text}} ></p>

    }

// heading - H1, H2, H3
    if(type == "header"){
        if(data.level == 3){
            return <h3 
                    className='text-3xl font-bold' 
                    dangerouslySetInnerHTML={{__html: data.text}}></h3>
        }
        return <h2
                className='text-4xl font-bold' 
                dangerouslySetInnerHTML={{__html: data.text}}></h2>
    }

// images and captions
    if(type == "image"){
        return <Img url={data.file.url} caption={data.caption} />
    }

// quotes
    if(type == "quote"){
        return <Quote quote={data.text} caption={data.caption} />
    }

// list
    if(type == "list"){
        return <List style={data.style} items={data.items} />
    }
    else{
        return <h1>this is a block</h1>
    }
}
