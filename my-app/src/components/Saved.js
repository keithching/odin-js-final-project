import { useOutletContext } from 'react-router';
import Card from './Card';

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
        handleMouseOver, 
        handleMouseOut, 
        handleClick,
        resetHover
    ] = useOutletContext();

    let currentUserSavedPostsId = currentUser.posts.saved.map(post => post.postID);

    // let allPosts = posts.published.concat(posts.following);

    let currentUserSavedPosts = posts.filter(post => currentUserSavedPostsId.find(postId => postId === post.id)); 

    return (
        <div className="card-container">
            {currentUserSavedPosts.map(post => {
                return (
                    <div key={post.id}>
                        <div id={post.id}>
                            <Card 
                                handleMouseOver={handleMouseOver}
                                handleMouseOut={handleMouseOut}
                                handleClick={handleClick}
                                photoPreview={post.photos}
                                isHovered={post.isHovered}
                                post={post}
                                resetHover={resetHover}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default Saved;
