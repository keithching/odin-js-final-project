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
import { useOutletContext } from 'react-router';
import { 
    useParams, 
    useLocation 
} from 'react-router-dom';

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

const Post = (props) => {

    const { id, handleCommentButtonClick, setCardIsClicked } = props;

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

    let { postId } = useParams(); // access by link

    if (!postId) { // access by previewing of card
        if (id) {
            postId = id;
        } 
    }

    // from all available post, find the post owning user
    let postOwner = users.find(user => user.posts.published.find(post => post.id === postId));

    // found the post
    let post = posts.find(post => post.id === postId);

    // like post logic
    // pass as props to like button and like message components
    const [ postIsLiked, setPostIsLiked ] = useState(post.whoLiked.find(each => each.id === currentUser.info.id) ? true : false);

    const likePost = async () => {
        if (document.getElementById(`postLikeBtn-for-${post.id}`).firstChild.classList.contains('far')) {
            // update DB
            const postRef = doc(db, 'posts', post.firebaseId);
            updateDoc(postRef, {
                whoLiked: arrayUnion({
                    id: currentUser.info.id,
                    time: formatISO(Date.now()).toString()
                })
            }).then(result => {
                if (postsMountedRef.current) {
                    setPostIsLiked(true);
                }
            });
        } else {
            const postRef = doc(db, 'posts', post.firebaseId);
            updateDoc(postRef, {
                whoLiked: post.whoLiked.filter(liker => liker.id !== currentUser.info.id)
            }).then(result => {
                if (postsMountedRef.current) {
                    setPostIsLiked(false);
                }
            });
        }
    };

    // create a target to identify what the current reply points to
    // by default it is post
    const [ replyTarget, setReplyTarget ] = useState('post');

    // reply to post logic
    const [ comment, setComment ] = useState(() => {
        if (replyTarget === 'post') {
            return {
                id: uniqid(),
                createdBy: currentUser.info.id,
                timeCreated: formatISO(Date.now()).toString(),
                content: '',
                whoLiked: [],
                repliesToComment: []
            };
        } else {
            return {
                id: uniqid(),
                createdBy: currentUser.info.id,
                timeCreated: formatISO(Date.now()).toString(),
                content: '',
                whoLiked: [],
            };
        }
    });

    // input field change
    const handleChange = (e) => {
        setComment(prev => {
            return {
                ...prev,
                timeCreated: formatISO(Date.now()).toString(),
                content: e.target.value
            };
        });
    };

    // comment submission
    const handleSubmit = async () => {
        if (replyTarget === 'post') { // reply to the post
            const postRef = doc(db, 'posts', post.firebaseId);
            updateDoc(postRef, {
                comments: arrayUnion(comment)
            })
            .then(result => {
                if (postsMountedRef.current) {
                    setComment({
                        id: uniqid(),
                        createdBy: currentUser.info.id,
                        timeCreated: formatISO(Date.now()).toString(),
                        content: '',
                        whoLiked: [],
                        repliesToComment: []
                    });
                }
            });      
        }
        else { // reply to a comment of the post
            let commentId = replyTarget;

            const postRef = doc(db, 'posts', post.firebaseId);
            
            let newComments = [...post.comments];
            for (let i = 0; i < newComments.length; i++) {
                if (newComments[i].id === commentId) {
                    newComments[i] = {
                        ...newComments[i],
                        repliesToComment: newComments[i].repliesToComment.concat(comment)
                    };
                }
            }

            // update the entire document's comments property
            updateDoc(postRef, {
                comments: newComments  
            })
            .then(result => {
                if (postsMountedRef.current) {
                    setComment({
                        id: uniqid(),
                        createdBy: currentUser.info.id,
                        timeCreated: formatISO(Date.now()).toString(),
                        content: '',
                        whoLiked: [],
                    });
                }
            });
        }

        // reset reply target to post
        setReplyTarget('post');
    };

    useEffect(() => {
        let mounted = true;

        // set a new comment template
        if (replyTarget === 'post') {
            if (mounted) {

            }
        } else {
            if (mounted) {

            }
        }

        return () => mounted = false;
    }, [posts, replyTarget]); // update comment if a reply is published or reply target changes


    // save post logic
    const [ isSaved, setIsSaved ] = useState(!!currentUser.posts.saved.find(userSavedPost => userSavedPost.postID === post.id));


    const postsMountedRef = useRef(null);

    // ensure the posts state is updated first after the async task. Further state updates can follow afterwards
    // https://www.debuggr.io/react-update-unmounted-component/
    useEffect(() => { 
        postsMountedRef.current = true;

        return () => postsMountedRef.current = false;
    }, [posts]);


    // save to the user's object
    const savePost = async () => {
        if (document.getElementById(`postSaveBtn-for-${post.id}`).firstChild.classList.contains('far')) {
            const userRef = doc(db, 'users', currentUser.firebaseId);
            updateDoc(userRef, {
                'posts.saved': arrayUnion({
                    postID: post.id,
                    time: formatISO(Date.now()).toString()
                })
            }).then(result => {
                if (postsMountedRef.current) {
                    setIsSaved(true);
                }
            });
        } else {
            const userRef = doc(db, 'users', currentUser.firebaseId);
            updateDoc(userRef, {
                'posts.saved': currentUser.posts.saved.filter(savedPost => savedPost.postID !== post.id)
                })
                .then(result => {
                    if (postsMountedRef.current) {
                        setIsSaved(false);
                    }     
                });
        }
    };

    return (
        <div className="post-container">
            <div className="post-content">
                <div className="post-left">
                    <img src={post.photos} />
                </div>
                <div className="post-right">

                    <div className="post-right-top">
                        <div className="post-grid">
                            <div className="post-grid-left">
                                <div className="post-grid-left-left">
                                    <Avatar 
                                        className="post-avatar" 
                                        avatar={postOwner.info.avatar}
                                        db={db}
                                        storage={storage}
                                        clickable={false}    
                                    />
                                </div>
                                <div className="post-grid-left-right">
                                    <Username className="post-username" username={postOwner.info.username}/>
                                </div>
                            </div>
                            <div className="post-grid-right">
                                <FunctionButtons 
                                    post={post}
                                    setCardIsClicked={setCardIsClicked}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="post-right-middle">
                        <div className="post-grid">
                            <div className="post-grid-left">
                                <div className="post-grid-left-left">
                                    <Avatar 
                                        className="post-avatar" 
                                        avatar={postOwner.info.avatar}
                                        clickable={false} 
                                    />
                                </div>
                                <div className="post-grid-left-right">
                                    <div className="post-grid-row">
                                        <Username className="post-username" username={postOwner.info.username}/>
                                        <Description description={post.description}/>
                                    </div>
                                    <div className="post-grid-row">
                                        <PostTimeLapsed time={post.timeCreated}/>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {post.comments.map(comment => {

                            let commentCreator = users.find(user => user.info.id === comment.createdBy);

                            // pass the comment properties and methods as props to each individual component
                            // then use states in each of the component so the reply and like functionalities can be implemented within

                            return (
                                <div key={comment.id}>
                                    <Comment 
                                        className="post-grids"
                                        post={post}
                                        commentCreator={commentCreator} 
                                        comment={comment} 
                                        replyTarget={replyTarget}
                                        setReplyTarget={setReplyTarget}
                                    />
                                </div>
                            );
                        })}

                    </div>

                    <div className="post-right-mid-bottom">
                    
                            <div className="post-grid">
                                <div className="post-grid-left">
                                    <div className="post-buttons">
                                        <PostLikeButton 
                                            post={post} 
                                            postIsLiked={postIsLiked} 
                                            likePost={likePost} 
                                        />
                                        <PostCommentButton 
                                            handleCommentButtonClick={handleCommentButtonClick}
                                        />
                                    </div>
                                </div>
                                <div className="post-grid-right">
                                    <div className="post-buttons">
                                        <PostSaveButton 
                                            post={post}
                                            isSaved={isSaved}
                                            savePost={savePost}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="post-grid">
                                <div className="post-grid-left">
                                    <div className="post-grid-left-left">
                                        <div className="post-grid-row">
                                            <PostLikedBy 
                                                likedBy={post.whoLiked}
                                                likePost={likePost} 
                                            />
                                        </div>
                                        <div className="post-grid-row">
                                            <PostTimeLapsedLong time={post.timeCreated}/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                    </div>

                    <div className="post-right-bottom">
                        <div className="post-grid">
                            <div className="post-grid-left">
                                <div className="post-grid-left-left">
                                    <PostCommentInput 
                                        message={comment.content} 
                                        handleChange={handleChange} 
                                    />
                                </div>
                            </div>
                            <div className="post-grid-right">
                                <PostCommentSubmit 
                                    message={comment.content} 
                                    handleSubmit={handleSubmit}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
    );
};

export default Post;