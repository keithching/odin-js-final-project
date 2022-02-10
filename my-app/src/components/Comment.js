import Avatar from './Avatar';
import Username from './Username';
import CommentTimeLapsed from './CommentTimeLapsed';
import CommentContent from './CommentContent';
import CommentLikedBy from './CommentLikedBy';
import CommentReplyButton from './CommentReplyButton';
import CommentLikeButton from './CommentLikeButton';
import ReplyToComment from './ReplyToComment';

import { useState, useRef } from 'react';
import { useOutletContext } from 'react-router';
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

const Comment = (props) => {

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

    const { className, post, commentCreator, comment, replyTarget, setReplyTarget } = props;

    // update the upstream state if reply button is clicked
    const activateReplyToThisComment = (e) => {
        setReplyTarget(e.target.id);
    };

    // like comment implementation
    // whether current user has like this comment
    const [ commentIsLiked, setCommentIsLiked ] = useState(comment.whoLiked.find(each => each.id === currentUser.info.id));

    const likeComment = async () => {
        // update DB
        // find the post
        const postRef = doc(db, 'posts', post.firebaseId);

        // if comment has not been liked by current user
        if (document.getElementById(`commentLikeBtn-for-${comment.id}`).firstChild.classList.contains('far')) {
            let newComments = [...post.comments];
            for (let i = 0; i < newComments.length; i++) {
                if (newComments[i].id === comment.id) {
                    newComments[i] = {
                        ...newComments[i],
                        whoLiked: newComments[i].whoLiked.concat({
                            id: currentUser.info.id,
                            time: formatISO(Date.now()).toString()
                        })
                    };
                }
            }

            // update the entire document's comments property
            await updateDoc(postRef, {
              comments: newComments  
            }).then(result => {
                setCommentIsLiked(true);
            });


        } else { // if comment has been liked by current user
            let newComments = [...post.comments];
            for (let i = 0; i < newComments.length; i++) {
                if (newComments[i].id === comment.id) {
                    newComments[i] = {
                        ...newComments[i],
                        whoLiked: newComments[i].whoLiked.filter(liker => liker.id !== currentUser.info.id)
                    };
                }
            }

            // update the entire document's comments property
            await updateDoc(postRef, {
              comments: newComments  
            }).then(result => {
                setCommentIsLiked(false);
            });
        }
    };


    return (
        <div className={className}>
            <div className="post-grid">
                <div className="post-grid-left">
                    <div className="post-grid-left-left">
                        <Avatar 
                            className="post-avatar"
                            avatar={commentCreator.info.avatar}
                        />
                    </div>
                    <div className="post-grid-left-right">
                        <div className="post-grid-row">
                            <Username
                                className="post-username"
                                username={commentCreator.info.username}
                            />
                            <CommentContent content={comment.content}/>
                        </div>
                        <div className="post-grid-row">
                            <CommentTimeLapsed time={comment.timeCreated}/>
                            <CommentLikedBy 
                                likedBy={comment.whoLiked} 
                            />
                            <CommentReplyButton 
                                comment={comment}
                                activateReplyToThisComment={activateReplyToThisComment}
                            />
                        </div>
                    </div>
                </div>
                <div className="post-grid-right">
                    <CommentLikeButton 
                        commentIsLiked={commentIsLiked}
                        likeComment={likeComment}
                        comment={comment}
                    />
                </div>
            </div>

            {comment.repliesToComment.map(replyToComment => {

                let replyCreatorId = replyToComment.createdBy;
                let replyCreator = users.find(user => user.info.id === replyCreatorId);

                return (
                    <div key={replyToComment.id}>
                        <ReplyToComment 
                            className="post-grids"
                            post={post}
                            replyCreator={replyCreator} 
                            comment={comment} 
                            replyToComment={replyToComment}
                            replyTarget={replyTarget}
                            setReplyTarget={setReplyTarget}
                        />
                    </div>
                );
            })}


        </div>
    );
};

export default Comment;