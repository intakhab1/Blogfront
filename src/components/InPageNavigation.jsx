import { useEffect, useRef, useState } from "react"

export let activeTabLineRef;
export let activeTabRef;

export const InPageNavigation = ({routes, defaultHidden = [], defaultTab = 0, children}) => {
    let [ pageIndex, setPageIndex ] = useState(defaultTab)
    activeTabLineRef = useRef()
    activeTabRef = useRef()

    const switchCurrentPageTab = (btn, i ) =>{
        let { offsetWidth, offsetLeft } = btn;
        activeTabLineRef.current.style.width = offsetWidth + "px";
        activeTabLineRef.current.style.left = offsetLeft + "px";

        setPageIndex(i)
    }
    // default tab
    useEffect(() =>{
        switchCurrentPageTab(activeTabRef.current , defaultTab)
    },[])

  return (
    <>
    <div className="relative mb-8 bg-white border-b border-grey flex flex-nowrap overflow-x-auto">
        {
            routes.map((route, i) => {
                return (
                    <button 
                        ref={i === defaultTab ? activeTabRef : null}
                        className={"px-5 capitalize p-4 " + (pageIndex === i ? "text-black" : "text-dark-grey " ) + (defaultHidden.includes(route) ? " md:hidden " : "") } 
                        onClick={(e) =>{ switchCurrentPageTab(e.target, i)}}
                        key={i} 
                        
                        >
                        {route}
                    </button>
                )
            })
        }
        <hr ref = {activeTabLineRef} className="absolute bottom-0 duration-250"/>
    </div>
    {Array.isArray(children) ? children[pageIndex] : children}
    </>
  )
}
