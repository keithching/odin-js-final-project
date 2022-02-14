import { useOutletContext } from 'react-router';
import Avatar from './Avatar';
import Username from './Username';
import FunctionButtons from './FunctionButtons';
import Description from './Description';
import PostTimeLapsed from './PostTimeLapsed';
import Comment from './Comment';
import CommentTimeLapsed from './CommentTimeLapsed';
import CommentContent from './CommentContent';
import CommentLikedBy from './CommentLikedBy';
import CommentReplyButton from './CommentReplyButton';
import CommentLikeButton from './CommentLikeButton';
import PostLikeButton from './PostLikeButton';
import PostCommentButton from './PostCommentButton';
import PostShareButton from './PostShareButton';
import PostSaveButton from './PostSaveButton';
import PostLikedBy from './PostLikedBy';
import PostTimeLapsedLong from './PostTimeLapsedLong';
import PostCommentInput from './PostCommentInput';
import PostCommentSubmit from './PostCommentSubmit';

import { useState, useRef, useEffect } from 'react';
import { formatISO } from 'date-fns';
import uniqid from 'uniqid';

import { 
    getFirestore,
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    onSnapshot,
    setDoc,
    updateDoc,
    doc,
    serverTimestamp,
    getDoc,
    deleteDoc,
    getDocs,
    arrayUnion,
    arrayRemove
} from 'firebase/firestore';

const Flyer = (props) => {
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

    const { flyer, flyers, setFlyers, handleCommentButtonClick } = props;

    // get the flyer's creator's user info
    let flyerCreator = users.find(user => user.info.id === flyer.createdBy);

    // like
    const [ flyerIsLiked, setFlyerIsLiked ] = useState(flyer.whoLiked.find(each => each.id === currentUser.info.id) ? true : false);

    const handleClick = async () => {
        let newPosts = [...flyers];

        if (document.getElementById(`postLikeBtn-for-${flyer.id}`).firstChild.classList.contains('far')) {
            // update DB
            const postRef = doc(db, 'posts', flyer.firebaseId);
            await updateDoc(postRef, {
                whoLiked: arrayUnion({
                    id: currentUser.info.id,
                    time: formatISO(Date.now()).toString()
                })
            })
            .then(result => {
                setFlyerIsLiked(true);
            });

        } else {
            const postRef = doc(db, 'posts', flyer.firebaseId);
            await updateDoc(postRef, {
                whoLiked: flyer.whoLiked.filter(liker => liker.id !== currentUser.info.id)
            })
            .then(result => {
                setFlyerIsLiked(false);
            });
        }
    };

    // save
    const [ isSaved, setIsSaved ] = useState(!!currentUser.posts.saved.find(userSavedPost => userSavedPost.postID === flyer.id));

    const savePost = async () => {
        if (document.getElementById(`postSaveBtn-for-${flyer.id}`).firstChild.classList.contains('far')) {
            const userRef = doc(db, 'users', currentUser.firebaseId);
            await updateDoc(userRef, {
                'posts.saved': arrayUnion({
                    postID: flyer.id,
                    time: formatISO(Date.now()).toString()
                })
            }).then(result => {
                setIsSaved(true);
            });
        } else {
            const userRef = doc(db, 'users', currentUser.firebaseId);
            await updateDoc(userRef, {
                'posts.saved': currentUser.posts.saved.filter(savedPost => savedPost.postID !== flyer.id)
                }).then(result => {
                    setIsSaved(false);
                });
        }
    };

    // reply to post logic
    const [ comment, setComment ] = useState(() => {
            return {
                id: uniqid(),
                createdBy: currentUser.info.id,
                timeCreated: formatISO(Date.now()).toString(),
                content: '',
                whoLiked: [],
                repliesToComment: []
            };
    });

    const handleChange = (e) => {
        setComment(prev => {
            return {
                ...prev,
                timeCreated: formatISO(Date.now()).toString(),
                content: e.target.value
            };
        });
    };

    const handleSubmit = async () => {
        // set posts. add a comment to the post
        const postRef = doc(db, 'posts', flyer.firebaseId);
        await updateDoc(postRef, {
            comments: arrayUnion(comment)
        });        
    };

    useEffect(() => {
        // set a new comment template
        setComment({
            id: uniqid(),
            createdBy: currentUser.info.id,
            timeCreated: formatISO(Date.now()).toString(),
            content: '',
            whoLiked: [],
            repliesToComment: []
        });
    }, [flyers]); // update comment if a reply is published or reply target changes

    return (
        <div className="flyer-container">
            <div className="flyer-top">
                <div className="flyer-grid">
                    <div className="flyer-grid-left">
                        <Avatar 
                            className="flyer-avatar" 
                            avatar={flyerCreator.info.avatar} 
                            db={db}
                            storage={storage}
                            clickable={false}
                        />
                        <Username 
                            className="flyer-username" 
                            username={flyerCreator.info.username} 
                        />
                    </div>
                    <div className="flyer-grid-right">
                        <FunctionButtons 
                            post={flyer}
                        />
                    </div>
                    
                </div>
                
            </div>
            <div className="flyer-middle">
                <img src={flyer.photos} />
            </div>
            <div className="flyer-mid-bottom">
                <div className="flyer-grid">
                    <div className="flyer-grid-left">
                        <div className="flyer-buttons">
                            <PostLikeButton 
                                post={flyer}
                                postIsLiked={flyerIsLiked} 
                                handleClick={handleClick} />
                            <PostCommentButton 
                                handleCommentButtonClick={handleCommentButtonClick}
                            />
                        </div>
                    </div>
                    <div className="flyer-grid-right">
                        <div className="flyer-buttons">
                            <PostSaveButton
                                post={flyer}
                                isSaved={isSaved}
                                savePost={savePost}
                            />
                        </div>
                    </div>
                </div>

                <div className="flyer-grid-rows">
                    <div className="flyer-grid-row">
                        <PostLikedBy 
                            likedBy={flyer.whoLiked}
                            handleClick={handleClick} 
                        />
                    </div>
                    <div className="flyer-grid-row">
                        <Username className="post-username" username={flyerCreator.info.username}/>
                        <Description description={flyer.description}/>
                    </div>
                    <div>
                    </div>
                    <div className="flyer-grid-row">
                        <PostTimeLapsedLong time={flyer.timeCreated} />
                    </div>
                </div>


            </div>
            <div className="flyer-bottom">
                <div className="flyer-grid">
                    <div className="flyer-grid-left">
                        <div className="flyer-grid-left-left">
                            <PostCommentInput 
                                message={comment.content} 
                                handleChange={handleChange} 
                            />
                        </div>
                    </div>
                    <div className="flyer-grid-right">
                        <PostCommentSubmit 
                            message={comment.content} 
                            handleSubmit={handleSubmit}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Flyer;