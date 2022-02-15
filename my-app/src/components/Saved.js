import { useOutletContext } from 'react-router';
import { useState, useEffect, useRef } from 'react';
import Cards from './Cards';

const Saved = () => {
    
    const [ 
        currentUser, 
        setCurrentUser, 
        users, 
        setUsers,
        posts,
        setPosts,
        getPublishedPosts,
        getFollowingPosts,
        db,
        storage,
        handleMouseOver, 
        handleMouseOut, 
        resetHover,
        pageOwner
    ] = useOutletContext();

    const getCurrentUserSavedPosts = () => {
        let currentUserSavedPostsId = currentUser.posts.saved.map(post => post.postID);
        let currentUserSavedPosts = posts.filter(post => currentUserSavedPostsId.find(postId => postId === post.id)); 
            
        return currentUserSavedPosts;
    };
    
    const [ savedPosts, setSavedPosts ] = useState(getCurrentUserSavedPosts());

    useEffect(() => {
            setSavedPosts(getCurrentUserSavedPosts());
    }, [posts]);


    return (
        <Cards 
            postsToDisplay={savedPosts}
            handleMouseOver={handleMouseOver}
            handleMouseOut={handleMouseOut}
            resetHover={resetHover}
            getPublishedPosts={getPublishedPosts}
            currentUser={currentUser}
        />
    );
}

export default Saved;
