import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Cards from './Cards';
import { useOutletContext } from 'react-router';
import { getUsersData, getPostData, getPostsData } from '../userdata';
import { formatISO, compareAsc, parseISO } from 'date-fns';

const Published = () => {

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

    let { username } = useParams(); // page owner

    const [ usernameState, setUsernameState ] = useState(username);

    useEffect(() => {
        setUsernameState(username);
    }, [username]);

    // published posts by the page owner
    const getPageOwnerPublishedPosts = () => {
        let pageOwnerPostsId = pageOwner.posts.published.map(post => post.id);
        let published = posts.filter(post => pageOwnerPostsId.find(postID => postID === post.id));
        // sort by time created latest
        published.sort((a,b) => compareAsc(parseISO(b.timeCreated), parseISO(a.timeCreated)));

        return published;
    };

    const [ publishedPosts, setPublishedPosts ] = useState(getPageOwnerPublishedPosts());


    useEffect(() => {
        setPublishedPosts(getPageOwnerPublishedPosts());
    }, [posts, pageOwner, usernameState]);


    return (
        <Cards 
            postsToDisplay={publishedPosts}
            handleMouseOver={handleMouseOver}
            handleMouseOut={handleMouseOut}
            resetHover={resetHover}
            getPublishedPosts={getPublishedPosts}
        />
    );
}

export default Published;
