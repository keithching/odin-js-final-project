import { useState, useEffect } from 'react';
import Post from './Post';

const Card = (props) => {

    const { 
        photoPreview, 
        handleMouseOver, 
        handleMouseOut, 
        handleClick, 
        isHovered, 
        post, 
        resetHover,
    } = props;

    return (
        <div 
            className="card"
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
            onClick={handleClick}
            onLoad={resetHover}
        >
            <img 
                src={photoPreview}
                className={isHovered ? 'card-hover' : null} 
            />
            {isHovered ? 
                <div className="card-hover-info">
                    <span><i className="fas fa-heart"></i> {post.whoLiked.length}</span>
                    <span><i className="fas fa-comment"></i> {post.comments.length}</span>
                </div> : null
            }
        </div>
    );
};

export default Card;