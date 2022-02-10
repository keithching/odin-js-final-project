import { useState, useRef } from 'react';

const PostLikeButton = (props) => {
    const { post, postIsLiked, handleClick } = props;

    return (
        <div 
            className="post-post-like-button"
            id={`postLikeBtn-for-${post.id}`}
            onClick={handleClick}>
            {postIsLiked ? <i className="fas fa-heart"></i> : <i className="far fa-heart"></i>}
        </div>
    );
};

export default PostLikeButton;