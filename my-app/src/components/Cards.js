import { useState, useEffect, useRef } from 'react';
import Card from './Card';
import Post from './Post';

const Cards = (props) => {

    const { 
        postsToDisplay,
        handleMouseOver,
        handleMouseOut,
        resetHover,
        getPublishedPosts,
        currentUser
     } = props;

    // if the card is clicked, toggle the modal for the target post
    const [ cardIsClicked, setCardIsClicked ] = useState(false);
    const [ targetPostId, setTargetPostId ] = useState('');



    const handleClick = (e) => {
        const postId = e.target.parentNode.parentNode.id;
        document.body.classList.add('stop-scrolling');
        setTargetPostId(postId);
    };    

    const closeModal = (e) => {
        // https://stackoverflow.com/questions/34349136/react-how-to-capture-only-parents-onclick-event-and-not-children/34349169
        if (e.target === e.currentTarget) {
            setCardIsClicked(false);
            setTargetPostId('');
            document.body.classList.remove('stop-scrolling');

            // history push state back to index url
            window.history.pushState({}, 'test title', `/#/${currentUser.info.username}/`);
            // window.history.back();
        }
    };

    const closeModalByEscapeKey = () => {
        setCardIsClicked(false);
        setTargetPostId('');
        document.body.classList.remove('stop-scrolling');

        // history push state back to index url
        window.history.pushState({}, 'test title', `/#/${currentUser.info.username}/`);
        // window.history.back();
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
                // history push state to the post Id url
                window.history.pushState({post: `${targetPostId}`}, 'test title', `/#/p/${targetPostId}`);

                // set the card is clicked to true
                if (!cardIsClicked) {
                    setCardIsClicked(true);
                }
            }
        }
    }, [targetPostId]);

    const Modal = (props) => {
        const { targetPostId } = props;

        const ModalLeftBtn = () => {
            const [ isVisible, setIsVisible ] = useState(targetPostId === postsToDisplay[0].id ? false : true);
    
            const handleClick = () => {
                // navigate to the newer post
                // get the newer post id
                const currentTargetPost = postsToDisplay.find(currentUserPost => currentUserPost.id === targetPostId);
                const currentTargetPostIndex = postsToDisplay.indexOf(currentTargetPost);
                const newerPostId = postsToDisplay[currentTargetPostIndex - 1].id;
    
                setTargetPostId(newerPostId);
            };
    
            useEffect(() => {
                if (targetPostId === postsToDisplay[0].id) {
                    setIsVisible(false);
                }
            }, [targetPostId]);
    
            return (
                <div>
                    { isVisible ? 
                        <div className="modal-left-btn" onClick={handleClick}>
                            <i className="fas fa-chevron-left"></i>
                        </div>
                        :
                        null
                    }
                </div>
            );
        };
    
        const ModalRightBtn = () => {
            const [ isVisible, setIsVisible ] = useState(targetPostId === postsToDisplay[postsToDisplay.length - 1].id ? false : true);
    
            const handleClick = () => {
                // navigate to the older post
                // get the older post id
                const currentTargetPost = postsToDisplay.find(currentUserPost => currentUserPost.id === targetPostId);
                const currentTargetPostIndex = postsToDisplay.indexOf(currentTargetPost);
                const olderPostId = postsToDisplay[currentTargetPostIndex + 1].id;
    
                setTargetPostId(olderPostId);
            };

            useEffect(() => {
                if (targetPostId === postsToDisplay[postsToDisplay.length - 1].id) {
                    setIsVisible(false);
                }
            }, [targetPostId]);
    
            return (
                <div>
                    { isVisible ?
                        <div className="modal-right-btn" onClick={handleClick}>
                            <i className="fas fa-chevron-right"></i>
                        </div>
                        :
                        null
                    }
                </div>
            );
        };

        return (
            <div id={`modal-for-post-${targetPostId}`} className="modal-body" onClick={closeModal}>
                <ModalLeftBtn />
                <div className="modal-post">
                    <Post 
                        id={targetPostId}
                        handleCommentButtonClick={null}
                        setCardIsClicked={setCardIsClicked}    
                    />
                </div>
                <ModalRightBtn />
            </div>
        );
    };

    return (
        <div className="card-container">
            {postsToDisplay.map(post => {
                return (
                    <div key={post.id} id={post.id}>
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
                );
            })}

            { cardIsClicked ? 
                <div className="modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <span className="close" onClick={closeModal}>
                                &times;
                            </span>
                        </div>
                        <Modal targetPostId={targetPostId} />
                    </div>
                </div>
                :
                null
            }
        </div>
    );

};

export default Cards;