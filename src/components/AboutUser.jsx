import { Link } from "react-router-dom";
import { getFullDay } from "../common/date";

 
export const AboutUser = ({ bio, social_links, joinedAt, className }) => {

  return (
    <div className={"md:w-[90%] md:mt-7 " + className} >
      {/* AboutUser {joinedAt}  */}
      <p className={`text-xl leading-7 items-center `}  >{bio.length ? bio : "No bio available " } </p>
      <div className="flex gap-x-7 gap-y-2 flex-wrap my-7 items-center text-dark-grey">
        {
          Object.keys(social_links).map( key =>{
            let link = social_links[key];
            return link ? 
            <Link 
              key={key} 
              to={link} 
              target="_blank">
              <i className={"fi " + (key != 'website' ? "fi-brands-" + key : "fi-rr-globe") + " text-2xl hover:text-black" }></i>
            </Link> 
            : ""

          })
        }
        
      </div>
      <p className="text-xl leading-7 text-dark-grey"> Member since {getFullDay(joinedAt)} </p>
    </div>
  )
}





import React, { useState } from 'react';

const BlogPost = ({ content }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div>
      <p className={`overflow-hidden ${isExpanded ? 'overflow-visible' : 'h-16'}`}>
        {content}
      </p>
      {!isExpanded && (
        <button className="text-blue-500" onClick={toggleExpand}>
          Read More
        </button>
      )}
    </div>
  );
};

export default BlogPost;