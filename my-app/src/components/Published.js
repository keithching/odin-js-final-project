import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Post from './Post';
import Card from './Card';
import { useOutletContext } from 'react-router';
import { getUsersData, getPostData, getPostsData } from '../userdata';

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
        resetHover
    ] = useOutletContext();

    let { username } = useParams(); // page owner

    const [ usernameState, setUsernameState ] = useState(username);

    useEffect(() => {
        setUsernameState(username);
    }, [username]);

    // published posts by the page owner
    let published = posts.filter(post => post.createdBy === users.find(user => user.info.username === usernameState).info.id);
    const [ publishedPosts, setPublishedPosts ] = useState(published);

    useEffect(() => {
        published = posts.filter(post => post.createdBy === users.find(user => user.info.username === usernameState).info.id);
        setPublishedPosts(published);
    }, [posts, usernameState]);

    // if the card is clicked, toggle the modal for the target post
    const [ cardIsClicked, setCardIsClicked ] = useState(false);
    const [ targetPostId, setTargetPostId ] = useState('');

    const handleClick = (e) => {
        const postId = e.target.parentNode.parentNode.id;

        setTargetPostId(postId);
    };

    const closeModal = (e) => {
        // https://stackoverflow.com/questions/34349136/react-how-to-capture-only-parents-onclick-event-and-not-children/34349169
        if (e.target === e.currentTarget) {
            setCardIsClicked(false);
            setTargetPostId('');
        }
    }

    const initialRef = useRef(true);
    useEffect(() => {
        if (initialRef.current) {
            initialRef.current = false;
        } else {
            if (targetPostId !== '') {
                // history push state to the post Id url
                window.history.pushState({post: `${targetPostId}`}, 'test title', `/#/p/${targetPostId}`);

                // set the card is clicked to true
                setCardIsClicked(true);
            }
        }
    }, [targetPostId]);


    return (
        <div>
            <div className="card-container">
                {publishedPosts.map(post => {
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

                { cardIsClicked ? 
                    <div id={`modal-for-post-${targetPostId}`} className="modal">
                        <div className="modal-content">
                            <div className="modal-header">
                                <span className="close" onClick={closeModal}>
                                    &times;
                                </span>
                            </div>
                            <div className="modal-body" onClick={closeModal}>
                                <div className="modal-post">
                                    <Post />
                                </div>
                            </div>
                        </div>
                    </div>
                    :
                    null
                }
            </div>
        </div>
    );
}

export default Published;
