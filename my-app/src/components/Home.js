import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router';
import { Link } from 'react-router-dom';

import Flyer from './Flyer';
import Footer from './Footer';
import Avatar from './Avatar';
import Post from './Post';

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
        db,
        storage
    ] = useOutletContext();

    const getFlyers = () => {
        // include currentUser's published posts and following posts
        // concat with current user's posts
        let publishedPosts = getPublishedPosts();
        let followingPosts = getFollowingPosts();
        let postsToDisplay = publishedPosts.concat(followingPosts);
    
        // sort by time created latest
        postsToDisplay.sort((a,b) => compareAsc(parseISO(b.timeCreated), parseISO(a.timeCreated)));

        return postsToDisplay;
    };

    // flyers to display 
    const [ flyers, setFlyers ] = useState(getFlyers());

    useEffect(() => { // get the posts again if posts or users have changed
        setFlyers(getFlyers());
    }, [posts, users]);


    // if the card is clicked, toggle the modal for the target post
    const [ cardIsClicked, setCardIsClicked ] = useState(false);
    const [ targetPostId, setTargetPostId ] = useState('');

    // return whether the current url is at a post url
    const isLocationAtPostUrl = (postId) => {
        if (window.location.href.includes(postId)) {
            return true;
        } else {
            return false;
        }
    };

    const handleCommentButtonClick = (e) => {
        // if the current location isn't the post
        // or if modal not exists in DOM
        // clicking the button will open the modal
        if (targetPostId) { 
            if (isLocationAtPostUrl(targetPostId)) { // is in a post. Focus the comment input field
                const input = document.querySelector('.modal-post input');
                input.focus();
            } else {
                console.log('??');
            }
        } 
        else { // is not in a post. show modal
            const postId = e.target.closest('.flyer-container').parentNode.id;

            document.body.classList.add('stop-scrolling');
            setTargetPostId(postId);
        }
    }

    const closeModal = (e) => {
        // https://stackoverflow.com/questions/34349136/react-how-to-capture-only-parents-onclick-event-and-not-children/34349169
        if (e.target === e.currentTarget) {
            setCardIsClicked(false);
            setTargetPostId('');
            document.body.classList.remove('stop-scrolling');

            // history push state back to index url
            // window.history.pushState({}, 'test title', `/`);
            window.history.back();
        }
    }

    const closeModalByEscapeKey = () => {
        setCardIsClicked(false);
        setTargetPostId('');
        document.body.classList.remove('stop-scrolling');

        // history push state back to index url
        // window.history.pushState({}, 'test title', `/`);
        window.history.back();
    };

    // escape key close modal support
    useEffect(() => {
        const detectEscapeKey = (e) => {
            if (e.key === 'Escape') {
                closeModalByEscapeKey();
            }
        };

        if (cardIsClicked) {
            document.addEventListener('keydown', detectEscapeKey);
        }

        return () => document.removeEventListener('keydown', detectEscapeKey);

    }, [cardIsClicked]);

    const initialRef = useRef(true);
    useEffect(() => {
        if (initialRef.current) {
            initialRef.current = false;
        } else {
            if (targetPostId !== '') {
                if (!isLocationAtPostUrl(targetPostId)) {
                    // history push state to the post Id url
                    window.history.pushState({post: `${targetPostId}`}, 'test title', `#/p/${targetPostId}/`);

                    // set the card is clicked to true
                    if (!cardIsClicked) {
                        setCardIsClicked(true);
                    }
                } 
            } 
        }
    }, [targetPostId]);

    const Modal = (props) => {
        const { targetPostId } = props;

        return (
            <div>
                { targetPostId !== '' ? 
                    <div 
                        id={`modal-for-post-${targetPostId}`} 
                        className="modal-body" 
                        onClick={closeModal}
                    >
                        <div></div>
                        <div className="modal-post">
                            <Post 
                                id={targetPostId}
                                handleCommentButtonClick={handleCommentButtonClick}    
                            />
                        </div>
                        <div></div>
                    </div>
                    :
                    null
                }
            </div>
        );
    };

    return (
        <div className="home-container">
            <div className="home-left">
                {flyers.map(flyer => {
                    return (
                        <div key={flyer.id} id={flyer.id}>
                            <Flyer 
                                flyer={flyer}
                                flyers={flyers}
                                setFlyers={setFlyers}
                                handleCommentButtonClick={handleCommentButtonClick}
                            />
                        </div>
                    );
                })}
            </div>
            <div className="home-right">
                <div className="home-user-profile">
                    <Link to={`${currentUser.info.username}/`}>
                        <Avatar 
                            className="home-avatar" 
                            avatar={currentUser.info.avatar}
                            currentUser={currentUser}
                            db={db}
                            storage={storage}
                            clickable={false}
                            pageOwner={currentUser}
                        />
                    </Link>
                    <div className="home-user-profile-right">
                        <Link 
                            to={`${currentUser.info.username}/`}
                            className="home-username"
                        >
                            <div>{currentUser.info.username}</div>
                        </Link>
                        <div className="home-nickname">{currentUser.info.nickname}</div>
                    </div>
                </div>
                <Footer />
            </div>


            { cardIsClicked ? 
                <div className="modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <span className="close" onClick={closeModal}>
                                &times;
                            </span>
                        </div>
                        <Modal targetPostId={targetPostId}/>
                    </div>
                </div>
                :
                null
            }

        </div>
    );
};

export default Home;