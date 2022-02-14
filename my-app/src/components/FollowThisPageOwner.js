import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router';
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

const FollowThisPageOwner = (props) => {

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

    const { pageOwner } = props;

    const getFollowingStatus = () => {
        return !!pageOwner.followers.find(each => each.userID === currentUser.info.id);
    }

   // follow and unfollow
   const [ hasFollowed, setHasFollowed ] = useState(false);

    useEffect(() => {
        setHasFollowed(getFollowingStatus());
    }, [pageOwner]);

   const unfollow = () => {
       setHasFollowed(false);
   };

   const follow = () => {
       setHasFollowed(true);
   };

   let ref = useRef(false);
   useEffect(async () => {
       if (!ref.current) {
           ref.current = true;
       } else {
            const currentUserRef = doc(db, 'users', currentUser.firebaseId);
            const pageOwnerRef = doc(db, 'users', pageOwner.firebaseId);

           if (!hasFollowed) { // unfollow
               await updateDoc(currentUserRef, {
                   following: currentUser.following.filter(each => each.userID !== pageOwner.info.id)
               });

               await updateDoc(pageOwnerRef, {
                    followers: pageOwner.followers.filter(each => each.userID !== currentUser.info.id)
               });
           } else { // follow
                if (!pageOwner.followers.find(each => each.userID === currentUser.info.id)) {
                    await updateDoc(currentUserRef, {
                        following: arrayUnion({
                            userID: pageOwner.info.id,
                            time: formatISO(Date.now()).toString()
                        })
                    });
     
                    await updateDoc(pageOwnerRef, {
                         followers: arrayUnion({
                            userID: currentUser.info.id,
                            time: formatISO(Date.now()).toString()
                         })
                    });
                }
           }
       }
   }, [hasFollowed]);

    return (
        <div>
            {hasFollowed ? 
                <button onClick={unfollow} className="profile-followed-btn">
                    <i className="fas fa-user"></i>
                    <i className="fas fa-check"></i>
                </button> 
                : 
                <button onClick={follow} className="profile-to-follow-btn">
                    Follow
                </button>
            }      
        </div>
    );
};

export default FollowThisPageOwner;