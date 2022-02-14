import Avatar from './Avatar';
import Username from './Username';
import CommentTimeLapsed from './CommentTimeLapsed';
import CommentContent from './CommentContent';
import CommentLikedBy from './CommentLikedBy';
import CommentReplyButton from './CommentReplyButton';
import CommentLikeButton from './CommentLikeButton';
import { useOutletContext } from 'react-router';
import { useState, useEffect, useRef } from 'react';
import { formatISO } from 'date-fns';

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

const ReplyToComment = (props) => {

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

    const { className, post, replyCreator, comment, replyToComment, replyTarget, setReplyTarget } = props;

    // update the upstream state if reply button is clicked
    const activateReplyToThisComment = (e) => {
        setReplyTarget(e.target.id);
    };

    // like reply to comment implementation
    // whether current user has like this reply to comment
    const [ replyToCommentIsLiked, setReplyToCommentIsLiked ] = useState(replyToComment.whoLiked.find(each => each.id === currentUser.info.id));
    
    const postsMountedRef = useRef(null);
    useEffect(() => { 
        postsMountedRef.current = true;

        return () => postsMountedRef.current = false;
    }, [posts]);

    const likeReplyToComment = async () => {
        
        const postRef = doc(db, 'posts', post.firebaseId);

        // if reply to comment has not been liked by current user
        if (document.getElementById(`commentLikeBtn-for-${replyToComment.id}`).firstChild.classList.contains('far')) {
            let newComments = [...post.comments];
            for (let i = 0; i < newComments.length; i++) {
                for (let j = 0; j < newComments[i].repliesToComment.length; j++) {
                    if (newComments[i].repliesToComment[j].id === replyToComment.id) {
                        newComments[i].repliesToComment[j] = {
                            ...newComments[i].repliesToComment[j],
                            whoLiked: newComments[i].repliesToComment[j].whoLiked.concat({
                                id: currentUser.info.id,
                                time: formatISO(Date.now()).toString()
                            })
                        };
                    }
                }
            }

            updateDoc(postRef, {
                comments: newComments
            }).then(result => {
                if (postsMountedRef.current) {
                    setReplyToCommentIsLiked(true);
                }
            });

        } else { // if reply to comment has been liked by current user
            let newComments = [...post.comments];
            for (let i = 0; i < newComments.length; i++) {
                for (let j = 0; j < newComments[i].repliesToComment.length; j++) {
                    if (newComments[i].repliesToComment[j].id === replyToComment.id) {
                        newComments[i].repliesToComment[j] = {
                            ...newComments[i].repliesToComment[j],
                            whoLiked: newComments[i].repliesToComment[j].whoLiked.filter(liker => liker.id !== currentUser.info.id)
                        };
                    }
                }
            }

            updateDoc(postRef, {
                comments: newComments
            }).then(result => {
                if (postsMountedRef.current) {
                    setReplyToCommentIsLiked(false);
                }
            });
        }
    };

    return (
        <div className={className}>
            <div className="post-grid">
                <div className="post-grid-left-margin">
                    <div className="post-grid-left">
                        <div className="post-grid-left-left">
                            <Avatar 
                                className="post-avatar"
                                avatar={replyCreator.info.avatar}
                            />
                        </div>
                        <div className="post-grid-left-right">
                            <div className="post-grid-row">
                                <Username
                                    className="post-username"
                                    username={replyCreator.info.username}
                                />
                                <CommentContent content={replyToComment.content}/>
                            </div>
                            <div className="post-grid-row">
                                <CommentTimeLapsed time={replyToComment.timeCreated}/>
                                <CommentLikedBy 
                                    likedBy={replyToComment.whoLiked} 
                                />
                                <CommentReplyButton 
                                    comment={comment}
                                    activateReplyToThisComment={activateReplyToThisComment}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="post-grid-right">
                    <CommentLikeButton 
                        commentIsLiked={replyToCommentIsLiked}
                        likeComment={likeReplyToComment}
                        comment={replyToComment}
                    />
                </div>
            </div>
        </div>
    );
};

export default ReplyToComment;