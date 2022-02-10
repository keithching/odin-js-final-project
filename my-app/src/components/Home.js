import { useOutletContext } from 'react-router';
import Flyer from './Flyer';
import { useState, useEffect } from 'react';
import { compareAsc, parseISO } from 'date-fns';


const Home = () => {

    let [
        currentUser, 
        setCurrentUser, 
        users, 
        setUsers,
        posts,
        setPosts,
        getPublishedPosts,
        getFollowingPosts,
        db
    ] = useOutletContext();

    // include currentUser's published posts and following posts
    // concat with current user's posts
    let publishedPosts = getPublishedPosts();
    let followingPosts = getFollowingPosts();
    let postsToDisplay = publishedPosts.concat(followingPosts);

    // sort by time created latest
    postsToDisplay.sort((a,b) => compareAsc(parseISO(b.timeCreated), parseISO(a.timeCreated)));

    const [ flyers, setFlyers ] = useState(postsToDisplay);

    useEffect(() => { // get the posts again if posts have changed
        publishedPosts = getPublishedPosts();
        followingPosts = getFollowingPosts();
        postsToDisplay = publishedPosts.concat(followingPosts);
        
        // sort by time created latest
        postsToDisplay.sort((a,b) => compareAsc(parseISO(b.timeCreated), parseISO(a.timeCreated)));

        setFlyers(postsToDisplay);
    }, [posts, users]);


    return (
        <div className="home-container">
            {flyers.map(flyer => {
                return (
                    <div key={flyer.id}>
                        <Flyer 
                            flyer={flyer}
                            flyers={flyers}
                            setFlyers={setFlyers}
                        />
                    </div>
                );
            })}

        </div>
    );
};

export default Home;